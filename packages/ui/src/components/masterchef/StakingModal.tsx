import { TransactionResponse } from '@ethersproject/providers'
import { JSBI, TokenAmount } from '@teleswap/sdk'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { utils } from 'ethers'
import { ChefStakingInfo } from 'hooks/farm/useChefStakingInfo'
import useGauge from 'hooks/farm/useGauge'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTokenBalance } from 'state/wallet/hooks'
import styled from 'styled-components'
import { maxAmountSpend } from 'utils/maxAmountSpend'

import { useActiveWeb3React } from '../../hooks'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import CurrencyInputPanel from '../CurrencyInputPanel'
import Modal from '../Modal'
import { RowBetween } from '../Row'
// const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
//   display: flex;
//   justify-content: space-between;
//   padding-right: 20px;
//   padding-left: 20px;

//   opacity: ${({ dim }) => (dim ? 0.5 : 1)};
// `

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1.8rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: ChefStakingInfo
  // userLiquidityUnstaked: TokenAmount | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { chainId, account } = useActiveWeb3React()
  const { t } = useTranslation()
  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  // const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])

  const stakingCurrency = stakingInfo?.stakingToken

  const tokenAmount =
    stakingCurrency && typedValue
      ? new TokenAmount(stakingCurrency, utils.parseUnits(typedValue, stakingCurrency.decimals).toString())
      : undefined
  const stakeTokenBalance = useTokenBalance(account === null ? undefined : account, stakingCurrency)
  const [approval, approve] = useApproveCallback(tokenAmount, stakingInfo.address)
  const mchef = useGauge(stakingInfo.type, stakingInfo.address)
  console.debug('approval', approval)
  // const [parsedAmount, setParsedAmount] = useState('0')
  async function onStake() {
    setAttempting(true)
    /**
     * do some checks
     */
    if (!tokenAmount) {
      alert('Please your deposit amount to continue')
      return
    }
    if (tokenAmount?.greaterThan(stakeTokenBalance || JSBI.BigInt(0))) {
      alert('You do not have enough staked token')
      return
    }
    if (approval === ApprovalState.APPROVED) {
      mchef.deposit(utils.parseUnits(typedValue, stakingCurrency?.decimals)).then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Deposit liquidity`
        })
        setHash(response.hash)
      })
    } else {
      setAttempting(false)
      throw new Error('Attempting to stake without approval or a signature. Please contact support.')
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(stakeTokenBalance)
  // const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    if (maxAmountInput && maxAmountInput.toExact() !== '0') onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  if (!stakingCurrency) return <p>Loading...</p>

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader color="#FFFFFF" style={{ fontFamily: 'Dela Gothic One' }}>
              {t('stakeLpToken')}
            </TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} color="#FFFFFF" />
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={true}
            currency={stakingCurrency}
            // pair={dummyPair}
            label={''}
            disableCurrencySelect={true}
            id="stake-liquidity-token"
          />

          <RowBetween>
            {approval !== ApprovalState.APPROVED && (
              <ButtonConfirmed mr="0.5rem" onClick={approve} disabled={approval !== ApprovalState.NOT_APPROVED}>
                {t('approve')}
              </ButtonConfirmed>
            )}
            <ButtonError
              disabled={approval !== ApprovalState.APPROVED}
              // error={!!&& !!parsedAmount}
              onClick={onStake}
              fontWeight={600}
              fontSize="1.2rem"
            >
              {t('stakeLpToken')}
            </ButtonError>
          </RowBetween>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Depositing</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              {tokenAmount?.toSignificant(4)} {stakingCurrency?.symbol}
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              Deposited {tokenAmount?.toSignificant(4)} {stakingCurrency?.symbol}
            </TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
