import { DEFAULT_TOKENS, DEFAULT_TOKEN_NAME } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'

export function usePresetTokens() {
  const { chainId, library } = useActiveWeb3React()
  return useMemo(() => {
    if (!chainId || !library || !DEFAULT_TOKENS[chainId]) {
      return []
    }
    return [
      DEFAULT_TOKENS[chainId]![DEFAULT_TOKEN_NAME.WETH],
      DEFAULT_TOKENS[chainId]![DEFAULT_TOKEN_NAME.USDC],
      DEFAULT_TOKENS[chainId]![DEFAULT_TOKEN_NAME.USDT],
      DEFAULT_TOKENS[chainId]![DEFAULT_TOKEN_NAME.DAI]
    ]
  }, [library, chainId])
}
