import { ChainId } from '@teleswap/smart-order-router'

import JSBI from 'jsbi'
import { getY, route } from './slice'

test('calc', () => {
  const re = getY(JSBI.BigInt(18000 * 1e18), JSBI.BigInt(2 * 1e34))
}, 100000)

test('routing', async () => {
  const result = await route({
    tokenInAddress: '0x53b1c6025e3f9b149304cf1b39ee7c577d76c6ca',
    tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenInSymbol: 'USDC',
    tokenInDecimals: 18,
    tokenOutAddress: '0x5986c8ffadca9cee5c28a85cc3d4f335aab5dc90',
    tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenOutSymbol: 'USDT',
    tokenOutDecimals: 18,
    amount: '8000000000000000000000',
    type: 'exactIn',
    slippageTolerance: '50'
  })
  console.log(
    'debug joy',
    JSON.stringify(result),
    result.data.priceImpactWithoutFee.toSignificant(4),
    result.data.realizedLPFee.toSignificant(4)
  )
}, 100000)
