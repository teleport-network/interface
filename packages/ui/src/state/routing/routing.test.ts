import _Decimal from 'decimal.js-light'
import toFormat from 'toformat'

const Decimal = toFormat(_Decimal)

test('routing', async () => {
  // const result = await route({
  //   tokenInAddress: '0x53B1c6025E3f9B149304Cf1B39ee7c577d76c6Ca',
  //   tokenInChainId: ChainId.OPTIMISTIC_GOERLI,
  //   tokenInDecimals: 18,
  //   tokenOutAddress: '0x4200000000000000000000000000000000000006',
  //   tokenOutChainId: ChainId.OPTIMISTIC_GOERLI,
  //   tokenOutDecimals: 18,
  //   amount: '10000000000000000000000',
  //   type: 'exactIn',
  //   slippageTolerance: '50'
  // })
  // console.log(
  //   'debug joy',
  //   result,
  //   result.data.priceImpactWithoutFee.toSignificant(4),
  //   result.data.realizedLPFee.toSignificant(4)
  // )
  // console.log('debug joy', result.data.route)
  console.log(Decimal('1.1111').mul(Decimal(10000)).toString())
}, 100000)
