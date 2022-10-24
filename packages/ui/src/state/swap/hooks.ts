import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, ETHER, JSBI, Token, TokenAmount, Trade, WETH } from '@teleswap/sdk'
import BigNumber from 'bignumber.js'
import { QuoteArguments } from 'lib/hooks/routing/clientSideSmartOrderRouter'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { route } from 'state/routing/slice'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
// import { useTradeExactIn, useTradeExactOut } from '../../hooks/Trades'
import useENS from '../../hooks/useENS'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { isAddress } from '../../utils'
import { computeSlippageAdjustedAmounts } from '../../utils/prices'
import { AppDispatch, AppState } from '../index'
import { useUserSlippageTolerance, useUserTransactionTTL } from '../user/hooks'
import { useCurrencyBalances } from '../wallet/hooks'
import { Field, replaceSwapState, selectCurrency, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'

let timeout
export function useSwapState(): AppState['swap'] {
  return useSelector<AppState, AppState['swap']>((state) => state.swap)
}

export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useDispatch<AppDispatch>()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency instanceof Token ? currency.address : currency === ETHER ? 'ETH' : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient
  }
}

// try to parse a user entered amount for a given token
export function tryParseAmount(value?: string, currency?: Currency): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}

const BAD_RECIPIENT_ADDRESSES: string[] = [
  '0xDE15CBA96deAD6Bdd201aa27fc19e15F2bAB6D02', // v2 factory
  '0x87f3C84Fc7a6f9361Dc6865984D03D1156522A9c' // v2 router 02
]

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
function involvesAddress(trade: Trade, checksummedAddress: string): boolean {
  return (
    trade.route.path.some((token) => token.address === checksummedAddress) ||
    trade.route.pairs.some((pair) => pair.liquidityToken.address === checksummedAddress)
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo():
  | any
  | {
      currencies: { [field in Field]?: Currency }
      currencyBalances: { [field in Field]?: CurrencyAmount }
      parsedAmount: CurrencyAmount | undefined
      v2Trade: Trade | undefined
      inputError?: string
      routeData?: any
    } {
  const { account, chainId } = useActiveWeb3React()
  const [loading, setLoading] = useState(false)
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  // const bestTradeExactIn = useTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  // const bestTradeExactOut = useTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  // const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut
  const v2Trade: any = {}
  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter Amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select Token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES.indexOf(formattedTo) !== -1
      // (bestTradeExactIn && involvesAddress(bestTradeExactIn, formattedTo)) ||
      // (bestTradeExactOut && involvesAddress(bestTradeExactOut, formattedTo))
    ) {
      inputError = inputError ?? 'Invalid recipient'
    }
  }

  const [allowedSlippage] = useUserSlippageTolerance()
  const [ttl] = useUserTransactionTTL()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  // api route
  const [routeData, setRouteData] = useState({})
  const inputName = (currencies && currencies[Field.INPUT]?.name) || ''
  const outputName = (currencies && currencies[Field.OUTPUT]?.name) || ''
  useEffect(() => {
    ;(async () => {
      try {
        if (!!timeout) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
          getData().then()
        }, 500)
      } catch (error) {
        console.error('useDerivedSwapInfo error', error)
      }
    })()
  }, [typedValue, inputName, outputName])

  const alertMsg = (msg: string) => {
    const divTemp = document.createElement('div')
    divTemp.className = 'toastMessageWrap'
    divTemp.innerHTML = `
          <div class="toastMessageContent">
                ${msg}
          </div> 
    `
    // @ts-ignore
    document.querySelector('body').append(divTemp)
    setTimeout(() => {
      const nodeTags = document.getElementsByClassName('toastMessageWrap')
      for (let k = 0; k < nodeTags.length; k++) {
        if (nodeTags[k] != null) {
          // @ts-ignore
          nodeTags[k].parentNode.removeChild(nodeTags[k])
        }
      }
    }, 2000)
  }
  const getData = async () => {
    try {
      setRouteData({})
      if (
        typedValue &&
        currencies &&
        currencies[Field.INPUT] &&
        currencies[Field.INPUT]?.hasOwnProperty('decimals') &&
        currencies[Field.OUTPUT] &&
        currencies[Field.OUTPUT]?.hasOwnProperty('decimals') &&
        chainId
      ) {
        // if (currencyAmount.currency === ETHER) return new TokenAmount(WETH[chainId], currencyAmount.raw)
        if (currencies[Field.INPUT]!['symbol'] === 'ETH') {
          currencies[Field.INPUT] = WETH[chainId]
        }
        if (currencies[Field.OUTPUT]!['symbol'] === 'ETH') {
          currencies[Field.OUTPUT] = WETH[chainId]
        }
        if (!currencies[Field.INPUT] || !currencies[Field.INPUT]!['address'] || !currencies[Field.INPUT]!['chainId']) {
          throw new Error(`Invalid`)
        }

        if (
          !currencies[Field.OUTPUT] ||
          !currencies[Field.OUTPUT]!['address'] ||
          !currencies[Field.OUTPUT]!['chainId']
        ) {
          throw new Error(`Invalid`)
        }
        const decimal = isExactIn ? currencies[Field.INPUT]?.decimals : currencies[Field.OUTPUT]?.decimals
        if (!decimal) {
          throw new Error(`Invalid decimal`)
        }
        const amount = new BigNumber(typedValue).shiftedBy(decimal).toNumber().toLocaleString().replace(/,/g, '')
        const params: QuoteArguments = {
          tokenInAddress: currencies[Field.INPUT]!['address']!,
          tokenInChainId: currencies[Field.INPUT]!['chainId'],
          tokenOutAddress: currencies[Field.OUTPUT]!['address']!,
          tokenOutChainId: currencies[Field.OUTPUT]!['chainId'],
          amount,
          type: isExactIn ? 'exactIn' : 'exactOut',
          tokenInSymbol: currencies[Field.INPUT]!.symbol,
          tokenOutSymbol: currencies[Field.OUTPUT]!.symbol,
          slippageTolerance: allowedSlippage ? String(allowedSlippage) : '',
          tokenInDecimals: currencies[Field.INPUT]!.decimals,
          tokenOutDecimals: currencies[Field.OUTPUT]!.decimals
        }
        params['recipient'] = ''
        if (ttl) {
          params['deadline'] = String(ttl)
        }
        setLoading(true)
        const response = await route(params)
        setLoading(false)
        if (response.data.hasOwnProperty('invalidRoute') && response.data.invalidRoute === true) {
          if (document && document.querySelector('body')) {
            alertMsg('No valid route matched')
          } else {
            alert('No valid route matched')
          }
          setRouteData({})
        } else {
          if (response.data && response.data.hasOwnProperty('quoteDecimals')) {
            const outputAmount = tryParseAmount(
              response.data.quoteDecimals,
              (isExactIn ? outputCurrency : inputCurrency) ?? undefined
            )
            const exactType = response.data && response.data.reqParams && response.data.reqParams.type
            switch (exactType) {
              case 'exactIn':
                response.data['inputAmount'] = parsedAmount
                response.data['outputAmount'] = outputAmount
                break
              case 'exactOut':
                response.data['inputAmount'] = outputAmount
                response.data['outputAmount'] = parsedAmount
                break
            }
            setRouteData(response.data)
          }
        }
      }
    } catch (error: any) {
      if (document && document.querySelector('body')) {
        alertMsg(error?.message || error)
      } else {
        alert(error?.message || error)
      }
    }
  }
  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: Object.keys(routeData).length > 0 ? v2Trade : undefined,
    // v2Trade: v2Trade ?? undefined,
    inputError,
    routeData,
    loading
  }
}

function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
    if (valid === false) return 'ETH'
  }
  return 'ETH' ?? ''
}

function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  }
}

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId) return
    const parsed = queryParametersToSwapState(parsedQs)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: parsed.recipient
      })
    )

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return result
}
