import { ChainId } from '@teleswap/smart-order-router'
import { route } from './slice'

test('routing', async () => {
  const result = await route({
    tokenInAddress: '0x4200000000000000000000000000000000000006',
    tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenInSymbol: 'WETH',
    tokenInDecimals: 18,
    tokenOutAddress: '0x0537139Ca66C4ccd2a3ED16D7414EF0F9d9bf320',
    tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenOutSymbol: 'USDT',
    tokenOutDecimals: 18,
    amount: '80000000000000000000',
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
