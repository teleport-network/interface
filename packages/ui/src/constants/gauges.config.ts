import { ChainId, Token, WETH } from '@teleswap/sdk'
import { USDC, USDT } from 'constants/index'

import { GaugeType } from './farm/gauge.enum'

export interface LiquidityAsset {
  isLpToken: true
  name: string
  decimal: 18
  symbol: 'SLP' | 'VLP'

  tokenA: Token
  tokenB: Token
}

export interface TokenAsset {
  /**
   * `isLpToken` - this affect the way for our evaluation of the staked asset and its logo
   */
  isLpToken: false
  address: string
  name: string
  decimal: number

  symbol: string
}

type StakingAsset = TokenAsset | LiquidityAsset

export type Gauge = {
  type: GaugeType
  address: string
  stakingAsset: StakingAsset
}

export type Gauges = Gauge[]

const GAUGES_FOR_OP_GOERLI: Gauges = [
  {
    type: GaugeType.VARIABLE,
    address: '0x3b647042B5621C074b43f20230bf62fBfF8010F1',
    stakingAsset: {
      isLpToken: true,
      name: 'WETH/USDC',
      decimal: 18,
      symbol: 'VLP',

      tokenA: WETH[ChainId.OP_GOERLI],
      tokenB: USDC
    }
  },
  {
    type: GaugeType.STABLE,
    address: '0x58B391d13BD71c10675b9c7a408772DAC38fe705',
    stakingAsset: {
      isLpToken: true,
      name: 'USDT/USDC',
      decimal: 18,
      symbol: 'SLP',
      tokenA: USDT,
      tokenB: USDC
    }
  }
]

export const CHAINID_TO_GAUGES: { [chainId in ChainId]?: Gauges } = {
  [ChainId.OP_GOERLI]: GAUGES_FOR_OP_GOERLI
}
