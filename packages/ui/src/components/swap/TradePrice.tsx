import { Trade } from '@teleswap/sdk'
import SwapSwichPriceUnit from 'assets/svg/swap-swich-price-unit.svg'
import BigNumber from 'bignumber.js'
import useThemedContext from 'hooks/useThemedContext'
import { Text } from 'rebass'

import { StyledBalanceMaxMini } from './styleds'

interface TradePriceProps {
  trade?: Trade
  showInverted: boolean
  setShowInverted: (showInverted: boolean) => void
}

export default function TradePrice({ trade, showInverted, setShowInverted }: TradePriceProps) {
  const theme = useThemedContext()
  const routeData = trade!.routeData
  const tradeType = trade!.tradeType
  const amountStringA = tradeType === 0 ? routeData.amountDecimals : routeData.quoteDecimals
  const amountStringB = tradeType === 0 ? routeData.quoteDecimals : routeData.amountDecimals
  const symbolA = routeData.inputAmount.currency.symbol
  const symbolB = routeData.outputAmount.currency.symbol
  const formattedPrice = showInverted ? new BigNumber(amountStringA).dividedBy(amountStringB).toFixed(4) : new BigNumber(amountStringB).dividedBy(amountStringA).toFixed(4)

  const show = Boolean(symbolA && symbolB)
  const label = showInverted
    ? `${symbolA} per ${symbolB}`
    : `${symbolB} per ${symbolA}`

  return (
    <Text
      className="text"
      fontWeight={400}
      color={theme.text2}
      style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}
    >
      {show ? (
        <>
          {formattedPrice ?? '-'} {label}
          <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
            <img src={SwapSwichPriceUnit} alt="swap-swich-price-unit" style={{ height: '1.5rem', width: '1.5rem' }} />
          </StyledBalanceMaxMini>
        </>
      ) : (
        '-'
      )}
    </Text>
  )
}
