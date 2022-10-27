import { Trade, TradeType } from '@teleswap/sdk'
// TradeType
import LineVIcon from 'assets/images/tele/lineV.png'
import ArrowHGreen from 'assets/svg/arrowHGreen.svg'
import ArrowHLoneLine from 'assets/svg/arrowHLoneLine.svg'
import arrowShowRoute from 'assets/svg/arrowShowRoute.svg'
import axios from 'axios'
import CurrencyLogo from 'components/CurrencyLogo'
import useThemedContext from 'hooks/useThemedContext'
import { useState } from 'react'
import { Box } from 'rebass'
import styled from 'styled-components'

import { useUserSlippageTolerance } from '../../state/user/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

const InfoLink = styled(ExternalLink)`
  width: 100%;
  border: 1px solid ${({ theme }) => theme.bg3};
  padding: 6px 6px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.text1};
`

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  const theme = useThemedContext()
  const priceImpactWithoutFee = trade?.routeData?.priceImpactWithoutFee || ''
  const gasUseEstimateUSD = trade?.routeData?.gasUseEstimateUSD || ''
  const isExactIn = trade?.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = isExactIn ? trade?.routeData?.minOut || '' : trade?.routeData?.maxIn || ''
  return (
    <>
      <AutoColumn className="text-detail" style={{ padding: '0 16px', color: '#D7DCE0' }} gap="0.4rem">
        <RowBetween>
          <RowFixed>
            <TYPE.black fontWeight={400} color={theme.text2}>
              {isExactIn ? 'Minimum received' : 'Maximum spent'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1}>
              {/* {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${
                    trade?.outputAmount?.currency?.symbol
                  }` ?? '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade?.inputAmount?.currency?.symbol}` ??
                  '-'} */}
              {isExactIn
                ? `${slippageAdjustedAmounts && slippageAdjustedAmounts.toSignificant(4)} ${
                    trade?.outputAmount?.currency?.symbol || ''
                  }` ?? '-'
                : `${slippageAdjustedAmounts && slippageAdjustedAmounts.toSignificant(4)} ${
                    trade?.inputAmount?.currency?.symbol || ''
                  }` ?? '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontWeight={400} color={theme.text2}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
          </RowFixed>
          {priceImpactWithoutFee && <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />}
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontWeight={400} color={theme.text2}>
              Network Fee
            </TYPE.black>
            <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
          </RowFixed>
          <TYPE.black color={theme.text1}>
            {/* {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${trade?.inputAmount?.currency?.symbol}` : '-'} */}
            {'$'} {gasUseEstimateUSD || ''}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

const RouteStyled = styled(Box)`
  max-height: 0;
  transition: all 0.5s;
  margin-top: 0.8rem !important;
  border: 1px solid ${({ theme }) => theme.bg3};
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  /* height: 5.7rem; */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.7rem 0.9rem;
  .LineVIcon {
    height: 5rem;
    width: 1px;
  }
  .leftTokenImg,
  .rightTokenImg {
    width: 2.3rem;
    height: 2.3rem;
  }
`
const RouteCellStyled = styled(Box)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  :nth-of-type(2) {
    margin-top: 0.9rem !important;
  }
  .routeCellBlock {
    .ArrowHLoneLine {
      width: 4.1rem;
      height: 0.8rem;
      margin: 2px 0 5px 0;
      position: relative;
      right: 5px;
    }
  }
  .tokenImgWrap {
    background: rgba(57, 225, 186, 0.1);
    border-radius: 16px;
    padding: 0.4rem 0.5rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    img {
      width: 1.7rem;
      height: auto;
    }
    img:nth-of-type(1) {
      margin-right: 10px;
      position: relative;
      left: 8px;
    }
    img:nth-of-type(2) {
      position: relative;
      right: 8px;
      z-index: -1;
    }
  }
  .justArrowHead {
    width: 0.6rem;
    height: 0.7rem;
    margin-left: 8px;
  }
`
const RouteAccordionStyled = styled(Box)`
  display: inline-flex;
  transition: all 0.3s;
  margin-left: 0.4rem;
`
export interface AdvancedSwapDetailsProps {
  trade?: Trade
}
if (window) {
  window['axiosClient'] = axios
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const theme = useThemedContext()
  const [showRouterDetail, setShowRouterDetail] = useState(false)
  const [allowedSlippage] = useUserSlippageTolerance()
  // const showRoute = Boolean(trade && trade.route.path.length > 2)
  const showRoute = Boolean(trade && trade.routeData && trade.routeData.route.length > 0)
  const routeData = (trade && trade['routeData']) || null
  return (
    <AutoColumn gap="0.4rem">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 16px' }} className="text-detail">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <TYPE.black className="text-detail" fontWeight={400} color={theme.text2}>
                    Route
                  </TYPE.black>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </span>
                <SwapRoute trade={trade} />
                <RouteAccordionStyled
                  className="text-detail"
                  onClick={() => setShowRouterDetail(!showRouterDetail)}
                  sx={{ marginLeft: '.5rem' }}
                >
                  <img
                    src={arrowShowRoute}
                    alt=""
                    style={
                      showRouterDetail
                        ? { transform: 'rotate(180deg)', width: '12px', height: '12px', cursor: 'pointer' }
                        : { width: '12px', height: '12px', cursor: 'pointer' }
                    }
                  />
                </RouteAccordionStyled>
              </RowBetween>
              <RouteStyled className="text-detail" sx={showRouterDetail ? { maxHeight: 'unset' } : { display: 'none' }}>
                <CurrencyLogo
                  className="leftTokenImg"
                  currency={trade && trade.inputAmount && trade.inputAmount.currency}
                />
                {/* <img className="leftTokenImg" src={TeleRouteIcon} alt="" /> */}
                <img className="LineVIcon" style={{ margin: '0 0.5rem 0 0.89rem' }} src={LineVIcon} alt="" />
                <div>
                  {
                    // @ts-ignore
                    routeData &&
                      routeData.hasOwnProperty('route') &&
                      routeData.route.map((item, index) => (
                        <RouteCellStyled key={index} className="text-detail">
                          {item.map((routeItem, routeItemIndex) => (
                            <>
                              <div
                                key={routeItemIndex}
                                className="routeCellBlock ColumnStartCenter"
                                style={{ marginRight: '10px' }}
                              >
                                {routeItemIndex == 0 ? <span>{routeData.percents[index]}%</span> : <span>　</span>}
                                <img className="ArrowHLoneLine" src={ArrowHLoneLine} alt="" />
                                <span
                                  style={{
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '4px',
                                    padding: '.1rem .3rem'
                                  }}
                                >
                                  {routeItem.stable ? 'Stable' : 'Volatile'}
                                </span>
                              </div>
                              <div className="tokenImgWrap">
                                <CurrencyLogo currency={routeItem && routeItem.tokenIn} />
                                <CurrencyLogo currency={routeItem && routeItem.tokenOut} />
                                {/* <img src={TeleRouteIcon} alt="" />
                                <img src={TeleRouteIcon} alt="" /> */}
                              </div>
                            </>
                          ))}
                          {/* <div className="routeCellBlock ColumnStartCenter" style={{ marginRight: '.5rem' }}>
                          <span>　</span>
                          <img className="ArrowHLoneLine" src={ArrowHLoneLine} alt="" />
                          <span>Stable</span>
                        </div>
                        <div className="tokenImgWrap" style={{ marginRight: '.4rem' }}>
                          <img src={TeleRouteIcon} alt="" />
                          <img src={TeleRouteIcon} alt="" />
                        </div> */}
                          <img className="justArrowHead" src={ArrowHGreen} alt="" />
                        </RouteCellStyled>
                      ))
                  }
                </div>
                <img className="LineVIcon" style={{ margin: '0 0.89rem 0 0.5rem' }} src={LineVIcon} alt="" />
                {/* <img className="rightTokenImg" src={TeleRouteIcon} alt="" /> */}
                <CurrencyLogo
                  className="rightTokenImg"
                  currency={trade && trade.outputAmount && trade.outputAmount.currency}
                />
              </RouteStyled>
            </>
          )}
          {/* {!showRoute && (
            <AutoColumn style={{ padding: '12px 16px 0 16px' }}>
              <InfoLink
                href={'https://info.uniswap.org/pair/' + trade.route.pairs[0].liquidityToken.address}
                target="_blank"
              >
                View pair analytics ↗
              </InfoLink>
            </AutoColumn>
          )} */}
        </>
      )}
    </AutoColumn>
  )
}
