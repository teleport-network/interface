import JSBI from 'jsbi'
import Web3 from 'web3'
import { CONTRACT_ADDRESS } from '@teleswap/sdk';
import { ChainId } from '@teleswap/sdk';
import factoryJSON from '@teleswap/contracts/artifacts/contracts/TeleswapV2Factory.sol/TeleswapV2Factory.json'

// TODO: ChainID is hard code
export const FACTORY_ADDRESS = CONTRACT_ADDRESS[ChainId.OP_GOERLI]!.FACTORY

export const INIT_CODE_HASH = Web3.utils.keccak256(factoryJSON.bytecode)

export const MINIMUM_LIQUIDITY = JSBI.BigInt(1000)

// exports for internal consumption
export const ZERO = JSBI.BigInt(0)
export const ONE = JSBI.BigInt(1)
export const FIVE = JSBI.BigInt(5)
export const _997 = JSBI.BigInt(997)
export const _1000 = JSBI.BigInt(1000)
export const _9999 = JSBI.BigInt(9999)
export const _10000 = JSBI.BigInt(10000)
export const _1e18 = JSBI.BigInt(1e18)
export const _1e36 = JSBI.BigInt(1e36)
export const _1e54 = JSBI.BigInt(1e54)

