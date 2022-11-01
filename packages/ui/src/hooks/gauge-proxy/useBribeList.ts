import { GaugeType } from 'constants/farm/gauge.enum'
import { useGaugeProxyContract } from 'hooks/useContract'
import { useSingleContractMultipleData } from 'state/multicall/hooks'

export function useBribeAddresses(gaugeType: GaugeType, gaugeAddresses: string[]) {
  const [gaugeProxy] = useGaugeProxyContract(gaugeType)
  /**
   * wrapping the query arg for each query request
   */
  const args = gaugeAddresses.map((addr) => [addr])
  /**
   * query their gauges address
   */
  const results = useSingleContractMultipleData(gaugeAddresses ? gaugeProxy : null, 'bribes', args)
  const parsedBribeAddresses = results.map((callState) =>
    !!callState.result?.[0] ? (callState.result?.[0] as string) : undefined
  )

  return parsedBribeAddresses
}
