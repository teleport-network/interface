import { useWeb3React } from '@web3-react/core'
import { getChainInfo } from 'constants/chainInfo'
import { SupportedChainId } from 'constants/chains'
import { FALLBACK_URLS, RPC_URLS } from 'constants/networks'
import { useState } from 'react'
import styled from 'styled-components'

const NetworkStyled = styled.div`
  position: relative;
  margin-right: 1rem;
`
const NetHeadStyle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 2px solid #fff;
  color: #000000;
  border-radius: 16px;
  box-sizing: border-box;
  height: 30px;
  .tokenIcon {
    width: 22px;
    height: 22px;
    margin-right: 5px;
  }
`
const NetBodyStyle = styled.div`
  position: absolute;
  top: 30px;
  background-color: #fff;
  padding: 10px;
  color: #000000;
  border-radius: 16px;
  border: 2px solid #fff;
  width: 200px;
`
const NetBodyRowStyle = styled.div`
  &:hover {
    color: red;
  }
`

function getRpcUrl(chainId: SupportedChainId): string {
  switch (chainId) {
    case SupportedChainId.MAINNET:
    case SupportedChainId.RINKEBY:
    case SupportedChainId.ROPSTEN:
    case SupportedChainId.KOVAN:
    case SupportedChainId.GOERLI:
      return RPC_URLS[chainId][0]
    // Attempting to add a chain using an infura URL will not work, as the URL will be unreachable from the MetaMask background page.
    // MetaMask allows switching to any publicly reachable URL, but for novel chains, it will display a warning if it is not on the "Safe" list.
    // See the definition of FALLBACK_URLS for more details.
    default:
      return FALLBACK_URLS[chainId][0]
  }
}

const NETWORK_SELECTOR_CHAINS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.OPTIMISM_GOERLI
]

export default function Network() {
  const { connector, chainId } = useWeb3React()
  const [showNetSelect, setShowNetSelect] = useState(false)
  const info = getChainInfo(chainId)

  const switchNet = (chainIdNumber) => {
    ;(async () => {
      if (connector) {
        const chainIdHex = Number(chainIdNumber).toString(16)
        const chainId = `0x${chainIdHex}`
        const provider = await connector.getProvider()
        if (!chainIdHex || !provider) {
          return
        }
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
          })
        } catch (error) {
          const info = getChainInfo(chainIdNumber)
          const addChainParameter = {
            chainId,
            chainName: info.label,
            rpcUrls: [getRpcUrl(chainIdNumber)],
            nativeCurrency: info.nativeCurrency,
            blockExplorerUrls: [info.explorer]
          }
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [addChainParameter]
          })
        }
      }
    })()
  }
  return (
    <NetworkStyled onMouseEnter={() => setShowNetSelect(true)} onMouseLeave={() => setShowNetSelect(false)}>
      <NetHeadStyle>
        {info ? (
          <>
            <img className="tokenIcon" src={info.logoUrl} alt="" />
            <span>{info.label}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="NetworkSelector__StyledChevronDown-sc-w04zhs-16 fxCAMp"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </>
        ) : (
          <>
            <span>Switch Network</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="NetworkSelector__StyledChevronDown-sc-w04zhs-16 fxCAMp"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </>
        )}
      </NetHeadStyle>
      {showNetSelect && (
        <NetBodyStyle>
          <div>Select a network</div>
          {NETWORK_SELECTOR_CHAINS.map((chainIdNumber) => {
            const info = getChainInfo(chainIdNumber)
            return (
              <NetBodyRowStyle key={chainIdNumber} onClick={() => switchNet(chainIdNumber)}>
                {info.label}
              </NetBodyRowStyle>
            )
          })}
        </NetBodyStyle>
      )}
    </NetworkStyled>
  )
}
