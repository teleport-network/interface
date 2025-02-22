import { Fraction, JSBI, Pair } from '@teleswap/sdk'
import GoBack from 'assets/svg/goBack.svg'
import GoBackBolder from 'assets/svg/goBackBolder.svg'
import GoBackMobile from 'assets/svg/goBackMobile.svg'
import Bn from 'bignumber.js'
import { ButtonPrimary } from 'components/Button'
import CurrencyLogo from 'components/CurrencyLogo'
import DoubleCurrencyLogoHorizontal from 'components/DoubleLogo'
import { MobileBottomShadowContainer } from 'components/MobileBottomShadowContainer'
import { useTotalSupply } from 'data/TotalSupply'
// import TransactionConfirmationModal, { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import gql from 'graphql-tag'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Box, Flex, FlexProps, Text } from 'rebass'
import { Field } from 'state/mint/actions'
import { useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { client } from 'utils/apolloClient'
import { currencyId } from 'utils/currencyId'

import { useDerivedMintInfo, useMintActionHandlers } from '../../state/mint/hooks'

const BorderVerticalContainer = styled(Flex)`
  background-color: rgba(25, 36, 47, 1);
  width: 100%;
  padding: 2rem;
  border-radius: 24px;
  flex-direction: column;
  color: white;
  gap: 0.8rem;
`

const StyledLink = styled(ButtonPrimary)`
  & {
    max-width: max-content;
    font-family: 'Poppins';
    font-style: normal;
    font-weight: 600;
    padding: 0.5rem;
    height: 2rem !important;
    font-size: max(0.8rem, 12px);
    border-radius: 0.5rem !important;
    color: #000000;
  }
`

export default function LiquidityDetail() {
  const { currencyIdA, currencyIdB, stable } = useParams<{ currencyIdA: string; currencyIdB: string; stable: string }>()
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account } = useActiveWeb3React()
  const pairModeStable = stable?.toLowerCase() === 'true' ? true : false
  const { currencies, pair, parsedAmounts, noLiquidity } = useDerivedMintInfo(
    currencyA ?? undefined,
    currencyB ?? undefined,
    pairModeStable
  )
  const userPoolBalance = useTokenBalance(account ?? undefined, pair?.liquidityToken)

  const totalPoolTokens = useTotalSupply(pair?.liquidityToken)

  const userHoldingPercentage = useMemo(() => {
    if (userPoolBalance && totalPoolTokens) {
      return userPoolBalance?.divide(totalPoolTokens!)
    }
    return '-'
  }, [totalPoolTokens, userPoolBalance])

  const userToken0AmountInPool = useMemo(() => {
    if (userHoldingPercentage instanceof Fraction) {
      return pair?.reserve0.multiply(userHoldingPercentage)
    } else {
      return undefined
    }
  }, [pair?.reserve0, userHoldingPercentage])

  const userToken1AmountInPool = useMemo(() => {
    if (userHoldingPercentage instanceof Fraction) {
      return pair?.reserve1.multiply(userHoldingPercentage)
    } else {
      return undefined
    }
  }, [pair?.reserve1, userHoldingPercentage])

  const [token0Deposited, token1Deposited] = useMemo(() => {
    if (
      !!pair &&
      !!totalPoolTokens &&
      !!userPoolBalance &&
      JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
    ) {
      return [
        pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
        pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
      ]
    }
    return [undefined, undefined]
  }, [pair, totalPoolTokens, userPoolBalance])

  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const [txHash, setTxHash] = useState<string>('')

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
  }, [onFieldAInput, txHash])

  const pendingText = useMemo(
    () =>
      `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
        currencies[Field.CURRENCY_A]?.symbol
      } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`,
    [currencies, parsedAmounts]
  )

  const claim = useCallback(() => {
    console.warn('not implemented')
  }, [])

  /*   const modalHeader = useCallback(() => {
    return (
      <Flex>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gridTemplateRows: 'repeat(2, 1fr)',
            gridRowGap: '24px',
            gridAutoFlow: 'row',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '16px',
            lineHeight: '24px',
            color: '#FFFFFF'
          }}
        >
          <HeaderText>Token</HeaderText>
          <HeaderText>Value</HeaderText>
          <HeaderText>Amount</HeaderText>
          <Flex>
            <CurrencyLogo currency={currencyA} />
            <Text>{currencyA?.symbol?.toUpperCase()}</Text>
          </Flex>
          <Box>Current A Value</Box>
          <Box>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(12)}</Box>
          <Flex>
            <CurrencyLogo currency={currencyB} />
            <Text>{currencyB?.symbol?.toUpperCase()}</Text>
          </Flex>
          <Box>Current B Value</Box>
          <Box>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(12)}</Box>
        </Box>
        <ButtonPrimary
          onClick={claim}
          sx={{
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '0.8rem',
            textAlign: 'center',
            color: '#05050E'
          }}
        >
          Claim
        </ButtonPrimary>
      </Flex>
    )
  }, [claim, currencyA, currencyB, parsedAmounts]) */

  const [ethPrice, setEthPrice] = useState<Bn>()

  const [fullInfoPair, setFullInfoPair] = useState<any>()
  // const backgroundColor = useColor(pair?.token0)
  useEffect(() => {
    ;(async () => {
      if (!pair || !pair.token0 || !pair.token1 || ethPrice || fullInfoPair) {
        return
      }
      const pairAddress = Pair.getAddress(pair.token0, pair.token1, pairModeStable).toLowerCase()
      const [
        {
          data: {
            bundles: [{ ethPrice: ep }]
          }
        },
        {
          data: {
            pairs: [fullPair]
          }
        }
      ] = await Promise.all([
        client.query({
          query: gql`
            {
              bundles(first: 1) {
                id
                ethPrice
              }
            }
          `,
          fetchPolicy: 'cache-first'
        }),
        client.query({
          query: gql`
          {
            pairs(where: { id: "${pairAddress}" }) {
              id
              trackedReserveETH
              token0 {
                id
                symbol
                name
                derivedETH
              }
              token1 {
                id
                symbol
                name
                derivedETH
              }
              stable
              reserve0
              reserve1
              reserveUSD
              totalSupply
              trackedReserveETH
              reserveETH
              volumeUSD
              untrackedVolumeUSD
              token0Price
              token1Price
              createdAtTimestamp
            }
          }
          `
          /* variables: {
            pairAddress
          }, */
          // fetchPolicy: 'cache-first'
        })
      ])
      setFullInfoPair(fullPair)
      setEthPrice(new Bn(ep))
    })()
  }, [ethPrice, fullInfoPair, pair, pairModeStable])

  const displayPercentage = useMemo(() => {
    if (userHoldingPercentage instanceof Fraction) {
      return (+userHoldingPercentage.toSignificant(18) * 100).toFixed(4)
    }
    return userHoldingPercentage
  }, [userHoldingPercentage])

  return (
    <>
      <Box
        sx={
          isMobile
            ? {
                display: 'grid',
                gridTemplateColumns: '1fr 4fr 1fr',
                alignItems: 'center',
                marginBottom: '2rem'
              }
            : {
                width: '60rem',
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '2rem',
                maxWidth: '90vw'
              }
        }
      >
        <BackToMyLiquidity height="100%" />
        {isMobile && (
          <Box display="flex" justifyContent={'center'} alignItems="center">
            <DoubleCurrencyLogoHorizontal currency0={currencyA} currency1={currencyB} size={'1.8rem'} />
            <Text
              sx={{
                fontFamily: 'Dela Gothic One',
                fontStyle: 'normal',
                fontWeight: '400',
                fontSize: '1rem',
                lineHeight: '1.5rem',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {currencyA?.symbol?.toUpperCase()}/{currencyB?.symbol?.toUpperCase()}
            </Text>
          </Box>
        )}
      </Box>
      {/*   <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash}
        content={() => (
          <ConfirmationModalContent
            // title={noLiquidity ? 'You are creating a pool' : 'You will receive'}
            title={'Claim Fees'}
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
            bottomContent={undefined}
          />
        )}
        pendingText={pendingText}
        currencyToAdd={pair?.liquidityToken}
      /> */}
      <Flex
        flexDirection={'column'}
        width="60rem"
        maxWidth={'90vw'}
        sx={{
          maxHeight: '100%',
          display: 'grid',
          gridAutoRows: 'auto',
          gridRowGap: '1rem',
          gridColumnGap: '1rem',
          overflow: 'hidden auto'
        }}
      >
        {!isMobile && (
          <Flex justifyContent={'space-between'} marginBottom="1rem">
            <Flex
              sx={{
                gap: '0.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row'
              }}
            >
              <DoubleCurrencyLogoHorizontal currency0={currencyA} currency1={currencyB} size={'2.2rem'} />
              <Text
                sx={{
                  fontFamily: 'Poppins',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  fontSize: '2rem',
                  alignItems: 'flex-end',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                {currencyA?.symbol?.toUpperCase()}-{currencyB?.symbol?.toUpperCase()}
              </Text>
              <Box
                className="text-small"
                alignItems="flex-end"
                sx={{
                  height: '2rem',
                  display: 'flex',
                  alignItems: 'flex-end',
                  fontFamily: 'Poppins',
                  fontStyle: 'normal',
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                {fullInfoPair ? (fullInfoPair.stable ? 'Stable' : 'Volatile') : ''}
              </Box>
              {/* commented because of merge conflict - By Frank 0929 PR44 */}
            </Flex>
            <Flex sx={{ flexDirection: isMobile ? 'column' : 'row', gap: '0.8rem', a: { height: '1.5rem' } }}>
              {currencyA && currencyB && (
                <>
                  <StyledLink
                    as={Link}
                    to={`/add/${currencyId(currencyA!)}/${currencyId(currencyB!)}/${pairModeStable}`}
                  >
                    Increase
                  </StyledLink>
                  <StyledLink
                    as={Link}
                    to={`/remove/${currencyId(currencyA!)}/${currencyId(currencyB!)}/${pairModeStable}`}
                  >
                    Remove
                  </StyledLink>
                </>
              )}
            </Flex>
          </Flex>
        )}
        <BorderVerticalContainer>
          {!isMobile && (
            <>
              <Text className="secondary-title">Total Value</Text>
              <Text className="title">
                $&nbsp;
                {userHoldingPercentage !== '-' &&
                  fullInfoPair &&
                  ethPrice &&
                  new Bn(userHoldingPercentage.toSignificant(18))
                    .multipliedBy(fullInfoPair.trackedReserveETH)
                    .multipliedBy(ethPrice)
                    .decimalPlaces(4, Bn.ROUND_HALF_UP)
                    .toString()}
              </Text>
            </>
          )}
          {isMobile && (
            <Flex justifyContent={'space-between'}>
              <Text className="secondary-title">Total Value</Text>
              <Text className="title">
                $&nbsp;
                {userHoldingPercentage !== '-' &&
                  fullInfoPair &&
                  ethPrice &&
                  new Bn(userHoldingPercentage.toSignificant(18))
                    .multipliedBy(fullInfoPair.trackedReserveETH)
                    .multipliedBy(ethPrice)
                    .decimalPlaces(4, Bn.ROUND_HALF_UP)
                    .toString()}
              </Text>
            </Flex>
          )}
          <Box
            sx={{
              width: '100%',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              height: '0',
              margin: '0.5rem 0'
            }}
          ></Box>
          {isMobile ? (
            <Box
              className="text-emphasize"
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gridTemplateRows: '1fr 2fr 1fr 2fr',
                gridRowGap: '1rem',
                gridAutoFlow: 'row',
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: '500',
                color: '#FFFFFF',
                gridColumnGap: '1rem'
              }}
            >
              <Box
                sx={{
                  gridRow: '1 / 3',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <CurrencyLogo currency={currencyA} size={'2.5rem'} />
              </Box>
              <HeaderText>Value</HeaderText>
              <HeaderText>Amount</HeaderText>
              <HeaderText sx={{ justifySelf: 'end' }}>Percent</HeaderText>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userHoldingPercentage !== '-' &&
                  fullInfoPair &&
                  ethPrice &&
                  new Bn(userHoldingPercentage.toSignificant(18))
                    .multipliedBy(fullInfoPair.trackedReserveETH)
                    .multipliedBy(ethPrice)
                    .dividedBy(2)
                    .decimalPlaces(4, Bn.ROUND_HALF_UP)
                    .toString()}
                &nbsp;$
              </Box>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userToken0AmountInPool?.toSignificant(12)}
              </Box>
              <Box sx={{ justifySelf: 'end' }}>{displayPercentage}%</Box>
              <Box
                sx={{
                  gridRow: '3 / 5',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <CurrencyLogo currency={currencyB} size={'2.5rem'} />
              </Box>
              <HeaderText>Value</HeaderText>
              <HeaderText>Amount</HeaderText>
              <HeaderText sx={{ justifySelf: 'end' }}>Percent</HeaderText>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userHoldingPercentage !== '-' &&
                  fullInfoPair &&
                  ethPrice &&
                  new Bn(userHoldingPercentage.toSignificant(18))
                    .multipliedBy(fullInfoPair.trackedReserveETH)
                    .multipliedBy(ethPrice)
                    .dividedBy(2)
                    .decimalPlaces(4, Bn.ROUND_HALF_UP)
                    .toString()}
                &nbsp;$
              </Box>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userToken1AmountInPool?.toSignificant(12)}
              </Box>
              <Box sx={{ justifySelf: 'end' }}>{displayPercentage}%</Box>
            </Box>
          ) : (
            <Box
              className="text-emphasize"
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gridTemplateRows: 'repeat(3, 1fr)',
                gridRowGap: '1rem',
                gridAutoFlow: 'row',
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: '500',
                color: '#FFFFFF'
              }}
            >
              <HeaderText>Token</HeaderText>
              <HeaderText>Value</HeaderText>
              <HeaderText>Amount</HeaderText>
              <HeaderText sx={{ justifySelf: 'end' }}>Percent</HeaderText>
              <Flex sx={{ gap: '0.5rem' }} alignItems="center">
                <CurrencyLogo currency={currencyA} size={'1rem'} />
                <Text
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currencyA?.symbol?.toUpperCase()}
                </Text>
              </Flex>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userHoldingPercentage !== '-' &&
                  fullInfoPair &&
                  ethPrice &&
                  new Bn(userHoldingPercentage.toSignificant(18))
                    .multipliedBy(fullInfoPair.trackedReserveETH)
                    .multipliedBy(ethPrice)
                    .dividedBy(2)
                    .decimalPlaces(4, Bn.ROUND_HALF_UP)
                    .toString()}
                &nbsp;$
              </Box>
              {/* <Box>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(12)}</Box> */}
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userToken0AmountInPool?.toSignificant(12)}
              </Box>
              <Box sx={{ justifySelf: 'end' }}>{displayPercentage}%</Box>
              <Flex sx={{ gap: '0.5rem' }} alignItems="center">
                <CurrencyLogo currency={currencyB} size="1rem" />
                <Text
                  sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {currencyB?.symbol?.toUpperCase()}
                </Text>
              </Flex>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userHoldingPercentage !== '-' &&
                  fullInfoPair &&
                  ethPrice &&
                  new Bn(userHoldingPercentage.toSignificant(18))
                    .multipliedBy(fullInfoPair.trackedReserveETH)
                    .multipliedBy(ethPrice)
                    .dividedBy(2)
                    .decimalPlaces(4, Bn.ROUND_HALF_UP)
                    .toString()}
                &nbsp;$
              </Box>
              <Box
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {userToken1AmountInPool?.toSignificant(12)}
              </Box>
              <Box sx={{ justifySelf: 'end' }}>{displayPercentage}%</Box>
            </Box>
          )}
          {/* <BorderVerticalContainer>
          <Flex justifyContent={'space-between'}>
            <Text
              sx={{
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: '600',
                fontSize: '1.2rem'
              }}
            >
              Unclaimed Earnings
            </Text>
            <ButtonPrimary
              sx={{
                maxWidth: 'max-content',
                fontFamily: 'Poppins',
                fontStyle: 'normal',
                fontWeight: '500',
                height: '2rem',
                fontSize: '0.8rem',
                color: '#000000'
              }}
              onClick={() => setShowConfirm(true)}
            >
              Claim
            </ButtonPrimary>
          </Flex>
          <Text sx={{ fontSize: '1.2rem' }}>$&nbsp;1.8</Text>
          <Box
            sx={{
              width: '100%',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              height: '0',
              margin: '24px 0'
            }}
          ></Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: 'repeat(3, 1fr)',
              gridRowGap: '24px',
              gridAutoFlow: 'row',
              fontSize: '1rem'
            }}
          >
            <HeaderText>Token</HeaderText>
            <HeaderText>Value</HeaderText>
            <HeaderText>Amount</HeaderText>
            <Flex alignItems={'center'} sx={{ gap: '0.5rem' }}>
              <CurrencyLogo currency={currencyA} size="1rem" />
              <Text>{currencyA?.symbol?.toUpperCase()}</Text>
            </Flex>
            <Box>Current A Value</Box>
            <Box>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(12)}</Box>
            <Flex alignItems={'center'} sx={{ gap: '0.5rem' }}>
              <CurrencyLogo currency={currencyB} size="1rem" />
              <Text>{currencyB?.symbol?.toUpperCase()}</Text>
            </Flex>
            <Box>Current B Value</Box>
            <Box>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(12)}</Box>
          </Box>
        </BorderVerticalContainer> */}
          {!isMobile && (
            <Box
              sx={{
                width: '100%',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                height: '0',
                margin: '0.5rem 0'
              }}
            ></Box>
          )}
          {!isMobile && (
            <Flex justifyContent={'space-between'}>
              <Text
                className="secondary-title"
                sx={{
                  fontFamily: 'Poppins',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '28px',
                  color: '#FFFFFF'
                }}
              >
                Price
              </Text>
              <Flex flexDirection={'column'} textAlign="right">
                <Text
                  className="text"
                  sx={{
                    fontFamily: 'Poppins',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '24px',
                    color: 'white'
                  }}
                >
                  {token0Deposited?.divide(token1Deposited).toSignificant(4)}
                </Text>
                <Text
                  className="text-detail"
                  sx={{
                    fontFamily: 'Poppins',
                    fontStyle: 'normal',
                    fontWeight: '200',
                    lineHeight: '18px',
                    color: '#999999'
                  }}
                >
                  {currencyA?.symbol?.toUpperCase()} per {currencyB?.symbol?.toUpperCase()}
                </Text>
              </Flex>
            </Flex>
          )}
        </BorderVerticalContainer>
        {isMobile && (
          <BorderVerticalContainer>
            <Flex justifyContent={'space-between'}>
              <Text
                className="secondary-title"
                sx={{
                  fontFamily: 'Poppins',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '28px',
                  color: '#FFFFFF'
                }}
              >
                Price
              </Text>
              <Flex flexDirection={'column'} textAlign="right">
                <Text
                  className="text"
                  sx={{
                    fontFamily: 'Poppins',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '24px',
                    color: 'white'
                  }}
                >
                  {token0Deposited?.divide(token1Deposited).toSignificant(4)}
                </Text>
                <Text
                  className="text-detail"
                  sx={{
                    fontFamily: 'Poppins',
                    fontStyle: 'normal',
                    fontWeight: '200',
                    lineHeight: '18px',
                    color: '#999999'
                  }}
                >
                  {currencyA?.symbol?.toUpperCase()} per {currencyB?.symbol?.toUpperCase()}
                </Text>
              </Flex>
            </Flex>
          </BorderVerticalContainer>
        )}
      </Flex>
      {isMobile && (
        <MobileBottomShadowContainer>
          <Box
            sx={{
              width: 'calc(100% - 2rem)',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: '15%',
              a: {
                width: '100%',
                maxWidth: '100%',
                fontSize: '1.2rem',
                height: '3rem!important',
                borderRadius: '1rem !important'
              }
            }}
          >
            {currencyA && currencyB && (
              <>
                <StyledLink as={Link} to={`/add/${currencyId(currencyA!)}/${currencyId(currencyB!)}/${pairModeStable}`}>
                  Increase
                </StyledLink>
                <StyledLink
                  as={Link}
                  to={`/remove/${currencyId(currencyA!)}/${currencyId(currencyB!)}/${pairModeStable}`}
                >
                  Remove
                </StyledLink>
              </>
            )}
          </Box>
        </MobileBottomShadowContainer>
      )}
    </>
  )
}

export function BackToMyLiquidity({ showText = true, ...flexProps }: { showText?: boolean } & FlexProps) {
  // reset states on back
  // const dispatch = useDispatch<AppDispatch>()
  const history = useHistory()

  return (
    <Flex
      height={'1.8rem'}
      justifyContent="center"
      alignItems={'center'}
      sx={{
        'a,img': {
          height: '0.875rem',
          width: '0.875rem',
          marginRight: showText ? '1rem' : 'unset'
        },
        ...(flexProps.sx ? flexProps.sx : {})
      }}
      {...(() => {
        delete flexProps['sx']
        return flexProps
      })()}
    >
      <Link
        to="/liquidity"
        onClick={() => {
          // dispatch(resetMintState())
          history.goBack()
        }}
      >
        <img
          src={isMobile ? GoBackMobile : showText ? GoBackBolder : GoBack}
          alt="left-arrow"
          style={{
            display: 'flex',
            alignItems: 'baseline'
          }}
        />
      </Link>
      {showText && (
        <Text
          className="text-small"
          sx={
            isMobile
              ? {
                  fontFamily: 'Poppins',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  fontSize: '1rem',
                  lineHeight: '1.5rem',
                  alignItems: 'flex-end',
                  display: 'flex',
                  color: ' rgba(255, 255, 255, 0.4)',
                  transform: 'translateX(-1rem)'
                }
              : {
                  fontFamily: 'Poppins',
                  fontStyle: 'normal',
                  fontWeight: '200',
                  lineHeight: '1rem',
                  height: '1rem',
                  color: '#FFFFFF'
                }
          }
        >
          {isMobile ? 'Back' : 'Back to My Liquidity'}
        </Text>
      )}
    </Flex>
  )
}

const HeaderText = styled(Text).attrs((props) => {
  return {
    ...props,
    className: Array.isArray(props.className)
      ? [...props.className, 'text-small']
      : props.className
      ? [props.className, 'text-small']
      : ['text-small']
  }
})`
  color: #cccccc;
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  line-height: 0.8rem;
  font-size: max(0.8rem, 12px);
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
`
