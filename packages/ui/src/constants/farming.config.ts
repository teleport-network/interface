import { ChainId, Token, WETH } from '@teleswap/sdk'
import { UNI, USDC, USDT } from 'constants/index'

import { Chef } from './farm/chef.enum'

export interface LiquidityAsset {
  name: string
  decimal: 18
  isLpToken: true
  isStable: boolean

  tokenA: Token
  tokenB: Token
}

export interface TokenAsset {
  name: string
  decimal: number
  /**
   * `isLpToken` - this affect the way for our evaluation of the staked asset and its logo
   */
  isLpToken: false
  symbol: string
}

type StakingAsset = TokenAsset | LiquidityAsset

export interface FarmingPool {
  /**
   * this control whether the pool will be hidden or not (if user have no deposit in this pool)
   */
  isHidden?: boolean

  stakingAsset: StakingAsset
}

interface FarmConfig {
  chefType: Chef
  chainId: ChainId
  /**
   * @Note
   * here is the tricky part. `pools` must be added in the seqenuce of the `poolInfo` in chef's contract
   */
  pools: (FarmingPool | undefined)[]
}
/**
 * @deprecated
 * we will go with Curve's Gauge farming, so no more masterchef
 * please checkout `gauges.config.ts` for farming config
 * THIS FILE SHOULD BE REMOVED AFTER
 * FRONTEND have IMPLEMENTED ALL GAUGE's FEATURES
 */
export const CHAINID_TO_FARMING_CONFIG: { [chainId in ChainId]?: FarmConfig } = {
  [ChainId.OP_GOERLI]: {
    chefType: Chef.MINICHEF,
    chainId: ChainId.OP_GOERLI,
    pools: [
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        // pid 8
        stakingAsset: {
          name: 'USDC-USDT',
          decimal: 18,
          isLpToken: true,
          isStable: true,
          tokenA: USDC,
          tokenB: USDT
        }
      },
      {
        // pid 9
        stakingAsset: {
          name: 'USDC-ETH',
          decimal: 18,
          isLpToken: true,
          isStable: false,
          tokenA: USDC,
          tokenB: WETH[420]
        }
      },
      {
        // pid 10
        stakingAsset: {
          name: 'USDC-SUSHI',
          decimal: 18,
          isLpToken: true,
          isStable: false,
          tokenA: USDC,
          tokenB: UNI[420]
        }
      }
    ]
  }
}
