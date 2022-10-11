import { GaugeType } from 'constants/farm/gauge.enum'
import { BigNumber } from 'ethers'
import { useActiveWeb3React } from 'hooks'
import { useGaugeProxyContract } from 'hooks/useContract'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

export function useGetUserVotes(gaugeType: GaugeType, tokenAddresses: string[]) {
  const { account } = useActiveWeb3React()
  const [gaugeProxy] = useGaugeProxyContract(gaugeType)
  /**
   * wrapping the query arg for each query request
   */
  const args = account ? tokenAddresses.map((addr) => [account, addr]) : []
  /**
   * query user's vote
   * @warning for AdminGauge, there are no vote,
   * they are equally distrubted. so no query for admin gauge
   */
  const results = useSingleContractMultipleData(gaugeType !== GaugeType.ADMIN ? gaugeProxy : null, 'votes', args)
  const parsedVotes = results.map((callState) =>
    !!callState.result?.[0] ? (callState.result?.[0] as BigNumber) : undefined
  )

  return parsedVotes
}
