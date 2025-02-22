import JSBI from 'jsbi'

// exports for external consumption
export type BigintIsh = JSBI | bigint | string

export enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  OP_GOERLI = 420,
}

export enum PERIPHERY_NAME {
  FACTORY = 'FACTORY',
  ROUTER = 'ROUTER',
}

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

// const initCodeHash = Web3.utils.keccak256(artifact.bytecode)

export const INIT_CODE_HASH = '0xe0cf174e82555225473e368bef3eb6936c950332a77998fe479d23a0ee1b5ccf'

type CONTRACT_ADDRESS_TYPE = {
  [x in ChainId]?: {
    [s in PERIPHERY_NAME]: string
  }
}

export const CONTRACT_ADDRESS: CONTRACT_ADDRESS_TYPE = {
  [ChainId.OP_GOERLI]: {
    [PERIPHERY_NAME.FACTORY]: '0x663C2f4EbF4F61b4C2be7D99b03a000Af394C56B',
    [PERIPHERY_NAME.ROUTER]: '0x644F905CdF7C17b2F6b5fC3352a1a044d1702a36',
    /* },
    defaultTokens: {
      [DEFAULT_TOKEN_NAME.WETH]: '0x4200000000000000000000000000000000000006',
      [DEFAULT_TOKEN_NAME.USDT]: '0x5986C8FfADCA9cee5C28A85cC3d4F335aab5Dc90',
      [DEFAULT_TOKEN_NAME.USDC]: '0x53B1c6025E3f9B149304Cf1B39ee7c577d76c6Ca',
      [DEFAULT_TOKEN_NAME.DAI]: '0xb9297783D0D568dc378e23D5BA9C32031a4A5132',
    }, */
  },
}
/*
export const FACTORY_ADDRESS = '0xCa368eA3e9D45704B4bB08D40f0628018c892e4E'
export const ROUTER_ADDRESS = '0xBD86b34E6a136bfd4D417342Ca04c6e3F7Ab7614'
export const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
export const USDT_ADDRESS = '0x5986C8FfADCA9cee5C28A85cC3d4F335aab5Dc90'
export const USDC_ADDRESS = '0x53B1c6025E3f9B149304Cf1B39ee7c577d76c6Ca'
export const DAI_ADDRESS = '0xb9297783D0D568dc378e23D5BA9C32031a4A5132' */

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const TWO = JSBI.BigInt(2)
export const THREE = JSBI.BigInt(3)
export const FIVE = JSBI.BigInt(5)
export const TEN = JSBI.BigInt(10)
export const _100 = JSBI.BigInt(100)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)
export const _10000 = JSBI.BigInt(10000)

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256',
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}
