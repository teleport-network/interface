import { TransactionResponse } from '@ethersproject/providers'
import { Chef } from 'constants/farm/chef.enum'
import { ChefStakingInfo } from 'hooks/farm/useChefStakingInfo'
import useGauge from 'hooks/farm/useGauge'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import useUSDCPrice from 'utils/useUSDCPrice'

import { useActiveWeb3React } from '../../hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import FormattedCurrencyAmount from '../FormattedCurrencyAmount'
import Modal from '../Modal'
// import { useStakingContract } from '../../hooks/useContract'
import { LoadingView, SubmittedView } from '../ModalViews'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
  color: white;
`
const RewardStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: 'Poppins';
  font-weight: 500;
  .column {
    .c-title {
      font-size: 1.05rem;
      line-height: 1.65rem;
      color: #cccccc;
    }
    .content {
      font-size: 1.2rem;
    }
  }
`

interface ClaimRewardModalProps {
  isOpen: boolean
  onDismiss: () => void
  pid: number
  stakingInfo: ChefStakingInfo
}

export default function ClaimRewardModal({ isOpen, onDismiss, pid, stakingInfo }: ClaimRewardModalProps) {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  // monitor call to help UI loading state
  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  const masterChef = useGauge(Chef.MINICHEF)

  const rewardTokenPrice = useUSDCPrice(stakingInfo?.rewardToken)

  // track and parse user input
  const stakingCurrency = stakingInfo?.stakingToken
  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onHarvestButtonClicked() {
    setAttempting(true)
    masterChef
      .harvest(pid)
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Claim Reward of Staking ${stakingCurrency.name}`
        })
        setHash(response.hash)
      })
      .catch((error: any) => {
        setAttempting(false)
        console.log(error)
      })
  }

  const computedPendingRewardInUSD = useMemo(() => {
    try {
      if (stakingInfo.pendingReward && rewardTokenPrice)
        return rewardTokenPrice?.quote(stakingInfo.pendingReward).toSignificant(2)
    } catch (error) {
      console.error('error when computedPendingRewardInUSD:', error)
    }
    return '--.--'
  }, [rewardTokenPrice, stakingInfo])

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader color="#FFFFFF" style={{ fontFamily: 'Dela Gothic One' }}>
              {t('claimRewards')}
            </TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOndismiss} color="#FFFFFF" />
          </RowBetween>
          <RewardStats>
            <div className="column">
              <div className="c-title">Token</div>
              <div className="content">{stakingInfo.rewardToken.symbol}</div>
            </div>
            <div className="column">
              <div className="c-title">Value</div>
              <div className="content">$ {computedPendingRewardInUSD}</div>
            </div>
            <div className="column">
              <div className="c-title">Amount</div>
              <div className="content">
                {stakingInfo.pendingReward ? (
                  <FormattedCurrencyAmount currencyAmount={stakingInfo.pendingReward} />
                ) : (
                  '--.--'
                )}
              </div>
            </div>
          </RewardStats>
          <ButtonError
            disabled={!!error}
            error={!!error && !!stakingInfo.stakedAmount}
            onClick={onHarvestButtonClicked}
            fontWeight={600}
            fontSize="1.2rem"
          >
            {error ?? t('claim')}
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.white fontSize={20}>
              {t('claiming')} {stakingInfo?.pendingReward.toSignificant(4)} {stakingInfo?.rewardToken.symbol}
            </TYPE.white>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.white fontSize={20}>
              {t('claimed')} {stakingInfo.rewardToken.symbol}!
            </TYPE.white>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
