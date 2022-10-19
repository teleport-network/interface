import { Trade } from '@teleswap/sdk'
import useThemedContext from 'hooks/useThemedContext'
import { Fragment, memo } from 'react'
import { ChevronRight } from 'react-feather'
import { Flex } from 'rebass'
// import { unwrappedToken } from 'utils/wrappedCurrency'

import { TYPE } from '../../theme'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const theme = useThemedContext()
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="flex-end" alignItems="center">
      {trade.routeData &&
        trade.routeData.route &&
        trade.routeData.route[0] &&
        trade.routeData.route[0].map((token, i, path) => {
          const isLastItem: boolean = i === path.length - 1
          return (
            <Fragment key={i}>
              <Flex alignItems="end">
                <TYPE.black className="text-detail" color={theme.text1} ml="0.125rem" mr="0.125rem">
                  {token?.tokenIn?.symbol}
                </TYPE.black>
              </Flex>
              {isLastItem ? null : <ChevronRight size={12} color={theme.text2} />}
              {isLastItem && <ChevronRight size={12} color={theme.text2} />}
              {isLastItem && token?.tokenOut?.symbol}
            </Fragment>
          )
        })}
    </Flex>
  )
})
