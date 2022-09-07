import { Currency, Ether, NativeCurrency, Token } from '@teleswap/sdk-core';

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  OPTIMISTIC_GOERLI = 420,
}

// WIP: Gnosis, Moonbeam
export const SUPPORTED_CHAINS: ChainId[] = [
  ChainId.MAINNET,
  ChainId.RINKEBY,
  ChainId.ROPSTEN,
  ChainId.GÖRLI,
  ChainId.OPTIMISTIC_GOERLI,
];

export const V2_SUPPORTED = [
  ChainId.MAINNET,
  ChainId.GÖRLI,
  ChainId.RINKEBY,
  ChainId.ROPSTEN,
  ChainId.OPTIMISTIC_GOERLI,
];

export const HAS_L1_FEE = [ChainId.OPTIMISTIC_GOERLI];

export const NETWORKS_WITH_SAME_UNISWAP_ADDRESSES = [
  ChainId.MAINNET,
  ChainId.ROPSTEN,
  ChainId.RINKEBY,
  ChainId.GÖRLI,
  ChainId.OPTIMISTIC_GOERLI,
];

export const ID_TO_CHAIN_ID = (id: number): ChainId => {
  switch (id) {
    case 1:
      return ChainId.MAINNET;
    case 3:
      return ChainId.ROPSTEN;
    case 4:
      return ChainId.RINKEBY;
    case 5:
      return ChainId.GÖRLI;
    case 420:
      return ChainId.OPTIMISTIC_GOERLI;
    default:
      throw new Error(`Unknown chain id: ${id}`);
  }
};

export enum ChainName {
  MAINNET = 'mainnet',
  ROPSTEN = 'ropsten',
  RINKEBY = 'rinkeby',
  GÖRLI = 'goerli',
  OPTIMISTIC_GOERLI = 'optimistic goerli',
}

export enum NativeCurrencyName {
  // Strings match input for CLI
  ETHER = 'ETH',
  MATIC = 'MATIC',
  CELO = 'CELO',
  GNOSIS = 'XDAI',
  MOONBEAM = 'GLMR',
}

export const NATIVE_NAMES_BY_ID: { [chainId: number]: string[] } = {
  [ChainId.MAINNET]: [
    'ETH',
    'ETHER',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
  [ChainId.RINKEBY]: [
    'ETH',
    'ETHER',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
  [ChainId.GÖRLI]: [
    'ETH',
    'ETHER',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
  [ChainId.ROPSTEN]: [
    'ETH',
    'ETHER',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
  [ChainId.OPTIMISTIC_GOERLI]: [
    'ETH',
    'ETHER',
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  ],
};

export const NATIVE_CURRENCY: { [chainId: number]: NativeCurrencyName } = {
  [ChainId.MAINNET]: NativeCurrencyName.ETHER,
  [ChainId.ROPSTEN]: NativeCurrencyName.ETHER,
  [ChainId.RINKEBY]: NativeCurrencyName.ETHER,
  [ChainId.GÖRLI]: NativeCurrencyName.ETHER,
  [ChainId.OPTIMISTIC_GOERLI]: NativeCurrencyName.ETHER,
};

export const ID_TO_NETWORK_NAME = (id: number): ChainName => {
  switch (id) {
    case 1:
      return ChainName.MAINNET;
    case 3:
      return ChainName.ROPSTEN;
    case 4:
      return ChainName.RINKEBY;
    case 5:
      return ChainName.GÖRLI;
    case 420:
      return ChainName.OPTIMISTIC_GOERLI;
    default:
      throw new Error(`Unknown chain id: ${id}`);
  }
};

export const CHAIN_IDS_LIST = Object.values(ChainId).map((c) =>
  c.toString(),
) as string[];

export const ID_TO_PROVIDER = (id: ChainId): string => {
  switch (id) {
    case ChainId.MAINNET:
      return process.env.JSON_RPC_PROVIDER!;
    case ChainId.ROPSTEN:
      return process.env.JSON_RPC_PROVIDER_ROPSTEN!;
    case ChainId.RINKEBY:
      return process.env.JSON_RPC_PROVIDER_RINKEBY!;
    case ChainId.GÖRLI:
      return process.env.JSON_RPC_PROVIDER_GORLI!;
    case ChainId.OPTIMISTIC_GOERLI:
      return process.env.JSON_RPC_PROVIDER_OPTIMISTIC_GOERLI!;
    default:
      throw new Error(`Chain id: ${id} not supported`);
  }
};

export const WRAPPED_NATIVE_CURRENCY: { [chainId in ChainId]: Token } = {
  [ChainId.MAINNET]: new Token(
    1,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [ChainId.ROPSTEN]: new Token(
    3,
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [ChainId.RINKEBY]: new Token(
    4,
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [ChainId.GÖRLI]: new Token(
    5,
    '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    18,
    'WETH',
    'Wrapped Ether',
  ),
  [ChainId.OPTIMISTIC_GOERLI]: new Token(
    420,
    '0x3D810bB0feDdCE224E3E1903B4629AB113EF9523',
    18,
    'WETH',
    'Wrapped Ether',
  ),
};

export class ExtendedEther extends Ether {
  public get wrapped(): Token {
    if (this.chainId in WRAPPED_NATIVE_CURRENCY)
      return WRAPPED_NATIVE_CURRENCY[this.chainId as ChainId];
    throw new Error('Unsupported chain ID');
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } =
    {};

  public static onChain(chainId: number): ExtendedEther {
    return (
      this._cachedExtendedEther[chainId] ??
      (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
    );
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency } = {};
export function nativeOnChain(chainId: number): NativeCurrency {
  if (cachedNativeCurrency[chainId] != undefined)
    return cachedNativeCurrency[chainId]!;
  cachedNativeCurrency[chainId] = ExtendedEther.onChain(chainId);
  return cachedNativeCurrency[chainId]!;
}
