import { ChainId } from '@teleswap/smart-order-router'
import { route } from './slice'

test('routing', async () => {
  const result = await route({
    tokenInAddress: '0x4603cff6498c46583300fc5f1c31f872f5514182',
    tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenInSymbol: 'USDC',
    tokenInDecimals: 18,
    tokenOutAddress: 'ETH',
    tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenOutSymbol: 'ETH',
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
