import { Currency, ETHER, JSBI, TokenAmount } from '@teleswap/sdk'
import { ReactComponent as ArrowDown } from 'assets/svg/arrowdown.svg'
import LiquidityPlusIcon from 'assets/svg/liquidityPlusIcon.svg'
import QuestionHelper from 'components/QuestionHelper'
import { useCallback, useEffect, useState } from 'react'
import { Box, ButtonProps, Flex, Text } from 'rebass'
import styled from 'styled-components'

import { ButtonOutlined } from '../../components/Button'
import { BlueCard, LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import CurrencyLogo from '../../components/CurrencyLogo'
import { FindPoolTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { RowBetween } from '../../components/Row'
import CurrencySearchModal from '../../components/SearchModal/CurrencySearchModal'
import { PairState, usePair } from '../../data/Reserves'
import { useActiveWeb3React } from '../../hooks'
import { usePairAdder } from '../../state/user/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import AppBody from '../AppBody'
import { Dots } from '../Liquidity/styles'

const CustomizedRadio = styled.input`
  appearance: none;
  border: 0.0875rem solid #4ed7b6;
  width: 0.875rem;
  height: 0.875rem;
  margin: 0;
  border-radius: 50%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  :before {
    content: '';
    width: 0.4rem !important;
    height: 0.4rem !important;
    border-radius: 50%;
    background-color: #4ed7b6;
    transition: 120ms all ease-in-out;
    box-shadow: inset 0.35rem 0.35rem #4ed7b6;
    transform: scale(0);
  }
  :checked {
    :before {
      transform: scale(1);
    }
  }
`

enum Fields {
  TOKEN0 = 0,
  TOKEN1 = 1
}

export default function PoolFinder() {
  const { account } = useActiveWeb3React()

  const [showSearch, setShowSearch] = useState<boolean>(false)
  const [activeField, setActiveField] = useState<number>(Fields.TOKEN1)

  const [currency0, setCurrency0] = useState<Currency | null>(ETHER)
  const [currency1, setCurrency1] = useState<Currency | null>(null)
  const [pairModeStable, setPairModeStable] = useState(false)

  const [pairState, pair] = usePair(currency0 ?? undefined, currency1 ?? undefined, pairModeStable)
  const addPair = usePairAdder()
  useEffect(() => {
    if (pair) {
      addPair(pair)
    }
  }, [pair, addPair])

  const validPairNoLiquidity: boolean =
    pairState === PairState.NOT_EXISTS ||
    Boolean(
      pairState === PairState.EXISTS &&
        pair &&
        JSBI.equal(pair.reserve0.raw, JSBI.BigInt(0)) &&
        JSBI.equal(pair.reserve1.raw, JSBI.BigInt(0))
    )

  const position: TokenAmount | undefined = useTokenBalance(account ?? undefined, pair?.liquidityToken)
  const hasPosition = Boolean(position && JSBI.greaterThan(position.raw, JSBI.BigInt(0)))

  const handleCurrencySelect = useCallback(
    (currency: Currency) => {
      if (activeField === Fields.TOKEN0) {
        setCurrency0(currency)
      } else {
        setCurrency1(currency)
      }
    },
    [activeField]
  )

  const handleSearchDismiss = useCallback(() => {
    setShowSearch(false)
  }, [setShowSearch])

  const prerequisiteMessage = (
    <LightCard padding="0.5rem 0px">
      <Text textAlign="center" className="text">
        {!account ? 'Connect to a wallet to find pools' : 'Select a token to find your liquidity.'}
      </Text>
    </LightCard>
  )

  return (
    <AppBody>
      <FindPoolTabs />
      <AutoColumn style={{ padding: '1rem' }} gap="md">
        <BlueCard>
          <AutoColumn gap="10px">
            <TYPE.link fontWeight={400} color={'primaryText1'} className="text">
              <b>Tip:</b> Use this tool to find pairs that don&apos;t automatically appear in the interface.
            </TYPE.link>
          </AutoColumn>
        </BlueCard>
        <Box sx={{ position: 'relative' }}>
          <ButtonDropdownLight
            sx={{
              marginBottom: '1.25rem',
              background: 'rgba(5, 5, 14, 0.5)!important',
              border: 'unset!important'
            }}
            onClick={() => {
              setShowSearch(true)
              setActiveField(Fields.TOKEN0)
            }}
          >
            {currency0 ? (
              <Row>
                <CurrencyLogo currency={currency0} />
                <Text fontWeight={500} fontSize={20} marginLeft={'12px'}>
                  {currency0.symbol}
                </Text>
              </Row>
            ) : (
              <Text fontWeight={500} fontSize={20} marginLeft={'12px'}>
                Select a Token
              </Text>
            )}
          </ButtonDropdownLight>

          <ColumnCenter sx={{ position: 'absolute', top: '5rem', zIndex: 2, width: '100%', height: 0 }}>
            {/* <Plus size="16" color="#888D9B" /> */}
            <img src={LiquidityPlusIcon} alt="import-pool-plus-icon" style={{ width: '3rem', height: '3rem' }} />
          </ColumnCenter>

          <ButtonDropdownLight
            sx={{
              background: 'rgba(5, 5, 14, 0.5)!important',
              border: 'unset!important'
            }}
            onClick={() => {
              setShowSearch(true)
              setActiveField(Fields.TOKEN1)
            }}
          >
            {currency1 ? (
              <Row>
                <CurrencyLogo currency={currency1} />
                <Text fontWeight={500} fontSize={20} marginLeft={'12px'}>
                  {currency1.symbol}
                </Text>
              </Row>
            ) : (
              <Text fontWeight={500} fontSize={20} marginLeft={'12px'}>
                Select a Token
              </Text>
            )}
          </ButtonDropdownLight>
        </Box>
        {!hasPosition && (
          <>
            <Box sx={{ marginTop: '1.5rem' }}>
              <Box sx={{ fontWeight: 400, marginBottom: '.5rem' }} className={'secondary-title'}>
                Pair Mode
              </Box>
              <Box sx={{ display: 'flex', fontWeight: 100, /* fontSize: '.5rem', */ alignItems: 'center' }}>
                <Flex alignItems={'center'} sx={{ flex: 1 }} onClick={() => setPairModeStable(false)}>
                  <CustomizedRadio type="radio" name="pairMode" id="Volatile" checked={!pairModeStable} />
                  <label
                    className={'text-small'}
                    style={{ margin: '0 0 0 .7rem', fontWeight: !pairModeStable ? '400' : '200' }}
                    htmlFor="Volatile"
                  >
                    Volatile
                  </label>
                  <QuestionHelper text="Volatile mode, using non-stable currency algorithm curve, mainly designed for uncorrelated pools, like WETH+USDC or OP+WETH." />
                </Flex>
                <Flex alignItems={'center'} sx={{ flex: 1 }} onClick={() => setPairModeStable(true)}>
                  <CustomizedRadio type="radio" name="pairMode" id="Stable" checked={pairModeStable} />
                  <label
                    htmlFor="Stable"
                    className={'text-small'}
                    style={{ margin: '0 0 0 .7rem', fontWeight: pairModeStable ? '400' : '200' }}
                  >
                    Stable
                  </label>
                  <QuestionHelper text="Stable mode, using stable token algorithm curve, mainly designed for 1:1 or approximately equivalent trading pairs, like USDC+DAI or WETH+sETH." />
                </Flex>
              </Box>
            </Box>
            <Box
              sx={{
                width: '100%',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                height: '0',
                margin: '0.5rem 0'
              }}
            ></Box>
          </>
        )}
        {hasPosition && (
          <ColumnCenter
            style={{ justifyItems: 'center', backgroundColor: '', padding: '0.5rem 0px', borderRadius: '1rem' }}
          >
            <Text textAlign="center" className="text" fontWeight={500}>
              Pool Found!
            </Text>
            <StyledInternalLink to={`/liquidity`}>
              <Text textAlign="center">Manage this pool.</Text>
            </StyledInternalLink>
          </ColumnCenter>
        )}
        {currency0 && currency1 ? (
          pairState === PairState.EXISTS ? (
            hasPosition && pair ? (
              <MinimalPositionCard
                pair={pair}
                border="1px solid #CED0D9"
                sx={{ border: 'unset', background: 'rgba(0, 0, 0, 0.1)' }}
              />
            ) : (
              <LightCard padding="0.5rem 0px">
                <AutoColumn gap="sm" justify="center">
                  <Text textAlign="center">You don’t have liquidity in this pool yet.</Text>
                  <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                    <Text textAlign="center">Add liquidity.</Text>
                  </StyledInternalLink>
                </AutoColumn>
              </LightCard>
            )
          ) : validPairNoLiquidity ? (
            <LightCard padding="0.5rem 0px">
              <AutoColumn gap="sm" justify="center" className="text">
                <Text textAlign="center">No pool found.</Text>
                <StyledInternalLink to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                  Create pool.
                </StyledInternalLink>
              </AutoColumn>
            </LightCard>
          ) : pairState === PairState.INVALID ? (
            <LightCard padding="0.5rem 0px">
              <AutoColumn gap="sm" justify="center" className="text">
                <Text textAlign="center" fontWeight={500}>
                  Invalid pair.
                </Text>
              </AutoColumn>
            </LightCard>
          ) : pairState === PairState.LOADING ? (
            <LightCard padding="0.5rem 0px">
              <AutoColumn gap="sm" justify="center" className="text">
                <Text textAlign="center">
                  Loading
                  <Dots />
                </Text>
              </AutoColumn>
            </LightCard>
          ) : null
        ) : (
          prerequisiteMessage
        )}
      </AutoColumn>

      <CurrencySearchModal
        isOpen={showSearch}
        onCurrencySelect={handleCurrencySelect}
        onDismiss={handleSearchDismiss}
        showCommonBases
        selectedCurrency={(activeField === Fields.TOKEN0 ? currency1 : currency0) ?? undefined}
      />
    </AppBody>
  )
}

const StyledDropDown = styled(ArrowDown)<{ selected: boolean }>`
  margin: 0;
  height: 35%;

  /* path {
    stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
    stroke-width: 1.5px;
  } */
`

function ButtonDropdownLight({ disabled = false, children, ...rest }: { disabled?: boolean } & ButtonProps) {
  return (
    <ButtonOutlined {...rest} disabled={disabled} height={'6rem'}>
      <RowBetween>
        <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>
        <StyledDropDown width={'2rem'} selected={false} />
      </RowBetween>
    </ButtonOutlined>
  )
}
