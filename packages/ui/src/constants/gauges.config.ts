import { ChainId, Token } from '@teleswap/sdk'

import { GaugeType } from './farm/gauge.enum'
// import { UNI, USDC, USDT } from 'constants/index'

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

export type Gauges = {
  type: GaugeType
  stakingAsset: StakingAsset
}

export const CHAINID_TO_GAUGES: { [chainId in ChainId]?: Gauges[] } = {
  [ChainId.OP_GOERLI]: []
}
