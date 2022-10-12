import { ChainId, Token } from '@teleswap/sdk'
import { SHARING_PAIRS } from 'constants/index'

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

export const CHAINID_TO_FARMING_CONFIG: { [chainId in ChainId]?: FarmConfig } = {
  [ChainId.OP_GOERLI]: {
    chefType: Chef.MINICHEF,
    chainId: ChainId.OP_GOERLI,
    pools: [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ...SHARING_PAIRS]
  }
}
