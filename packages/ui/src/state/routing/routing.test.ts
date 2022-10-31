import { Percent } from '@teleswap/sdk'
import { ChainId } from '@teleswap/smart-order-router'
import { route } from './slice'

test('routing', async () => {
  const result = await route({
    tokenInAddress: '0xec6b24429ab7012afc1b083d4e6763f738047792',
    tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenInSymbol: 'USDT',
    tokenInDecimals: 18,
    tokenOutAddress: '0x4200000000000000000000000000000000000006',
    tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
    tokenOutSymbol: 'WETH',
    tokenOutDecimals: 18,
    amount: '1000000000000000000',
    type: 'exactOut',
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
  console.log(new Percent(slippagePer10k, '10000').toSignificant(4))
  console.log(new Percent('1').toSignificant())
}, 10000)
