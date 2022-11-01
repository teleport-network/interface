import { CurrencyAmount, Pair, Token, TokenAmount } from '@teleswap/sdk'
import { GaugeType } from 'constants/farm/gauge.enum'
import { CHAINID_TO_GAUGES, Gauge, LiquidityAsset } from 'constants/gauges.config'
import { UNI } from 'constants/index'
import { PairState, usePairs } from 'data/Reserves'
import { BigNumber } from 'ethers'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'
import { useTokenBalances } from 'state/wallet/hooks'

import { useChefContractForCurrentChain } from './useChefContract'
import { ChefPosition, useChefPositions } from './useChefPositions'

interface AdditionalStakingInfo {
  /**
   * the `Token` object that generated from `lpToken` address
   */
  stakingToken: Token
  /**
   * `stakingPair` is null if this is no a LP Token
   */
  stakingPair: [PairState, Pair | null]
  tvl?: TokenAmount

  parsedData?: {
    stakedAmount: string
    pendingReward: string
  }

  stakedAmount: TokenAmount
  pendingReward: TokenAmount
  rewardDebt: CurrencyAmount
  rewardToken: Token

  /**
   * add `id` to identify a pool since we have filter now
   */
  id: number
}
export type ChefStakingInfo = Gauge & AdditionalStakingInfo

export function useChefStakingInfo(): ChefStakingInfo[] {
  const { chainId } = useActiveWeb3React()
  const mchefContract = useChefContractForCurrentChain()
  const farmingConfig = CHAINID_TO_GAUGES[chainId || 420]
  // @todo: include rewardToken in the farmingConfig
  const rewardToken = UNI[chainId || 420]

  const positions = useChefPositions(mchefContract, undefined, chainId)

  const stakingTokens = useMemo(() => {
    return (farmingConfig || []).map((gaugeInfo) => {
      const { stakingAsset, type } = gaugeInfo
      const getPairAddress = (lpAsset: LiquidityAsset) =>
        Pair.getAddress(lpAsset.tokenA, lpAsset.tokenB, type === GaugeType.STABLE)
      return new Token(
        chainId || 420,
        !stakingAsset.isLpToken ? stakingAsset.address : getPairAddress(stakingAsset),
        gaugeInfo.stakingAsset.decimal || 18,
        !gaugeInfo.stakingAsset.isLpToken ? gaugeInfo?.stakingAsset.symbol : `${gaugeInfo.stakingAsset.name} LP`,
        gaugeInfo.stakingAsset.name
      )
    })
  }, [farmingConfig, chainId])

  const stakingPairAsset: [Token | undefined, Token | undefined, boolean | undefined][] = (farmingConfig || []).map(
    ({ stakingAsset, type }) => {
      if (!stakingAsset.isLpToken) {
        return [undefined, undefined, undefined]
      } else {
        return [stakingAsset.tokenA, stakingAsset.tokenB, type === GaugeType.STABLE] as [Token, Token, boolean]
      }
    }
  )
  const pairs = usePairs(stakingPairAsset)
  const tvls = useTokenBalances(mchefContract?.address, stakingTokens)

  return (farmingConfig || []).map((info, idx) => {
    const stakingToken = stakingTokens[idx] as Token
    const tvl = stakingToken ? tvls[stakingToken.address] : undefined
    const position = positions[idx]
    const parsedData = {
      pendingReward: parsedPendingRewardTokenAmount(position, rewardToken),
      stakedAmount: parsedStakedTokenAmount(position, stakingToken)
    }
    return {
      // @todo: id should be a string that represent the gauge contract address
      id: idx,
      ...info,
      stakingToken,
      tvl,
      stakingPair: pairs[idx],
      parsedData,
      rewardToken,
      stakedAmount: new TokenAmount(stakingToken, position.amount.toBigInt()),
      pendingReward: new TokenAmount(rewardToken, position.pendingSushi.toBigInt()),
      rewardDebt: CurrencyAmount.fromRawAmount(rewardToken, position.rewardDebt.toBigInt())
    }
  })
}

/** Some utils to help our hook fns */

const parsedStakedTokenAmount = (position: ChefPosition, stakingToken: Token) => {
  try {
    if (position.amount) {
      const bi = position.amount.toBigInt()
      return CurrencyAmount.fromRawAmount(stakingToken, bi)?.toSignificant(4)
    }
  } catch (error) {
    console.error('parsedStakedAmount::error', error)
  }
  return '--.--'
}

const parsedPendingRewardTokenAmount = (position: ChefPosition, rewardToken: Token) => {
  try {
    if (position && position.pendingSushi) {
      const bi = (position.pendingSushi as BigNumber).toBigInt()
      return CurrencyAmount.fromRawAmount(rewardToken, bi).toSignificant(4)
    }
  } catch (error) {
    console.error('parsedPendingSushiAmount::error', error)
  }
  return '--.--'
}
