import { JSBI } from '@teleswap/sdk'

import { ChefStakingInfo, useChefStakingInfo } from './useChefStakingInfo'

type StakingInfoFilter = {
  stakedOnly?: boolean
  hideInactive?: boolean
  searchKeyword?: string
}

/**
 * @param `a` the object that need to check is ChefStakingInfo or not
 * @returns `a` will be type casted into ChefStakingInfo by ts safely
 */
function isNotDisabledPool(a: ChefStakingInfo | undefined): a is ChefStakingInfo {
  return !!a && !!a.id
}

export function useFilterForStakingInfo({ stakedOnly, hideInactive = true, searchKeyword }: StakingInfoFilter) {
  const stakingInfos = useChefStakingInfo()
  const hideInactiveFilter = (stakingInfo: ChefStakingInfo) => {
    const shouldHide = hideInactive && stakingInfo.inactive
    return !shouldHide
  }
  const stakedOnlyFilter = (stakingInfo: ChefStakingInfo) => {
    const isThisPoolNotStaked = stakedOnly && stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))
    return !isThisPoolNotStaked
  }
  const nameSearchFilter = (stakingInfo: ChefStakingInfo) => {
    return !searchKeyword || stakingInfo.stakingAsset.name.search(searchKeyword) > -1
  }
  return stakingInfos
    .filter(isNotDisabledPool) // type safe filter to make sure all returned item are not undefined
    .filter(hideInactiveFilter)
    .filter(stakedOnlyFilter)
    .filter(nameSearchFilter)
}
