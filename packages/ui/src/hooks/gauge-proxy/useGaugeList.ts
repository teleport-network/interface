import { GaugeType } from 'constants/farm/gauge.enum'
import { useGaugeProxyContract } from 'hooks/useContract'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

export function useGaugeAddresses(gaugeType: GaugeType, tokenAddresses: string[]) {
  const [gaugeProxy] = useGaugeProxyContract(gaugeType)
  /**
   * wrapping the query arg for each query request
   */
  const args = tokenAddresses.map((tokenAddress) => [tokenAddress])
  /**
   * query their gauges address
   */
  const results = useSingleContractMultipleData(tokenAddresses ? gaugeProxy : null, 'gauges', args)
  const parsedGaugeAddresses = results.map((callState) =>
    !!callState.result?.[0] ? (callState.result?.[0] as string) : undefined
  )

  return parsedGaugeAddresses
}
