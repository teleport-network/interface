// import { Chef } from 'constants/farm/chef.enum'
// import { CHAINID_TO_FARMING_CONFIG } from 'constants/farming.config'
// import { useChefPositions } from 'hooks/farm/useChefPositions'
// import { useChefContract } from 'hooks/farm/useChefContract'
import Toggle from 'components/Toggle'
import { useChefStakingInfo } from 'hooks/farm/useChefStakingInfo'
// import { useMasterChefPoolInfo } from 'hooks/farm/useMasterChefPoolInfo'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
// import { Countdown } from './Countdown'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'
import PoolCard from './PoolCard'

// import { JSBI } from '@teleswap/sdk'
// import { BIG_INT_ZERO } from '../../constants'
// import { OutlineCard } from '../../components/Card'

const PageWrapper = styled(AutoColumn)`
  max-width: 80rem;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  width: 100%;
`};
`

const PoolSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  height: 60vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 24px;
  grid-template-columns: 1fr;
  // row-gap: 24px;
  width: 100%;
  justify-self: center;
  background: rgba(25, 36, 47, 1);
  padding: 3.5vw
  color: #39e1ba;

  font-size: 1rem;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

const FarmListFilterBar = styled.div`
  display: flex;

  .filter-option {
    display: flex;
    align-items: center;
    .toggleText {
      margin-left: 0.86rem;
    }
  }
`

export default function FarmList() {
  const { chainId } = useActiveWeb3React()
  const [hideInActivePool, setHideInActivePool] = useState(false)
  const [filterOnlyStaked, setFilterOnlyStaked] = useState(true)
  console.debug('chainId', chainId)
  // const mchefContract = useChefContract(farmingConfig?.chefType || Chef.MINICHEF)
  // const positions = useChefPositions(mchefContract, undefined, chainId)
  const stakingInfos = useChefStakingInfo()
  useEffect(() => {
    console.info('useChefStakingInfo', stakingInfos)
  }, [stakingInfos])
  // // staking info for connected account
  // const stakingInfos = useStakingInfo()

  return (
    <PageWrapper gap="lg" justify="center">
      <AutoColumn gap="lg" style={{ width: '100%' }}>
        <DataRow style={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
          <TYPE.largeHeader color="#FFF" style={{ marginTop: '0.5rem' }}>
            Farming Pools
          </TYPE.largeHeader>
          <TYPE.subHeader color="#FFF" style={{ marginTop: '12px', width: '100%' }}>
            Stake LP tokens to earn rewards
          </TYPE.subHeader>
          <FarmListFilterBar>
            <div className="filter-option" style={{ marginRight: '2.6rem' }}>
              <Toggle isActive={filterOnlyStaked} toggle={() => setFilterOnlyStaked((state) => !state)} />
              <TYPE.white fontSize="1.2rem" className="toggleText">
                Staked
              </TYPE.white>
            </div>
            <div className="filter-option">
              <Toggle isActive={hideInActivePool} toggle={() => setHideInActivePool((state) => !state)} />
              <TYPE.white fontSize="1.2rem" className="toggleText">
                Hide inactive pools
              </TYPE.white>
            </div>
          </FarmListFilterBar>
        </DataRow>

        <PoolSection>
          {stakingInfos.length === 0
            ? 'Loading...'
            : stakingInfos.map((_poolInfo, pid) => {
                if (!_poolInfo) return null
                if (_poolInfo.isHidden) return null
                return <PoolCard key={pid} pid={pid} stakingInfo={_poolInfo} />
              })}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
