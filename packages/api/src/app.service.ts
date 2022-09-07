import { Injectable } from '@nestjs/common';
import { Currency, CurrencyAmount, Token } from '@teleswap/sdk-core';
import {
  AlphaRouter,
  AlphaRouterConfig,
  SwapOptions,
  SwapRoute,
} from './routers';
import {
  ChainId,
  ID_TO_CHAIN_ID,
  metric,
  MetricLoggerUnit,
  routeAmountsToString,
  setGlobalLogger,
} from './util';
import {
  DEFAULT_ROUTING_CONFIG_BY_CHAIN,
  parseDeadline,
  parseSlippageTolerance,
  tokenStringToCurrency,
} from './shared';
import {
  CachingTokenListProvider,
  CachingTokenProviderWithFallback,
  NodeJSCache,
  OnChainQuoteProvider,
  TokenProvider,
  UniswapMulticallProvider,
  V2PoolProvider,
} from './providers';
import { ethers } from 'ethers';
import {
  ErrorResponse,
  PoolInRoute,
  QuoteQueryParams,
  QuoteResponse,
  Response,
  V2PoolInRoute,
} from './app.module';
import { DEFAULT_TOKENS } from './util/default-tokens';
import NodeCache from 'node-cache';
import { UNSUPPORTED_TOKENS } from './util/unsupported-tokens';
import { default as bunyan, default as Logger } from 'bunyan';
import { Protocol } from '@uniswap/router-sdk';
import _ from 'lodash';
import JSBI from 'jsbi';
import { TradeType } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  protected chainId: ChainId = ID_TO_CHAIN_ID(420);

  public async getQuote(
    params: QuoteQueryParams,
  ): Promise<Response<QuoteResponse> | ErrorResponse> {
    let before = Date.now();

    const {
      tokenInAddress,
      tokenInChainId,
      tokenOutAddress,
      tokenOutChainId,
      amount: amountRaw,
      type,
      recipient,
      slippageTolerance,
      deadline,
      minSplits,
      forceCrossProtocol,
      forceMixedRoutes,
      protocols: protocolsStr,
      simulateFromAddress,
    } = params;

    const url = process.env.WEB3_RPC_OPGOERLI;
    const provider = new ethers.providers.JsonRpcProvider(
      {
        url: url,
        timeout: 5000,
      },
      this.chainId,
    );
    const tokenCache = new NodeJSCache<Token>(
      new NodeCache({ stdTTL: 3600, useClones: false }),
    );
    const blockedTokenCache = new NodeJSCache<Token>(
      new NodeCache({ stdTTL: 3600, useClones: false }),
    );
    const multicall2Provider = new UniswapMulticallProvider(
      this.chainId,
      provider,
      375_000,
    );
    const tokenListProvider = new CachingTokenListProvider(
      this.chainId,
      DEFAULT_TOKENS,
      tokenCache,
    );
    const tokenProvider = new CachingTokenProviderWithFallback(
      this.chainId,
      tokenCache,
      tokenListProvider,
      new TokenProvider(this.chainId, multicall2Provider),
    );
    const quoteProvider = new OnChainQuoteProvider(
      this.chainId,
      provider,
      multicall2Provider,
      {
        retries: 2,
        minTimeout: 100,
        maxTimeout: 1000,
      },
      {
        multicallChunk: 110,
        gasLimitPerCall: 1_200_000,
        quoteMinSuccessRate: 0.1,
      },
      {
        gasLimitOverride: 3_000_000,
        multicallChunk: 45,
      },
      {
        gasLimitOverride: 3_000_000,
        multicallChunk: 45,
      },
      {
        baseBlockOffset: -25,
        rollback: {
          enabled: true,
          attemptsBeforeRollback: 1,
          rollbackBlockOffset: -20,
        },
      },
    );
    const blockedTokenListProvider = new CachingTokenListProvider(
      this.chainId,
      UNSUPPORTED_TOKENS,
      blockedTokenCache,
    );

    const poolProvider = new V2PoolProvider(this.chainId, multicall2Provider);

    const log: Logger = bunyan.createLogger({
      name: 'api',
      serializers: bunyan.stdSerializers,
      level: bunyan.INFO,
    });
    setGlobalLogger(log);

    const router = new AlphaRouter({
      chainId: 420,
      provider: provider,
    });

    const currencyIn = await tokenStringToCurrency(
      tokenListProvider,
      tokenProvider,
      tokenInAddress,
      tokenInChainId,
      log,
    );

    const currencyOut = await tokenStringToCurrency(
      tokenListProvider,
      tokenProvider,
      tokenOutAddress,
      tokenOutChainId,
      log,
    );

    metric.putMetric(
      'TokenInOutStrToToken',
      Date.now() - before,
      MetricLoggerUnit.Milliseconds,
    );

    if (!currencyIn) {
      return {
        statusCode: 400,
        errorCode: 'TOKEN_IN_INVALID',
        detail: `Could not find token with address "${tokenInAddress}"`,
      };
    }

    if (!currencyOut) {
      return {
        statusCode: 400,
        errorCode: 'TOKEN_OUT_INVALID',
        detail: `Could not find token with address "${tokenOutAddress}"`,
      };
    }

    if (tokenInChainId != tokenOutChainId) {
      return {
        statusCode: 400,
        errorCode: 'TOKEN_CHAINS_DIFFERENT',
        detail: `Cannot request quotes for tokens on different chains`,
      };
    }

    if (currencyIn.equals(currencyOut)) {
      return {
        statusCode: 400,
        errorCode: 'TOKEN_IN_OUT_SAME',
        detail: `tokenIn and tokenOut must be different`,
      };
    }

    const protocols: Protocol[] = [Protocol.V2];

    const routingConfig: AlphaRouterConfig = {
      ...DEFAULT_ROUTING_CONFIG_BY_CHAIN(this.chainId),
      ...(minSplits ? { minSplits } : {}),
      ...(forceCrossProtocol ? { forceCrossProtocol } : {}),
      ...(forceMixedRoutes ? { forceMixedRoutes } : {}),
      protocols,
    };

    let swapParams: SwapOptions | undefined = undefined;

    if (slippageTolerance && deadline && recipient) {
      const slippageTolerancePercent =
        parseSlippageTolerance(slippageTolerance);
      swapParams = {
        deadline: parseDeadline(deadline),
        recipient: recipient,
        slippageTolerance: slippageTolerancePercent,
      };
      if (simulateFromAddress) {
        metric.putMetric('Simulation Requested', 1, MetricLoggerUnit.Count);
        swapParams.simulate = { fromAddress: simulateFromAddress };
      }
    }

    before = Date.now();

    let swapRoute: SwapRoute | null;
    let amount: CurrencyAmount<Currency>;
    let tokenPairSymbol = '';
    let tokenPairSymbolChain = '';
    if (currencyIn.symbol && currencyOut.symbol) {
      tokenPairSymbol = _([currencyIn.symbol, currencyOut.symbol]).join('/');
      tokenPairSymbolChain = `${tokenPairSymbol}/${this.chainId}}`;
    }

    const [token0Symbol, token0Address, token1Symbol, token1Address] =
      currencyIn.wrapped.sortsBefore(currencyOut.wrapped)
        ? [
            currencyIn.symbol,
            currencyIn.wrapped.address,
            currencyOut.symbol,
            currencyOut.wrapped.address,
          ]
        : [
            currencyOut.symbol,
            currencyOut.wrapped.address,
            currencyIn.symbol,
            currencyIn.wrapped.address,
          ];

    switch (type) {
      case 'exactIn':
        amount = CurrencyAmount.fromRawAmount(
          currencyIn,
          JSBI.BigInt(amountRaw),
        );
        log.info(
          {
            amountIn: amount.toExact(),
            token0Address,
            token1Address,
            token0Symbol,
            token1Symbol,
            tokenInSymbol: currencyIn.symbol,
            tokenOutSymbol: currencyOut.symbol,
            tokenPairSymbol,
            tokenPairSymbolChain,
            type,
            routingConfig: routingConfig,
          },
          `Exact In Swap: Give ${amount.toExact()} ${
            amount.currency.symbol
          }, Want: ${currencyOut.symbol}. Chain: ${this.chainId}`,
        );
        swapRoute = await router.route(
          amount,
          currencyOut,
          TradeType.EXACT_INPUT,
          swapParams,
          routingConfig,
        );
        break;
      case 'exactOut':
        amount = CurrencyAmount.fromRawAmount(
          currencyOut,
          JSBI.BigInt(amountRaw),
        );
        log.info(
          {
            amountOut: amount.toExact(),
            token0Address,
            token1Address,
            token0Symbol,
            token1Symbol,
            tokenInSymbol: currencyIn.symbol,
            tokenOutSymbol: currencyOut.symbol,
            tokenPairSymbol,
            tokenPairSymbolChain,
            type,
            routingConfig: routingConfig,
          },
          `Exact Out Swap: Want ${amount.toExact()} ${
            amount.currency.symbol
          } Give: ${currencyIn.symbol}. Chain: ${this.chainId}`,
        );

        swapRoute = await router.route(
          amount,
          currencyIn,
          TradeType.EXACT_OUTPUT,
          swapParams,
          routingConfig,
        );
        break;
      default:
        throw new Error('Invalid swap type');
    }

    if (!swapRoute) {
      log.info(
        {
          type,
          tokenIn: currencyIn,
          tokenOut: currencyOut,
          amount: amount.quotient.toString(),
        },
        `No route found. 404`,
      );
      return {
        statusCode: 404,
        errorCode: 'NO_ROUTE',
        detail: 'No route found',
      };
    }

    const {
      quote,
      quoteGasAdjusted,
      route,
      estimatedGasUsed,
      estimatedGasUsedQuoteToken,
      estimatedGasUsedUSD,
      gasPriceWei,
      methodParameters,
      blockNumber,
      simulationError,
    } = swapRoute;

    if (simulationError) {
      metric.putMetric(
        'FailedSimulation',
        Date.now() - before,
        MetricLoggerUnit.Milliseconds,
      );
    } else {
      metric.putMetric(
        'SuccessfulSimulation',
        Date.now() - before,
        MetricLoggerUnit.Milliseconds,
      );
    }

    const routeResponse: Array<PoolInRoute[]> = [];

    for (const subRoute of route) {
      const { amount, quote, tokenPath } = subRoute;

      const pools =
        subRoute.protocol == Protocol.V2
          ? subRoute.route.pairs
          : subRoute.route.pools;
      const curRoute: PoolInRoute[] = [];

      for (let i = 0; i < pools.length; i++) {
        const nextPool = pools[i];
        const tokenIn = tokenPath[i];
        const tokenOut = tokenPath[i + 1];

        let edgeAmountIn = undefined;
        if (i == 0) {
          edgeAmountIn =
            type == 'exactIn'
              ? amount.quotient.toString()
              : quote.quotient.toString();
        }

        let edgeAmountOut = undefined;
        if (i == pools.length - 1) {
          edgeAmountOut =
            type == 'exactOut'
              ? quote.quotient.toString()
              : amount.quotient.toString();
        }

        if (nextPool instanceof Pool) {
          // TODO: ignore v3 pool
        } else {
          const reserve0 = nextPool.reserve0;
          const reserve1 = nextPool.reserve1;

          curRoute.push({
            type: 'teleswap-pool',
            address: poolProvider.getPoolAddress(
              nextPool.token0,
              nextPool.token1,
            ).poolAddress,
            tokenIn: {
              chainId: tokenIn.chainId,
              decimals: tokenIn.decimals.toString(),
              address: tokenIn.address,
              symbol: tokenIn.symbol!,
            },
            tokenOut: {
              chainId: tokenOut.chainId,
              decimals: tokenOut.decimals.toString(),
              address: tokenOut.address,
              symbol: tokenOut.symbol!,
            },
            reserve0: {
              token: {
                chainId: reserve0.currency.wrapped.chainId,
                decimals: reserve0.currency.wrapped.decimals.toString(),
                address: reserve0.currency.wrapped.address,
                symbol: reserve0.currency.wrapped.symbol!,
              },
              quotient: reserve0.quotient.toString(),
            },
            reserve1: {
              token: {
                chainId: reserve1.currency.wrapped.chainId,
                decimals: reserve1.currency.wrapped.decimals.toString(),
                address: reserve1.currency.wrapped.address,
                symbol: reserve1.currency.wrapped.symbol!,
              },
              quotient: reserve1.quotient.toString(),
            },
            amountIn: edgeAmountIn,
            amountOut: edgeAmountOut,
          });
        }
      }

      routeResponse.push(curRoute);
    }

    const result: QuoteResponse = {
      methodParameters,
      blockNumber: blockNumber.toString(),
      amount: amount.quotient.toString(),
      amountDecimals: amount.toExact(),
      quote: quote.quotient.toString(),
      quoteDecimals: quote.toExact(),
      quoteGasAdjusted: quoteGasAdjusted.quotient.toString(),
      quoteGasAdjustedDecimals: quoteGasAdjusted.toExact(),
      gasUseEstimateQuote: estimatedGasUsedQuoteToken.quotient.toString(),
      gasUseEstimateQuoteDecimals: estimatedGasUsedQuoteToken.toExact(),
      gasUseEstimate: estimatedGasUsed.toString(),
      gasUseEstimateUSD: estimatedGasUsedUSD.toExact(),
      simulationError,
      gasPriceWei: gasPriceWei.toString(),
      route: routeResponse,
      routeString: routeAmountsToString(route),
      // TODO: debug joy, fix
      quoteId: '',
    };

    return {
      statusCode: 200,
      body: result,
    };
  }
}
