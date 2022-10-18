import { CONTRACT_ADDRESS, PERIPHERY_NAME } from '@teleswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'

export function usePresetPeripheryAddress(): { [s in PERIPHERY_NAME]?: string } {
  const { library, chainId } = useActiveWeb3React()

  return useMemo(() => {
    if (!chainId || !library) {
      return {
        [PERIPHERY_NAME.FACTORY]: undefined,
        [PERIPHERY_NAME.ROUTER]: undefined
      }
    }
    return {
      [PERIPHERY_NAME.FACTORY]: CONTRACT_ADDRESS[chainId]?.FACTORY,
      [PERIPHERY_NAME.ROUTER]: CONTRACT_ADDRESS[chainId]?.ROUTER
    }
  }, [library, chainId])
}
