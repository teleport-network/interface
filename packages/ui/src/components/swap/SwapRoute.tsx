import { Trade } from '@teleswap/sdk'
import useThemedContext from 'hooks/useThemedContext'
import { Fragment, memo } from 'react'
import { ChevronRight } from 'react-feather'
import { Flex } from 'rebass'
import { ETHText } from '../../constants'
// import { unwrappedToken } from 'utils/wrappedCurrency'

import { TYPE } from '../../theme'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const theme = useThemedContext()
  const route = trade?.routeData?.route || []
  const inputSymbol = trade?.inputAmount?.currency?.symbol || ''
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {
        <Fragment>
          <Flex alignItems="end">
            <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
              {(route[0] && route[0][0]?.tokenIn?.symbol) || ''}
            </TYPE.black>
          </Flex>
          <ChevronRight size={12} color={theme.text2} />
          <Flex alignItems="end">
            <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
              {trade?.outputAmount?.currency?.symbol || ''}
            </TYPE.black>
          </Flex>
        </Fragment>
      }
      {false && route && route.length > 1 && (
        <Fragment>
          {inputSymbol && inputSymbol === ETHText && (
            <>
              <Flex alignItems="end">
                <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
                  {ETHText}
                </TYPE.black>
              </Flex>
              <ChevronRight size={12} color={theme.text2} />
            </>
          )}
          <Flex alignItems="end">
            <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
              {(route[0] && route[0][0]?.tokenIn?.symbol) || ''}
            </TYPE.black>
          </Flex>
          <ChevronRight size={12} color={theme.text2} />
          <Flex alignItems="end">
            <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
              {trade?.outputAmount?.currency?.symbol || ''}
            </TYPE.black>
          </Flex>
        </Fragment>
      )}
      {false &&
        route &&
        route.length === 1 &&
        route[0] &&
        route[0].map((token, i, path) => {
          const isLastItem: boolean = i === path.length - 1
          return (
            <Fragment key={i}>
              <Flex alignItems="center">
                {inputSymbol && inputSymbol === ETHText && i === 0 && (
                  <>
                    <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
                      {ETHText}
                    </TYPE.black>
                    <ChevronRight size={12} color={theme.text2} />
                  </>
                )}
                <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
                  {token?.tokenIn?.symbol}
                </TYPE.black>
              </Flex>
              {isLastItem ? null : <ChevronRight size={12} color={theme.text2} />}
              {isLastItem && <ChevronRight size={12} color={theme.text2} />}
              {isLastItem && (
                <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
                  {token?.tokenOut?.symbol}
                </TYPE.black>
              )}
            </Fragment>
          )
        })}
    </Flex>
  )
})
