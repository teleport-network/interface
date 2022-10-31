import { Percent } from '@teleswap/sdk'
import { ChainId } from '@teleswap/smart-order-router'
import { route } from './slice'

test('routing', async () => {
  const result = await route({
    tokenInAddress: 'ETH',
    tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenInSymbol: 'ETH',
    tokenInDecimals: 18,
    tokenOutAddress: '0x4603cff6498c46583300fc5f1c31f872f5514182',
    tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenOutSymbol: 'USDT',
    tokenOutDecimals: 18,
    amount: '1000000000000000000',
    type: 'exactIn',
    slippageTolerance: '0.5'
  })
  console.log(
    'debug joy',
    JSON.stringify(result),
    result.data.priceImpactWithoutFee.toSignificant(4),
    result.data.realizedLPFee.toSignificant(4),
    result.data.maxIn.toSignificant(4),
    result.data.minOut.toSignificant(4)
  )
}, 100000)

test('percent', () => {
  // 0.5 => 0.5%
  const slippagePer10k = Math.round(parseFloat('0.5') * 100).toString()
  console.log(slippagePer10k)
  console.log(new Percent(slippagePer10k, '1000000').toSignificant(4))
}, 10000)
