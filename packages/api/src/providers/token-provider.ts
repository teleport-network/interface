import { Token } from '@teleswap/sdk-core';
import _ from 'lodash';

import { IERC20Metadata__factory } from '../types/v3/factories/IERC20Metadata__factory';
import { ChainId, log, WRAPPED_NATIVE_CURRENCY } from '../util';

import { IMulticallProvider } from './multicall-provider';
import { ProviderConfig } from './provider';

/**
 * Provider for getting token data.
 *
 * @export
 * @interface ITokenProvider
 */
export interface ITokenProvider {
  /**
   * Gets the token at each address. Any addresses that are not valid ERC-20 are ignored.
   *
   * @param addresses The token addresses to get.
   * @param [providerConfig] The provider config.
   * @returns A token accessor with methods for accessing the tokens.
   */
  getTokens(
    addresses: string[],
    providerConfig?: ProviderConfig,
  ): Promise<TokenAccessor>;
}

export type TokenAccessor = {
  getTokenByAddress(address: string): Token | undefined;
  getTokenBySymbol(symbol: string): Token | undefined;
  getAllTokens: () => Token[];
};

// Some well known tokens on each chain for seeding cache / testing.
export const USDC_MAINNET = new Token(
  ChainId.MAINNET,
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  6,
  'USDC',
  'USD//C',
);
export const USDT_MAINNET = new Token(
  ChainId.MAINNET,
  '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  6,
  'USDT',
  'Tether USD',
);
export const WBTC_MAINNET = new Token(
  ChainId.MAINNET,
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  8,
  'WBTC',
  'Wrapped BTC',
);
export const DAI_MAINNET = new Token(
  ChainId.MAINNET,
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  18,
  'DAI',
  'Dai Stablecoin',
);
export const FEI_MAINNET = new Token(
  ChainId.MAINNET,
  '0x956F47F50A910163D8BF957Cf5846D573E7f87CA',
  18,
  'FEI',
  'Fei USD',
);
export const UNI_MAINNET = new Token(
  ChainId.MAINNET,
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  18,
  'UNI',
  'Uniswap',
);

export const USDC_ROPSTEN = new Token(
  ChainId.ROPSTEN,
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  6,
  'USDC',
  'USD//C',
);
export const USDT_ROPSTEN = new Token(
  ChainId.ROPSTEN,
  '0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136',
  6,
  'USDT',
  'Tether USD',
);
export const DAI_ROPSTEN = new Token(
  ChainId.ROPSTEN,
  '0xad6d458402f60fd3bd25163575031acdce07538d',
  18,
  'DAI',
  'Dai Stablecoin',
);

export const DAI_RINKEBY_1 = new Token(
  ChainId.RINKEBY,
  '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea',
  18,
  'DAI',
  'DAI',
);
export const DAI_RINKEBY_2 = new Token(
  ChainId.RINKEBY,
  '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735',
  18,
  'DAI',
  'DAI',
);
export const USDC_RINKEBY = new Token(
  ChainId.RINKEBY,
  '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b',
  6,
  'tUSDC',
  'test USD//C',
);
export const USDT_RINKEBY = new Token(
  ChainId.RINKEBY,
  '0xa689352b7c1cad82864beb1d90679356d3962f4d',
  18,
  'USDT',
  'Tether USD',
);

export const USDC_GÖRLI = new Token(
  ChainId.GÖRLI,
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f',
  6,
  'USDC',
  'USD//C',
);
export const USDT_GÖRLI = new Token(
  ChainId.GÖRLI,
  '0xe583769738b6dd4e7caf8451050d1948be717679',
  18,
  'USDT',
  'Tether USD',
);
export const WBTC_GÖRLI = new Token(
  ChainId.GÖRLI,
  '0xa0a5ad2296b38bd3e3eb59aaeaf1589e8d9a29a9',
  8,
  'WBTC',
  'Wrapped BTC',
);
export const DAI_GÖRLI = new Token(
  ChainId.GÖRLI,
  '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844',
  18,
  'DAI',
  'Dai Stablecoin',
);
export const UNI_GÖRLI = new Token(
  ChainId.GÖRLI,
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  18,
  'UNI',
  'Uni token',
);

export const USDC_OPTIMISTIC_GOERLI = new Token(
  ChainId.OPTIMISTIC_GOERLI,
  '0x3b8e53b3ab8e01fb57d0c9e893bc4d655aa67d84',
  6,
  'USDC',
  'USD//C',
);
export const USDT_OPTIMISTIC_GOERLI = new Token(
  ChainId.OPTIMISTIC_GOERLI,
  '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
  6,
  'USDT',
  'Tether USD',
);
export const WBTC_OPTIMISTIC_GOERLI = new Token(
  ChainId.OPTIMISTIC_GOERLI,
  '0x2382a8f65b9120E554d1836a504808aC864E169d',
  8,
  'WBTC',
  'Wrapped BTC',
);
export const DAI_OPTIMISTIC_GOERLI = new Token(
  ChainId.OPTIMISTIC_GOERLI,
  '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
  18,
  'DAI',
  'Dai Stablecoin',
);

export class TokenProvider implements ITokenProvider {
  constructor(
    private chainId: ChainId,
    protected multicall2Provider: IMulticallProvider,
  ) {}

  public async getTokens(
    _addresses: string[],
    providerConfig?: ProviderConfig,
  ): Promise<TokenAccessor> {
    const addressToToken: { [address: string]: Token } = {};
    const symbolToToken: { [symbol: string]: Token } = {};

    const addresses = _(_addresses)
      .map((address) => address.toLowerCase())
      .uniq()
      .value();

    if (addresses.length > 0) {
      const [symbolsResult, decimalsResult] = await Promise.all([
        this.multicall2Provider.callSameFunctionOnMultipleContracts<
          undefined,
          [string]
        >({
          addresses,
          contractInterface: IERC20Metadata__factory.createInterface(),
          functionName: 'symbol',
          providerConfig,
        }),
        this.multicall2Provider.callSameFunctionOnMultipleContracts<
          undefined,
          [number]
        >({
          addresses,
          contractInterface: IERC20Metadata__factory.createInterface(),
          functionName: 'decimals',
          providerConfig,
        }),
      ]);

      const { results: symbols } = symbolsResult;
      const { results: decimals } = decimalsResult;

      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i]!;

        const symbolResult = symbols[i];
        const decimalResult = decimals[i];

        if (!symbolResult?.success || !decimalResult?.success) {
          log.info(
            {
              symbolResult,
              decimalResult,
            },
            `Dropping token with address ${address} as symbol or decimal are invalid`,
          );
          continue;
        }

        const symbol = symbolResult.result[0]!;
        const decimal = decimalResult.result[0]!;

        addressToToken[address.toLowerCase()] = new Token(
          this.chainId,
          address,
          decimal,
          symbol,
        );
        symbolToToken[symbol.toLowerCase()] =
          addressToToken[address.toLowerCase()]!;
      }

      log.info(
        `Got token symbol and decimals for ${
          Object.values(addressToToken).length
        } out of ${addresses.length} tokens on-chain ${
          providerConfig ? `as of: ${providerConfig?.blockNumber}` : ''
        }`,
      );
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

export const DAI_ON = (chainId: ChainId): Token => {
  switch (chainId) {
    case ChainId.MAINNET:
      return DAI_MAINNET;
    case ChainId.ROPSTEN:
      return DAI_ROPSTEN;
    case ChainId.RINKEBY:
      return DAI_RINKEBY_1;
    case ChainId.GÖRLI:
      return DAI_GÖRLI;
    case ChainId.OPTIMISTIC_GOERLI:
      return DAI_OPTIMISTIC_GOERLI;
    default:
      throw new Error(`Chain id: ${chainId} not supported`);
  }
};

export const USDT_ON = (chainId: ChainId): Token => {
  switch (chainId) {
    case ChainId.MAINNET:
      return USDT_MAINNET;
    case ChainId.ROPSTEN:
      return USDT_ROPSTEN;
    case ChainId.RINKEBY:
      return USDT_RINKEBY;
    case ChainId.GÖRLI:
      return USDT_GÖRLI;
    case ChainId.OPTIMISTIC_GOERLI:
      return USDT_OPTIMISTIC_GOERLI;
    default:
      throw new Error(`Chain id: ${chainId} not supported`);
  }
};

export const USDC_ON = (chainId: ChainId): Token => {
  switch (chainId) {
    case ChainId.MAINNET:
      return USDC_MAINNET;
    case ChainId.ROPSTEN:
      return USDC_ROPSTEN;
    case ChainId.RINKEBY:
      return USDC_RINKEBY;
    case ChainId.GÖRLI:
      return USDC_GÖRLI;
    case ChainId.OPTIMISTIC_GOERLI:
      return USDC_OPTIMISTIC_GOERLI;
    default:
      throw new Error(`Chain id: ${chainId} not supported`);
  }
};

export const WNATIVE_ON = (chainId: ChainId): Token => {
  return WRAPPED_NATIVE_CURRENCY[chainId];
};
