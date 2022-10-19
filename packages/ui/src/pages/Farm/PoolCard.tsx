import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import { Token, TokenAmount } from '@teleswap/sdk'
import { ReactComponent as AddIcon } from 'assets/svg/action/add.svg'
import { ReactComponent as ArrowDown } from 'assets/svg/action/arrowDown.svg'
import { ReactComponent as ArrowUp } from 'assets/svg/action/arrowUp.svg'
import { ReactComponent as QuestionIcon } from 'assets/svg/action/question.svg'
import { ReactComponent as RemoveIcon } from 'assets/svg/minus.svg'
import { ButtonPrimary } from 'components/Button'
import DoubleCurrencyLogo from 'components/DoubleLogo'
import ClaimRewardModal from 'components/masterchef/ClaimRewardModal'
import StakingModal from 'components/masterchef/StakingModal'
import UnstakingModal from 'components/masterchef/UnstakingModal'
import { LiquidityAsset } from 'constants/farming.config'
import { UNI } from 'constants/index'
import { useActiveWeb3React } from 'hooks'
import { useChefContractForCurrentChain } from 'hooks/farm/useChefContract'
import { ChefStakingInfo } from 'hooks/farm/useChefStakingInfo'
import { useChefPoolAPR } from 'hooks/farm/useFarmAPR'
import { ApprovalState, useApproveCallback } from 'hooks/useApproveCallback'
import { usePairSidesValueEstimate, usePairUSDValue } from 'hooks/usePairValue'
import React, { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import useUSDCPrice from 'utils/useUSDCPrice'

import { useTotalSupply } from '../../data/TotalSupply'
import { useColor } from '../../hooks/useColor'
import { TYPE } from '../../theme'

const HelpTextToolTip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    fontSize: '0.9rem'
  }
}))

const StatContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 7rem;
};
`

const StyledArrowDown = styled(ArrowDown)`
  width: 0.9rem;
  margin-left: 0.9rem;
`
const StyledArrowUp = styled(ArrowUp)`
  width: 0.9rem;
  margin-left: 0.9rem;
`

const Wrapper = styled.div<{ showBackground: boolean; bgColor: any }>`
  // border-radius: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: center;
  // overflow: hidden;
  // position: relative;
  // opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  color: ${({ theme, showBackground }) => (showBackground ? theme.white : theme.text1)} !important;

  :not(:last-child) {
    padding-bottom: 1.7rem;
    &:after {
      /** trick: i use persudo element to add a bottom line **/
      content: '';
      background-color: rgba(255, 255, 255, 0.2);
      height: 1px;
      width: 100%;
      position: relative;
      bottom: 0;
      left: 0;

      margin-top: 1.7rem;
    }
  }
`

const TopSection = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  // ${({ theme }) => theme.mediaWidth.upToSmall`
  //   grid-template-columns: 48px 1fr 96px;
  // `};
`

const StakingColumn = styled.div<{ isMobile: boolean; isHideInMobile?: boolean; isHideInDesktop?: boolean }>`
  ${({ isMobile }) => !isMobile && 'max-width: 14rem;'}
  width: 100%;
  flex-wrap: wrap;
  align-items: center;
  display: ${({ isMobile, isHideInDesktop, isHideInMobile }) =>
    (isMobile && isHideInMobile) || (!isMobile && isHideInDesktop) ? 'none' : 'flex'};
  &.mobile-details-button {
    margin-left: auto;
    width: auto;
  }
  .stakingColTitle {
    margin-bottom: 1rem;
  }
  .actions {
    margin-left: auto;

    svg.button {
      cursor: pointer;
    }
  }
  .estimated-staked-lp-value {
    font-family: 'Poppins';
    font-size: 0.9rem;
    margin-top: 0.33rem;
    width: 100%;
    color: rgba(255, 255, 255, 0.8);
  }
`

const MobilePoolDetailSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.85rem 0.72rem;

  width: 100%;
  background: #21303e;
  border-radius: 1.7rem;
  margin-top: 1.3rem;

  .actions {
    margin-left: auto;
    svg {
      width: 2.57rem;
      height: 2.57rem;
    }
    button {
      width: 7.15rem;
    }
  }
`

const LPTag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  width: 4.5rem;
  height: 1.62rem;

  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 0.5rem;

  margin-left: 0.75rem;
`

const StakingColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <TYPE.gray fontSize="0.9rem" width="100%" className="stakingColTitle">
    {children}
  </TYPE.gray>
)

export default function PoolCard({ pid, stakingInfo }: { pid: number; stakingInfo: ChefStakingInfo }) {
  const { chainId } = useActiveWeb3React()
  const mchefContract = useChefContractForCurrentChain()
  const history = useHistory()

  const currency0: Token | undefined = (stakingInfo.stakingAsset as LiquidityAsset).tokenA
  const currency1: Token | undefined = (stakingInfo.stakingAsset as LiquidityAsset).tokenB

  // const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  // // get the color of the token
  // const token = currency0 === ETHER ? token1 : token0
  // const WETH = currency0 === ETHER ? token0 : token1
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)
  const backgroundColor = useColor()

  const totalSupplyOfStakingToken = useTotalSupply(stakingInfo.stakingToken)
  const [stakingTokenPairStatus, stakingTokenPair] = stakingInfo.stakingPair

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('PoolCard data:', {
        pid,
        stakingTokenPair,
        stakingTokenPairStatus,
        totalSupplyOfStakingToken
      })
    }
  }, [pid, stakingTokenPair, totalSupplyOfStakingToken, stakingTokenPairStatus])

  const isStaking = true
  const rewardToken = UNI[chainId || 420]
  const [isMobileActionExpanded, setMobileActionExpansion] = useState(false)
  const priceOfRewardToken = useUSDCPrice(rewardToken)
  const totalValueLockedInUSD = usePairUSDValue(stakingTokenPair, stakingInfo.tvl)
  const calculatedApr = useChefPoolAPR(stakingInfo, stakingTokenPair, stakingInfo.stakedAmount, priceOfRewardToken)
  const [approval, approve] = useApproveCallback(new TokenAmount(stakingInfo.stakingToken, '1'), mchefContract?.address)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`approval status for ${stakingInfo.stakingAsset.name} is now: ${approval}`)
    }
  }, [stakingInfo, approval])
  const { liquidityValueOfToken0, liquidityValueOfToken1 } = usePairSidesValueEstimate(
    stakingTokenPair,
    new TokenAmount(stakingInfo.stakingToken, stakingInfo.stakedAmount.raw || '0')
  )

  const StakeManagementPanel = ({ isMobile, isHideInMobile }: { isMobile: boolean; isHideInMobile?: boolean }) => {
    return (
      <StakingColumn isMobile={isMobile} isHideInMobile={isHideInMobile}>
        <StakingColumnTitle>Staked {stakingInfo.stakingAsset.isLpToken ? 'LP' : 'Token'}</StakingColumnTitle>
        <TYPE.white fontSize="1.2rem" marginRight="1.5rem">
          {stakingInfo.stakedAmount.toSignificant(6)}
        </TYPE.white>
        {approval !== ApprovalState.NOT_APPROVED ? (
          <div className="actions">
            <AddIcon className="button" onClick={() => setShowStakingModal(true)} style={{ marginRight: 8 }} />
            <RemoveIcon className="button" onClick={() => setShowUnstakingModal(true)} />
          </div>
        ) : (
          <ButtonPrimary
            height={28}
            width="auto"
            fontSize="0.9rem"
            padding="0.166rem 0.4rem"
            borderRadius="0.133rem"
            onClick={approve}
          >
            Approve
          </ButtonPrimary>
        )}
        {stakingInfo.stakingAsset.isLpToken && (
          <div className="estimated-staked-lp-value">
            {liquidityValueOfToken0?.toSignificant(4)} {liquidityValueOfToken0?.token.symbol} +{' '}
            {liquidityValueOfToken1?.toSignificant(4)} {liquidityValueOfToken1?.token.symbol}
          </div>
        )}
      </StakingColumn>
    )
  }

  const EarningManagement = ({
    isMobile,
    isHideInMobile,
    marginTop
  }: {
    isMobile: boolean
    isHideInMobile?: boolean
    marginTop?: string | number
  }) => {
    const parsedPendingAmount = `${stakingInfo.pendingReward.toSignificant(6)} ${rewardToken.symbol}`
    return (
      <StakingColumn isMobile={isMobile} isHideInMobile={isHideInMobile} style={{ marginTop }}>
        <StakingColumnTitle>Earned Rewards</StakingColumnTitle>
        <TYPE.white
          title={parsedPendingAmount}
          fontSize="1.2rem"
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            maxWidth: isMobile ? '50%' : '70%'
          }}
        >
          {stakingInfo.pendingReward.toSignificant(6)} {rewardToken.symbol}
        </TYPE.white>
        <div className="actions">
          <ButtonPrimary
            height={28}
            width="auto"
            fontSize="0.9rem"
            padding="0.166rem 0.4rem"
            borderRadius="0.6rem"
            onClick={() => setShowClaimRewardModal(true)}
          >
            Claim
          </ButtonPrimary>
        </div>
      </StakingColumn>
    )
  }

  const MultiplierStatus = ({ isHideInMobile }: { isHideInMobile?: boolean }) => (
    <StakingColumn isMobile={isMobile} isHideInMobile={isHideInMobile} style={{ maxWidth: '5.5rem' }}>
      <TYPE.gray fontSize="0.9rem" width="100%" className="stakingColTitle" display="flex" alignItems="center">
        <span>Multiplier</span>
        <HelpTextToolTip
          placeholder="top-right"
          title={`The Multiplier represents the proportion of TELE rewards each farm receives, as a proportion of the TELE rebased each epoch.
For example, if a 1x farm received 1 TELE per epoch, a 40x farm would receive 40 TELE per epoch.
This amount is already included in all APR calculations for the farm`}
        >
          <QuestionIcon style={{ marginLeft: '0.3rem' }} />
        </HelpTextToolTip>
      </TYPE.gray>
      <TYPE.white fontSize="1.2rem" style={{ marginLeft: 'auto' }}>
        1X
      </TYPE.white>
    </StakingColumn>
  )

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <TopSection style={{ marginBottom: '1.7rem' }}>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} />
        <TYPE.white
          fontWeight={600}
          fontSize={18}
          style={{ marginLeft: '0.26rem', alignItems: 'center' }}
          width="14rem"
          display="flex"
        >
          {stakingInfo.stakingAsset.name}
          {stakingInfo.stakingAsset.isLpToken && (
            <LPTag>{stakingInfo.stakingAsset.isStable ? 'Stable' : 'Volatile'}</LPTag>
          )}
        </TYPE.white>
        {stakingInfo.stakingAsset.isLpToken && (
          <TYPE.green01
            marginLeft={isMobile ? 'auto' : 32}
            fontSize={14}
            onClick={() =>
              history.push(
                `/add/${currency0?.address}/${currency1?.address}/${
                  stakingInfo.stakingAsset.isLpToken && stakingInfo.stakingAsset.isStable
                }`
              )
            }
            style={{ cursor: 'pointer' }}
          >
            Get {stakingInfo.stakingAsset.name} LP
          </TYPE.green01>
        )}
      </TopSection>
      <StatContainer>
        <StakeManagementPanel isMobile={isMobile} isHideInMobile />
        <EarningManagement isMobile={isMobile} isHideInMobile />
        <StakingColumn isMobile={isMobile} style={{ maxWidth: '4.5rem' }}>
          <StakingColumnTitle>APR</StakingColumnTitle>
          <TYPE.white fontSize="1.2rem">
            {calculatedApr && calculatedApr !== Infinity ? calculatedApr.toFixed(2) : '--.--'}%
          </TYPE.white>
        </StakingColumn>
        <StakingColumn isMobile={isMobile} style={{ maxWidth: '12rem' }}>
          <StakingColumnTitle>Liquidity TVL</StakingColumnTitle>
          <TYPE.white fontSize="1.2rem">
            $ {totalValueLockedInUSD ? totalValueLockedInUSD.toSignificant(6) : '--.--'}
          </TYPE.white>
        </StakingColumn>
        <MultiplierStatus isHideInMobile />
        <StakingColumn isMobile={isMobile} isHideInDesktop className="mobile-details-button">
          <TYPE.green01
            fontSize="0.97rem"
            onClick={() => setMobileActionExpansion((prevState) => !prevState)}
            style={{ cursor: 'pointer', display: 'flex' }}
          >
            Details
            {!isMobileActionExpanded ? <StyledArrowDown /> : <StyledArrowUp />}
          </TYPE.green01>
        </StakingColumn>
      </StatContainer>
      {isMobile && isMobileActionExpanded && (
        <MobilePoolDetailSection>
          <StakeManagementPanel isMobile />
          <EarningManagement isMobile marginTop="1.28rem" />
          <MultiplierStatus />
        </MobilePoolDetailSection>
      )}
      <>
        <StakingModal
          stakingInfo={stakingInfo}
          isOpen={showStakingModal}
          pid={pid}
          onDismiss={() => setShowStakingModal(false)}
        />
        <UnstakingModal
          stakingInfo={stakingInfo}
          isOpen={showUnstakingModal}
          pid={pid}
          onDismiss={() => setShowUnstakingModal(false)}
        />
        <ClaimRewardModal
          isOpen={showClaimRewardModal}
          pid={pid}
          stakingInfo={stakingInfo}
          onDismiss={() => setShowClaimRewardModal(false)}
        />
      </>
    </Wrapper>
  )
}
