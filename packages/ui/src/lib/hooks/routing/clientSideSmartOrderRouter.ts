// This file is lazy-loaded, so the import of smart-order-router is intentional.
// eslint-disable-next-line no-restricted-imports
import { Fraction, WETH } from '@teleswap/sdk'
import { AlphaRouter, AlphaRouterConfig, ChainId, SwapOptions } from '@teleswap/smart-order-router'
import { BigintIsh, CurrencyAmount, Percent, Token, TradeType } from '@uniswap/sdk-core'
import { SupportedChainId } from 'constants/chains'
import JSBI from 'jsbi'
import { GetQuoteResult } from 'state/routing/types'
import { transformSwapRouteToGetQuoteResult } from 'utils/transformSwapRouteToGetQuoteResult'

export function toSupportedChainId(chainId: ChainId): SupportedChainId | undefined {
  const numericChainId: number = chainId
  if (SupportedChainId[numericChainId]) return numericChainId
  return undefined
}
export function isSupportedChainId(chainId: ChainId | undefined): boolean {
  if (chainId === undefined) return false
  return toSupportedChainId(chainId) !== undefined
}

async function getQuote(
  {
    type,
    tokenIn,
    tokenOut,
    amount: amountRaw
  }: {
    type: 'exactIn' | 'exactOut'
    tokenIn: { address: string; chainId: number; decimals: number; symbol?: string }
    tokenOut: { address: string; chainId: number; decimals: number; symbol?: string }
    amount: BigintIsh
  },
  router: AlphaRouter,
  config: Partial<AlphaRouterConfig>,
  swapConfig?: SwapOptions
): Promise<{ data: GetQuoteResult; error?: unknown }> {
  const currencyIn = new Token(tokenIn.chainId, tokenIn.address, tokenIn.decimals, tokenIn.symbol)
  const currencyOut = new Token(tokenOut.chainId, tokenOut.address, tokenOut.decimals, tokenOut.symbol)

  const baseCurrency = type === 'exactIn' ? currencyIn : currencyOut
  const quoteCurrency = type === 'exactIn' ? currencyOut : currencyIn
  const amount = CurrencyAmount.fromRawAmount(baseCurrency, JSBI.BigInt(amountRaw))

  const swapRoute = await router.route(
    amount,
    quoteCurrency,
    type === 'exactIn' ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    swapConfig,
    config
  )

  if (!swapRoute) {
    return {
      data: {
        invalidRoute: true,
        blockNumber: '',
        amount: '',
        amountDecimals: '',
        gasPriceWei: '',
        gasUseEstimate: '',
        gasUseEstimateQuote: '',
        gasUseEstimateQuoteDecimals: '',
        gasUseEstimateUSD: '',
        quote: '',
        quoteDecimals: '',
        quoteGasAdjusted: '',
        quoteGasAdjustedDecimals: '',
        route: [],
        percents: [],
        routeString: '',
        priceImpactWithoutFee: new Fraction('0'),
        realizedLPFee: new Fraction('0'),
        minOut: amount,
        maxIn: amount
      }
    }
  }

  return { data: transformSwapRouteToGetQuoteResult(type, amount, swapRoute, swapConfig) }
}

export interface QuoteArguments {
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenInDecimals: number
  tokenInSymbol?: string
  tokenOutAddress: string
  tokenOutChainId: ChainId
  tokenOutDecimals: number
  tokenOutSymbol?: string
  amount: string
  type: 'exactIn' | 'exactOut'
  recipient?: string
  slippageTolerance: string
  deadline?: string
}

export async function getClientSideQuote(
  {
    tokenInAddress,
    tokenInChainId,
    tokenInDecimals,
    tokenInSymbol,
    tokenOutAddress,
    tokenOutChainId,
    tokenOutDecimals,
    tokenOutSymbol,
    amount,
    type,
    recipient,
    slippageTolerance,
    deadline
  }: QuoteArguments,
  router: AlphaRouter,
  config: Partial<AlphaRouterConfig>
) {
  const tokenIn = {
    address: tokenInAddress,
    chainId: tokenInChainId,
    decimals: tokenInDecimals,
    symbol: tokenInSymbol
  }
  const tokenOut = {
    address: tokenOutAddress,
    chainId: tokenOutChainId,
    decimals: tokenOutDecimals,
    symbol: tokenOutSymbol
  }
  if (tokenInAddress === 'ETH') {
    tokenIn.address = WETH[tokenInChainId].address
    tokenIn.decimals = WETH[tokenInChainId].decimals
    tokenIn.symbol = WETH[tokenInChainId].symbol
  }
  if (tokenOutAddress === 'ETH') {
    tokenOut.address = WETH[tokenInChainId].address
    tokenOut.decimals = WETH[tokenInChainId].decimals
    tokenOut.symbol = WETH[tokenInChainId].symbol
  }
  return getQuote(
    {
      type,
      tokenIn,
      tokenOut,
      amount
    },
    router,
    config
  )
}

export function parseSlippageTolerance(slippageTolerance: string): Percent {
  const slippagePer10k = Math.round(parseFloat(slippageTolerance) * 100)
  return new Percent(slippagePer10k, 10_000)
}

export function parseDeadline(deadline: string): number {
  return Math.floor(Date.now() / 1000) + parseInt(deadline)
}
