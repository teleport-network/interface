import { ReactComponent as SearchIcon } from 'assets/svg/search.svg'
import Toggle from 'components/Toggle'
import { useFilterForStakingInfo } from 'hooks/farm/useFilterForStakingInfo'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../../components/Column'
import { RowBetween } from '../../components/Row'
// import { Countdown } from './Countdown'
import { useActiveWeb3React } from '../../hooks'
import { TYPE } from '../../theme'
import PoolCard from './PoolCard'

const PageWrapper = styled(AutoColumn)`
  max-width: 60rem;
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
  // border: 1px solid rgba(255, 255, 255, 0.4);
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
  width: 100%;

  .filter-option {
    display: flex;
    align-items: center;
    .toggleText {
      margin-left: 0.86rem;
    }
  }

  #searchBar {
  }
`

const StyledSearchInput = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.6rem 1rem;

  width: 20rem;
  height: 3rem;

  /* 透明度/纯白-0.2 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;

  margin-left: auto;
  input {
    background: transparent;
    width: 100%;
    border: 0;
    color: ${({ theme }) => theme.text1};

    &:focus {
      outline: none;
    }
  }
`

const StyledSearchIcon = styled(SearchIcon)`
  width: 1.7rem;
  margin-right: 0.8rem;
`

export default function FarmList() {
  const { chainId } = useActiveWeb3React()
  const [hideInActivePool, setHideInActivePool] = useState(true)
  const [filterOnlyStaked, setFilterOnlyStaked] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  console.debug('chainId', chainId)
  // const mchefContract = useChefContract(farmingConfig?.chefType || Chef.MINICHEF)
  // const positions = useChefPositions(mchefContract, undefined, chainId)
  const stakingInfos = useFilterForStakingInfo({
    stakedOnly: filterOnlyStaked,
    hideInactive: hideInActivePool,
    searchKeyword
  })
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

            <StyledSearchInput id="searchBar">
              <StyledSearchIcon />
              <input type="text" onChange={({ target }) => setSearchKeyword(target.value)} placeholder="Search Pools" />
            </StyledSearchInput>
          </FarmListFilterBar>
        </DataRow>

        <PoolSection>
          {stakingInfos.length === 0
            ? 'Loading...'
            : stakingInfos.map((_poolInfo) => {
                return <PoolCard key={_poolInfo.id} pid={_poolInfo.id} stakingInfo={_poolInfo} />
              })}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}
