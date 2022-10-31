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
  color: #ffffff;
  border-radius: 16px;
  box-sizing: border-box;
  height: 30px;
  font-family: 'IBM Plex Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 26px;
  text-align: center;
  text-transform: capitalize;
  color: #ffffff;

  .tokenIcon {
    width: 2.2rem;
    height: 2.2rem;
  }
  .networkLabelText {
    margin-left: 1rem;
    margin-right: 0.5rem;
  }
`
const NetBodyWrapStyle = styled.div`
  position: absolute;
  top: 2rem;
  padding-top: 1rem;
`

const NetBodyStyle = styled.div`
  padding: 1rem;
  color: #ffffff;
  width: 19rem;
  background: #19242f;
  border-radius: 1.7rem;
  font-weight: 500;
  font-size: 1rem;
  font-family: 'Poppins';
  .selectNetworkText {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 500;
    font-size: 12px;
    margin-bottom: 0.9rem;
  }
`
const NetBodyRowStyle = styled.div`
  padding: 0.9rem 1.1rem;
  position: relative;
  display: flex;
  align-items: center;
  &:hover {
    background: rgba(57, 225, 186, 0.1);
    border-radius: 0.9rem;
  }
  &:hover::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    background: #20b26c;
    box-shadow: 0px 0px 10px #01e676;
    position: absolute;
    right: 1.8rem;
  }
  > img {
    width: 2rem;
    height: 2rem;
    margin-right: 1.1rem;
  }
`

export function getRpcUrl(chainId: SupportedChainId): string {
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
  // SupportedChainId.ROPSTEN,
  // SupportedChainId.RINKEBY,
  SupportedChainId.OPTIMISM_GOERLI
]

const switchNet = (connector, chainIdNumber) => {
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

export default function Network() {
  const { connector, chainId } = useWeb3React()
  const [showNetSelect, setShowNetSelect] = useState(false)
  const info = getChainInfo(chainId)
  const defaultNetwork = getChainInfo(SupportedChainId.OPTIMISM_GOERLI)
  return (
    <NetworkStyled onMouseEnter={() => setShowNetSelect(true)} onMouseLeave={() => setShowNetSelect(false)}>
      <NetHeadStyle>
        {info ? (
          <>
            <img className="tokenIcon" src={info.logoUrl} alt="" />
            <span className="networkLabelText">{info.label}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="NetworkSelector__StyledChevronDown-sc-w04zhs-16 fxCAMp"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </>
        ) : (
          <>
            <NetBodyRowStyle>
              <img src={defaultNetwork.logoUrl} alt="" />
              <span>{defaultNetwork.label}</span>
            </NetBodyRowStyle>
            {/* <span>Switch Network</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="NetworkSelector__StyledChevronDown-sc-w04zhs-16 fxCAMp"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg> */}
          </>
        )}
      </NetHeadStyle>
      {showNetSelect && (
        <NetBodyWrapStyle>
          <NetBodyStyle>
            <div className="selectNetworkText">Select a network</div>
            {NETWORK_SELECTOR_CHAINS.map((chainIdNumber) => {
              const info = getChainInfo(chainIdNumber)
              return (
                <NetBodyRowStyle key={chainIdNumber} onClick={() => switchNet(connector, chainIdNumber)}>
                  <img src={info.logoUrl} alt="" />
                  <span>{info.label}</span>
                </NetBodyRowStyle>
              )
            })}
          </NetBodyStyle>
        </NetBodyWrapStyle>
      )}
    </NetworkStyled>
  )
}
