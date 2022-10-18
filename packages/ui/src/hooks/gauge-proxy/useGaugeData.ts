import StableGaugeABI from '@teleswap/contracts/build/StableGauge.json'
import { GaugeType } from 'constants/farm/gauge.enum'
import { Interface } from 'ethers/lib/utils'
import { useActiveWeb3React } from 'hooks'
import { useGaugeContract } from 'hooks/useContract'
import { useMultipleContractSingleData, useSingleCallResult } from 'state/multicall/hooks'

export function useGaugeData(gaugeType: GaugeType, gaugeAddress: string) {
  const [contract] = useGaugeContract(gaugeType, gaugeAddress)
  const { account } = useActiveWeb3React()
  const totalSupply = useSingleCallResult(contract, 'totalSupply')
  const lastTimeRewardApplicable = useSingleCallResult(contract, 'lastTimeRewardApplicable')
  const rewardPerToken = useSingleCallResult(contract, 'rewardPerToken')

  const balanceOf = useSingleCallResult(!!account ? contract : null, 'balanceOf', [account as string])
  const derivedBalance = useSingleCallResult(!!account ? contract : null, 'derivedBalance', [account as string])
  const earned = useSingleCallResult(!!account ? contract : null, 'earned', [account as string])

  return { totalSupply, lastTimeRewardApplicable, rewardPerToken, balanceOf, derivedBalance, earned }
}

/**
 * Since useGaugesData's method are same accross the 3 gauges
 * we just use StableGaugeABI
 */
const IGauge = new Interface(StableGaugeABI)

export function useGaugesData(gaugeList: { type: GaugeType; address: string }[]) {
  const { account } = useActiveWeb3React()
  const addresses = gaugeList.map(({ address }) => address)

  const totalSupplies = useMultipleContractSingleData(addresses, IGauge, 'totalSupply')
  const lastTimeRewardsApplicable = useMultipleContractSingleData(addresses, IGauge, 'lastTimeRewardApplicable')
  const rewardsPerToken = useMultipleContractSingleData(addresses, IGauge, 'rewardPerToken')

  const balancesOf = useMultipleContractSingleData(addresses, IGauge, 'balanceOf', [account as string])
  const derivedBalances = useMultipleContractSingleData(addresses, IGauge, 'derivedBalance', [account as string])
  const earnedInGauges = useMultipleContractSingleData(addresses, IGauge, 'earned', [account as string])

  return addresses.map((gaugeAddress, idx) => {
    return {
      gaugeAddress,
      totalSupply: totalSupplies[idx],
      lastTimeRewardApplicable: lastTimeRewardsApplicable[idx],
      rewardPerToken: rewardsPerToken[idx],
      balanceOf: balancesOf[idx],
      derivedBalance: derivedBalances[idx],
      earned: earnedInGauges[idx]
    }
  })
}
