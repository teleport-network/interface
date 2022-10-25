import { TradeType } from './constants'
import invariant from 'tiny-invariant'
import { validateAndParseAddress } from './utils'
import { ETHER, Percent, Trade } from './entities'
import BigNumber from 'bignumber.js'


export const swapETHForExactTokensMultiText = 'swapETHForExactTokensMulti'

/**
 * Options for producing the arguments to send call to the router.
 */
export interface TradeOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  allowedSlippage: Percent
  /**
   * How long the swap is valid until it expires, in seconds.
   * This will be used to produce a `deadline` parameter which is computed from when the swap call parameters
   * are generated.
   */
  ttl: number
  /**
   * The account that should receive the output of the swap.
   */
  recipient: string

  /**
   * Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
   */
  feeOnTransfer?: boolean
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  /**
   * When the transaction expires.
   * This is an atlernate to specifying the ttl, for when you do not want to use local time.
   */
  deadline: number
}

/**
 * The parameters to use in the call to the Uniswap V2 Router to execute a trade.
 */
export interface SwapParameters {
  /**
   * The method to call on the Uniswap V2 Router.
   */
  methodName: string
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: (string | string[])[]
  /**
   * The amount of wei to send in hex.
   */
  value: string
  multiParams: Array<any>
  deadline: string
}

// function toHex(currencyAmount: CurrencyAmount) {
//   return `0x${currencyAmount.raw.toString(16)}`
// }

const ZERO_HEX = '0x0'

/**
 * Represents the Uniswap V2 Router, and has static methods for helping execute trades.
 */
export abstract class SDKRouter {
  /**
   * Cannot be constructed.
   */
  private constructor() { }
  /**
   * Produces the on-chain method name to call and the hex encoded parameters to pass as arguments for a given trade.
   * @param trade to produce call parameters for
   * @param options options for the call parameters
   */
  public static swapCallParameters(trade: Trade, options: TradeOptions | TradeOptionsDeadline): SwapParameters {

    const etherIn = trade.inputAmount.currency === ETHER
    const etherOut = trade.outputAmount.currency === ETHER
    // the router does not support both ether in and out
    invariant(!(etherIn && etherOut), 'ETHER_IN_OUT')
    invariant(!('ttl' in options) || options.ttl > 0, 'TTL')

    const to: string = validateAndParseAddress(options.recipient)
    // const amountIn: string = toHex(trade.maximumAmountIn(options.allowedSlippage))
    // const amountOut: string = toHex(trade.minimumAmountOut(options.allowedSlippage))
    // const path: string[] = trade.route.path.map(token => token.address)
    // const path: string[] = trade.routeData.route.map(token => token.address)

    // const stables: boolean[] = trade.route.pairs.map(token => token.stable)
    const deadline =
      'ttl' in options
        ? `0x${(Math.floor(new Date().getTime() / 1000) + options.ttl).toString(16)}`
        : `0x${options.deadline.toString(16)}`

    const useFeeOnTransfer = Boolean(options.feeOnTransfer)
    const routeDataRoute = trade?.routeData?.route || {}

    const getParams = (tempRouteDataRoute: any, type: number) => {
      let tempMuitcallParams: Array<any> = []
      let tempAmountIn: Array<any> = []
      let tempAmountOut: Array<any> = []
      const maxInString =  tempRouteDataRoute?.maxIn?.toSignificant() || ''
      const maxInHex = '0x' + Number(maxInString).toString(16)
      const minOutString =  tempRouteDataRoute?.minOut?.toSignificant() || ''
      const minOutHex = '0x' + Number(minOutString).toString(16)

      tempRouteDataRoute.forEach((rowItem: any) => {
        let routePathArge: Array<any> = []
        rowItem.forEach((_routeDataItem: any, itemIndex: number) => {
          routePathArge.push([rowItem[itemIndex]['tokenIn']['address'], rowItem[itemIndex]['tokenOut']['address'], rowItem[itemIndex]['stable']])
        })
        let amountInString = rowItem[0]['amountIn']
        let amountInHex = '0x' + Number(amountInString).toString(16)
        let amountOutString = rowItem[rowItem.length - 1]['amountOut']
        let amountOutHex = '0x' + Number(amountOutString).toString(16)

        let rowParams: Array<any> = []
        switch (type) {
          case 1:
            rowParams = [amountInHex, minOutHex, routePathArge, to, deadline]
            break;
          case 2:
            rowParams = [amountInHex, minOutHex, routePathArge, to, deadline]
            break;
          case 3:
            rowParams = [amountInHex, minOutHex, routePathArge, to, deadline]
            break;
          case 4:
            rowParams = [amountOutHex, routePathArge, to, deadline]
            break;
          case 5:
            rowParams = [amountOutHex, maxInHex, routePathArge, to, deadline]
            break;
          case 6:
            rowParams = [amountOutHex, maxInHex, routePathArge, to, deadline]
            break;
        }
        tempMuitcallParams.push(rowParams)
        tempAmountIn.push(amountInHex)
        tempAmountOut.push(amountOutHex)
      })
      return {
        tempMuitcallParams,
        tempAmountIn,
        tempAmountOut
      }
    }
    let methodName: string
    // let args: (string | string[])[]
    let args: Array<any>
    let value: string
    // let routePathArge = []
    // let pathLength = path.length
    let multiParams: any = []
    switch (trade.tradeType) {
      case TradeType.EXACT_INPUT:
        if (etherIn) {
          methodName = useFeeOnTransfer ? 'swapExactETHForTokensSupportingFeeOnTransferTokens' : 'swapExactETHForTokens'
          // for (let i = 0; i < pathLength; i++) {
          //   if (i < pathLength - 1) {
          //     routePathArge.push([path[i], path[i + 1], stables[i]])
          //   }
          // }
          // args = [amountOut, routePathArge, to, deadline]
          // args = [0, routePathArge, to, deadline]
          let payload = getParams(routeDataRoute, 1)
          multiParams = payload.tempMuitcallParams
          args = []
          // value = amountIn
          value = payload && payload.tempAmountIn && payload['tempAmountIn'].length > 0 && payload.tempAmountIn.reduce((count, item) => new BigNumber(item).plus(count).toNumber()) || ZERO_HEX
        } else if (etherOut) {
          methodName = useFeeOnTransfer ? 'swapExactTokensForETHSupportingFeeOnTransferTokens' : 'swapExactTokensForETH'
          // for (let index = 0; index < routeDataRoute.length; index++) {
          //   let routePathArge = []
          //   let routeDataOne = routeDataRoute[index]
          //   for (let itemIndex = 0; itemIndex < routeDataOne.length; itemIndex++) {
          //     routePathArge.push([routeDataOne[itemIndex]['tokenIn']['address'], routeDataOne[itemIndex]['tokenOut']['address'], routeDataOne[itemIndex]['stable']])
          //   }
          //   let amountInString = routeDataOne[0]['amountIn']
          //   let amountInHex = '0x' + Number(amountInString).toString(16)
          //   let rowParams = [amountInHex, 0, routePathArge, to, deadline]
          //   multiParams.push(rowParams)
          // }
          // amountOut = 0
          // args = [amountIn, 0, routePathArge, to, deadline]
          let payload = getParams(routeDataRoute, 2)
          multiParams = payload.tempMuitcallParams
          args = []
          value = ZERO_HEX
        } else {
          methodName = useFeeOnTransfer
            ? 'swapExactTokensForTokensSupportingFeeOnTransferTokens'
            : 'swapExactTokensForTokens'
          // (uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
          // for (let i = 0; i < pathLength; i++) {
          //   if (i < pathLength - 1) {
          //     routePathArge.push([path[i], path[i + 1], stables[i]])
          //   }
          // }
          // args = [amountIn, 0, routePathArge, to, deadline]
          // args = [amountIn, amountOut, routePathArge, to, deadline]
          let payload = getParams(routeDataRoute, 3)
          multiParams = payload.tempMuitcallParams
          args = []
          value = ZERO_HEX
        }
        break
      case TradeType.EXACT_OUTPUT:
        invariant(!useFeeOnTransfer, 'EXACT_OUT_FOT')
        if (etherIn) {
          // methodName = 'swapETHForExactTokens'
          methodName = swapETHForExactTokensMultiText
          // (uint amountOut, address[] calldata path, address to, uint deadline)
          // args = [amountOut, [[...path, getRoutePairMode()]], to, deadline]
          let payload = getParams(routeDataRoute, 4)
          multiParams = payload.tempMuitcallParams
          args = []
          // value = amountIn
          value = payload && payload.tempAmountIn && payload['tempAmountIn'].length > 0 && payload.tempAmountIn.reduce((count, item) => new BigNumber(item).plus(count).toNumber()) || ZERO_HEX
        } else if (etherOut) {
          methodName = 'swapTokensForExactETH'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          // args = [amountOut, amountIn, [[...path, getRoutePairMode()]], to, deadline]
          let payload = getParams(routeDataRoute, 5)
          multiParams = payload.tempMuitcallParams
          args = []
          value = ZERO_HEX
        } else {
          methodName = 'swapTokensForExactTokens'
          // (uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline)
          // args = [amountOut, amountIn, [[...path, getRoutePairMode()]], to, deadline]
          let payload = getParams(routeDataRoute, 6)
          multiParams = payload.tempMuitcallParams
          args = []
          value = ZERO_HEX
        }
        break
    }
    return {
      methodName,
      args,
      value,
      multiParams,
      deadline
    }
  }
}
