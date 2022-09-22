import JSBI from 'jsbi'
import Web3 from 'web3'
import artifact from '@teleswap/contracts/artifacts/contracts/TeleswapV2Pair.sol/TeleswapV2Pair.json'

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

export enum TradeType {
  EXACT_INPUT,
  EXACT_OUTPUT,
}

export enum Rounding {
  ROUND_DOWN,
  ROUND_HALF_UP,
  ROUND_UP,
}

const initCodeHash = Web3.utils.keccak256(artifact.bytecode)



export const INIT_CODE_HASH = initCodeHash

export const FACTORY_ADDRESS = '0x48BFE4d89e9091185Fd3536bF618d5745b139C13'
export const ROUTER_ADDRESS = '0x161bfb60C33fB916CaB5677f905f9398471577B0'
export const WETH_ADDRESS = '0x86B6c370273e4f27D0c989b8EcDAA6D74dadBB9F'
export const USDT_ADDRESS = '0x0298735f44b0AE5E91BF36C6920fbA6c16392A76'
export const USDC_ADDRESS = '0xD385A8D07245eD86B323f1ceBaF32880333133eF'
export const DAI_ADDRESS = '0xA453b732C570F7bd113B8533D686AaD7479062F7'

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

export enum SolidityType {
  uint8 = 'uint8',
  uint256 = 'uint256',
}

export const SOLIDITY_TYPE_MAXIMA = {
  [SolidityType.uint8]: JSBI.BigInt('0xff'),
  [SolidityType.uint256]: JSBI.BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}
