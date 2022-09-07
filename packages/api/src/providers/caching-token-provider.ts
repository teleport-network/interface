import { Token } from '@uniswap/sdk-core';
import _ from 'lodash';

import { ChainId, log, WRAPPED_NATIVE_CURRENCY } from '../util';

import { ICache } from './cache';
import {
  DAI_MAINNET,
  DAI_OPTIMISTIC_GOERLI,
  DAI_RINKEBY_1,
  DAI_RINKEBY_2,
  ITokenProvider,
  TokenAccessor,
  USDC_MAINNET,
  USDC_OPTIMISTIC_GOERLI,
  USDT_MAINNET,
  USDT_OPTIMISTIC_GOERLI,
  WBTC_MAINNET,
  WBTC_OPTIMISTIC_GOERLI,
} from './token-provider';

// These tokens will added to the Token cache on initialization.
export const CACHE_SEED_TOKENS: {
  [chainId in ChainId]?: { [symbol: string]: Token };
} = {
  [ChainId.MAINNET]: {
    WETH: WRAPPED_NATIVE_CURRENCY[ChainId.MAINNET]!,
    USDC: USDC_MAINNET,
    USDT: USDT_MAINNET,
    WBTC: WBTC_MAINNET,
    DAI: DAI_MAINNET,
    // This token stores its symbol as bytes32, therefore can not be fetched on-chain using
    // our token providers.
    // This workaround adds it to the cache, so we won't try to fetch it on-chain.
    RING: new Token(
      ChainId.MAINNET,
      '0x9469D013805bFfB7D3DEBe5E7839237e535ec483',
      18,
      'RING',
      'RING',
    ),
  },
  [ChainId.RINKEBY]: {
    WETH: WRAPPED_NATIVE_CURRENCY[ChainId.RINKEBY]!,
    DAI_1: DAI_RINKEBY_1,
    DAI_2: DAI_RINKEBY_2,
  },
  [ChainId.OPTIMISTIC_GOERLI]: {
    USDC: USDC_OPTIMISTIC_GOERLI,
    USDT: USDT_OPTIMISTIC_GOERLI,
    WBTC: WBTC_OPTIMISTIC_GOERLI,
    DAI: DAI_OPTIMISTIC_GOERLI,
  },
};

/**
 * Provider for getting token metadata that falls back to a different provider
 * in the event of failure.
 *
 * @export
 * @class CachingTokenProviderWithFallback
 */
export class CachingTokenProviderWithFallback implements ITokenProvider {
  private CACHE_KEY = (chainId: ChainId, address: string) =>
    `token-${chainId}-${address}`;

  constructor(
    protected chainId: ChainId,
    // Token metadata (e.g. symbol and decimals) don't change so can be cached indefinitely.
    // Constructing a new token object is slow as sdk-core does checksumming.
    private tokenCache: ICache<Token>,
    protected primaryTokenProvider: ITokenProvider,
    protected fallbackTokenProvider?: ITokenProvider,
  ) {}

  public async getTokens(_addresses: string[]): Promise<TokenAccessor> {
    const seedTokens = CACHE_SEED_TOKENS[this.chainId];

    if (seedTokens) {
      for (const token of Object.values(seedTokens)) {
        await this.tokenCache.set(
          this.CACHE_KEY(this.chainId, token.address.toLowerCase()),
          token,
        );
      }
    }

    const addressToToken: { [address: string]: Token } = {};
    const symbolToToken: { [symbol: string]: Token } = {};

    const addresses = _(_addresses)
      .map((address) => address.toLowerCase())
      .uniq()
      .value();

    const addressesToFindInPrimary = [];
    const addressesToFindInSecondary = [];

    for (const address of addresses) {
      if (await this.tokenCache.has(this.CACHE_KEY(this.chainId, address))) {
        addressToToken[address.toLowerCase()] = (await this.tokenCache.get(
          this.CACHE_KEY(this.chainId, address),
        ))!;
        symbolToToken[addressToToken[address]!.symbol!] =
          (await this.tokenCache.get(this.CACHE_KEY(this.chainId, address)))!;
      } else {
        addressesToFindInPrimary.push(address);
      }
    }

    log.info(
      { addressesToFindInPrimary },
      `Found ${addresses.length - addressesToFindInPrimary.length} out of ${
        addresses.length
      } tokens in local cache. ${
        addressesToFindInPrimary.length > 0
          ? `Checking primary token provider for ${addressesToFindInPrimary.length} tokens`
          : ``
      }
      `,
    );

    if (addressesToFindInPrimary.length > 0) {
      const primaryTokenAccessor = await this.primaryTokenProvider.getTokens(
        addressesToFindInPrimary,
      );

      for (const address of addressesToFindInPrimary) {
        const token = primaryTokenAccessor.getTokenByAddress(address);

        if (token) {
          addressToToken[address.toLowerCase()] = token;
          symbolToToken[addressToToken[address]!.symbol!] = token;
          await this.tokenCache.set(
            this.CACHE_KEY(this.chainId, address.toLowerCase()),
            addressToToken[address]!,
          );
        } else {
          addressesToFindInSecondary.push(address);
        }
      }

      log.info(
        { addressesToFindInSecondary },
        `Found ${
          addressesToFindInPrimary.length - addressesToFindInSecondary.length
        } tokens in primary. ${
          this.fallbackTokenProvider
            ? `Checking secondary token provider for ${addressesToFindInSecondary.length} tokens`
            : `No fallback token provider specified. About to return.`
        }`,
      );
    }

    if (this.fallbackTokenProvider && addressesToFindInSecondary.length > 0) {
      const secondaryTokenAccessor = await this.fallbackTokenProvider.getTokens(
        addressesToFindInSecondary,
      );

      for (const address of addressesToFindInSecondary) {
        const token = secondaryTokenAccessor.getTokenByAddress(address);
        if (token) {
          addressToToken[address.toLowerCase()] = token;
          symbolToToken[addressToToken[address]!.symbol!] = token;
          await this.tokenCache.set(
            this.CACHE_KEY(this.chainId, address.toLowerCase()),
            addressToToken[address]!,
          );
        }
      }
    }

    return {
      getTokenByAddress: (address: string): Token | undefined => {
        return addressToToken[address.toLowerCase()];
      },
      getTokenBySymbol: (symbol: string): Token | undefined => {
        return symbolToToken[symbol.toLowerCase()];
      },
      getAllTokens: (): Token[] => {
        return Object.values(addressToToken);
      },
    };
  }
}
