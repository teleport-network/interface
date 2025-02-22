import { Contract } from '@ethersproject/contracts'
import AdminGaugeABI from '@teleswap/contracts/build/AdminGauge.json'
import AdminGaugeProxyABI from '@teleswap/contracts/build/AdminGaugeProxy.json'
import BribeABI from '@teleswap/contracts/build/Bribe.json'
import BribeFactoryABI from '@teleswap/contracts/build/BribeFactory.json'
import ITeleswapV2PairABI from '@teleswap/contracts/build/ITeleswapV2Pair.json'
import StableGaugeABI from '@teleswap/contracts/build/StableGauge.json'
import StableGaugeProxyABI from '@teleswap/contracts/build/StableGaugeProxy.json'
import VariableGaugeABI from '@teleswap/contracts/build/VariableGauge.json'
import VariableGaugeProxyABI from '@teleswap/contracts/build/VariableGaugeProxy.json'
import { ChainId, WETH } from '@teleswap/sdk'
import { abi as GOVERNANCE_ABI } from '@uniswap/governance/build/GovernorAlpha.json'
import { abi as UNI_ABI } from '@uniswap/governance/build/Uni.json'
import { abi as STAKING_REWARDS_ABI } from '@uniswap/liquidity-staker/build/StakingRewards.json'
import { abi as MERKLE_DISTRIBUTOR_ABI } from '@uniswap/merkle-distributor/build/MerkleDistributor.json'
import { GaugeType } from 'constants/farm/gauge.enum'
import { useMemo } from 'react'

import {
  ADMIN_GAUGE_PROXY_ADDRESS,
  BRIBE_FACTORY_ADDRESS,
  GOVERNANCE_ADDRESS,
  MASTERCHEFV2_ADDRESSBOOK,
  MASTERCHEF_ADDRESSBOOK,
  MERKLE_DISTRIBUTOR_ADDRESS,
  MINICHEF_ADDRESS,
  STABLE_GAUGE_PROXY_ADDRESS,
  SUSHI_ADDRESS,
  UNI,
  VARIABLE_GAUGE_PROXY_ADDRESS
} from '../constants'
import {
  ARGENT_WALLET_DETECTOR_ABI,
  ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS
} from '../constants/abis/argent-wallet-detector'
import ENS_PUBLIC_RESOLVER_ABI from '../constants/abis/ens-public-resolver.json'
import ENS_ABI from '../constants/abis/ens-registrar.json'
import { ERC20_BYTES32_ABI } from '../constants/abis/erc20'
import ERC20_ABI from '../constants/abis/erc20.json'
import MASTERCHEF_V2_ABI from '../constants/abis/masterchef-v2.json'
import MASTERCHEF_ABI from '../constants/abis/masterchef.json'
import { MIGRATOR_ABI, MIGRATOR_ADDRESS } from '../constants/abis/migrator'
import MINICHEF_ABI from '../constants/abis/minichef-v2.json'
import SUSHI_ABI from '../constants/abis/sushi.json'
import UNISOCKS_ABI from '../constants/abis/unisocks.json'
import WETH_ABI from '../constants/abis/weth.json'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from '../constants/multicall'
import { getContract } from '../utils'
import { useActiveWeb3React } from './index'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { library, account } = useActiveWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !library) return null
    try {
      return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, library, withSignerIfPossible, account])
}

export function useV2MigratorContract(): Contract | null {
  return useContract(MIGRATOR_ADDRESS, MIGRATOR_ABI, true)
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? WETH[chainId].address : undefined, WETH_ABI, withSignerIfPossible)
}

export function useArgentWalletDetectorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? ARGENT_WALLET_DETECTOR_MAINNET_ADDRESS : undefined,
    ARGENT_WALLET_DETECTOR_ABI,
    false
  )
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GÖRLI:
      case ChainId.ROPSTEN:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean): Contract | null {
  return useContract(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, ITeleswapV2PairABI, withSignerIfPossible)
}

export function useMulticallContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && MULTICALL_NETWORKS[chainId], MULTICALL_ABI, false)
}

export function useMerkleDistributorContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MERKLE_DISTRIBUTOR_ADDRESS[chainId] : undefined, MERKLE_DISTRIBUTOR_ABI, true)
}

export function useGovernanceContract(): Contract | null {
  return useContract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, true)
}

export function useUniContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? UNI[chainId].address : undefined, UNI_ABI, true)
}

export function useStakingContract(stakingAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(stakingAddress, STAKING_REWARDS_ABI, withSignerIfPossible)
}

export function useSocksController(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(
    chainId === ChainId.MAINNET ? '0x65770b5283117639760beA3F867b69b3697a91dd' : undefined,
    UNISOCKS_ABI,
    false
  )
}

export function useSushiContract(withSignerIfPossible = true): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? SUSHI_ADDRESS[chainId] : undefined, SUSHI_ABI, withSignerIfPossible)
}

export function useGaugeContract(gaugeType: GaugeType, gaugeAddress: string, withSignerIfPossible = true) {
  const theGaugeABI =
    gaugeType === GaugeType.ADMIN ? AdminGaugeABI : gaugeType === GaugeType.STABLE ? StableGaugeABI : VariableGaugeABI
  const gaugeContract = useContract(gaugeAddress, theGaugeABI, withSignerIfPossible)
  return [gaugeContract, gaugeType] as const
}

export function useGaugeProxyContract(gaugeType: GaugeType, withSignerIfPossible = true) {
  const { chainId } = useActiveWeb3React()
  const theGaugeProxyABI =
    gaugeType === GaugeType.ADMIN
      ? AdminGaugeProxyABI
      : gaugeType === GaugeType.STABLE
      ? StableGaugeProxyABI
      : VariableGaugeProxyABI
  const theGaugeProxyAddressMap =
    gaugeType === GaugeType.ADMIN
      ? ADMIN_GAUGE_PROXY_ADDRESS
      : gaugeType === GaugeType.STABLE
      ? STABLE_GAUGE_PROXY_ADDRESS
      : VARIABLE_GAUGE_PROXY_ADDRESS
  const gaugeProxyContract = useContract(
    chainId ? theGaugeProxyAddressMap[chainId] : undefined,
    theGaugeProxyABI,
    withSignerIfPossible
  )
  return [gaugeProxyContract, gaugeType] as const
}

export function useBribeContract(address: string, withSignerIfPossible = true): Contract | null {
  return useContract(address, BribeABI, withSignerIfPossible)
}

export function useBribeFactoryContract(withSignerIfPossible = true): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? BRIBE_FACTORY_ADDRESS[chainId] : undefined, BribeFactoryABI, withSignerIfPossible)
}

export function useMasterChefContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MASTERCHEF_ADDRESSBOOK[chainId] : undefined, MASTERCHEF_ABI, withSignerIfPossible)
}

export function useMasterChefV2Contract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MASTERCHEFV2_ADDRESSBOOK[chainId] : undefined, MASTERCHEF_V2_ABI, withSignerIfPossible)
}

export function useMiniChefContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId ? MINICHEF_ADDRESS[chainId] : undefined, MINICHEF_ABI, withSignerIfPossible)
}
