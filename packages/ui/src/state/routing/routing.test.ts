import { ChainId } from '@teleswap/smart-order-router'
import { route } from './slice'

test('routing', async () => {
  const result = await route({
    tokenInAddress: '0xD4bD7d51972a49c26b3e20Cc080d5cB356A485F6',
    tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenInDecimals: 18,
    tokenOutAddress: '0x53B1c6025E3f9B149304Cf1B39ee7c577d76c6Ca',
    tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenOutDecimals: 18,
    amount: '10000000000000000000000',
    type: 'exactIn',
    slippageTolerance: '50'
  })
  console.log(
    'debug joy',
    result,
    result.data.priceImpactWithoutFee.toSignificant(4),
    result.data.realizedLPFee.toSignificant(4)
  )
  console.log('debug joy', result.data.route)
}, 100000)
