import { Pair, Token, TokenAmount } from '@teleswap/sdk'
import { GaugeType } from 'constants/farm/gauge.enum'
import { CHAINID_TO_GAUGES, Gauge, LiquidityAsset } from 'constants/gauges.config'
import { UNI } from 'constants/index'
import { PairState, usePairs } from 'data/Reserves'
import { BigNumber } from 'ethers'
import { useActiveWeb3React } from 'hooks'
import { useGaugesData } from 'hooks/gauge-proxy/useGaugeData'
import { useMemo } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'

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

  stakedAmount: TokenAmount
  /**
   * it differs from `stakedAmount`
   * as `derivedStakedAmount` is depends by staked amount *AND* vxTELE that user have
   * please refer `derivedBalance` func in Gauge contract for the calculation
   */
  derivedStakedAmount: TokenAmount
  pendingReward: TokenAmount
  rewardToken: Token
  rewardRate: TokenAmount
  /**
   * add `id` to identify a pool since we have filter now
   */
  id: number

  /**
   * not important but might be needed props
   */
  lastTimeRewardApplicable: ReturnType<typeof useSingleCallResult>
  rewardPerToken: TokenAmount
}
export type ChefStakingInfo = Gauge & AdditionalStakingInfo

export function useChefStakingInfo(): ChefStakingInfo[] {
  const { chainId } = useActiveWeb3React()
  const farmingConfig = useMemo(() => {
    return CHAINID_TO_GAUGES[chainId || 420] || []
  }, [chainId])
  // @todo: include rewardToken in the farmingConfig
  const rewardToken = UNI[chainId || 420]

  const stakingTokens = useMemo(() => {
    return farmingConfig.map((gaugeInfo) => {
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

  const stakingPairAsset: [Token | undefined, Token | undefined, boolean | undefined][] = farmingConfig.map(
    ({ stakingAsset, type }) => {
      if (!stakingAsset.isLpToken) {
        return [undefined, undefined, undefined]
      } else {
        return [stakingAsset.tokenA, stakingAsset.tokenB, type === GaugeType.STABLE] as [Token, Token, boolean]
      }
    }
  )
  const pairs = usePairs(stakingPairAsset)
  const datas = useGaugesData(farmingConfig)

  const allGauges = farmingConfig.map((info, idx) => {
    const stakingToken = stakingTokens[idx]
    const gaugeData = datas[idx]
    const pendingReward = BigIntParserForCallState(gaugeData.earned)
    const rewardPerToken = BigIntParserForCallState(gaugeData.rewardPerToken)
    const rewardRate = BigIntParserForCallState(gaugeData.rewardRate)
    return {
      // @todo: id should be a string that represent the gauge contract address
      id: idx,
      ...info,
      stakingToken,
      tvl: new TokenAmount(stakingToken, BigIntParserForCallState(gaugeData.totalSupply)),
      stakingPair: pairs[idx],
      rewardToken,
      stakedAmount: new TokenAmount(stakingToken, BigIntParserForCallState(gaugeData.balanceOf)),
      derivedStakedAmount: new TokenAmount(stakingToken, BigIntParserForCallState(gaugeData.derivedBalance)),
      pendingReward: new TokenAmount(rewardToken, pendingReward),
      // not important but might be needed props
      lastTimeRewardApplicable: gaugeData.lastTimeRewardApplicable,
      rewardPerToken: new TokenAmount(rewardToken, rewardPerToken),
      rewardRate: new TokenAmount(rewardToken, rewardRate)
    }
  })

  return allGauges
}

function BigIntParserForCallState(cStateWithBN: ReturnType<typeof useSingleCallResult>, idx = 0) {
  if (cStateWithBN.loading || !cStateWithBN.result) return BigNumber.from(0).toBigInt()
  return (cStateWithBN.result[idx] as BigNumber).toBigInt()
}
