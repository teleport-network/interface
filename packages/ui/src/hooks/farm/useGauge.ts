import { BigNumber } from '@ethersproject/bignumber'
import { GaugeType } from 'constants/farm/gauge.enum'
import { useGaugeContract } from 'hooks/useContract'
import { useCallback } from 'react'

export default function useGauge(gaugeType: GaugeType, gaugeAddress: string) {
  const [contract] = useGaugeContract(gaugeType, gaugeAddress)

  // Deposit
  const deposit = useCallback(
    async (amount: BigNumber) => {
      try {
        const tx = await contract?.deposit(amount)

        return tx
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract]
  )

  // Withdraw
  const withdraw = useCallback(
    async (amount: BigNumber) => {
      try {
        const tx = await contract?.withdraw(amount)
        return tx
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [contract]
  )

  const harvest = useCallback(async () => {
    try {
      const tx = await contract?.getReward()

      return tx
    } catch (e) {
      console.error(e)
      return e
    }
  }, [contract])

  return { deposit, withdraw, harvest }
}
