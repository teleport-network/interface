import CopyIconSvg from 'assets/svg/copy.svg'
import React from 'react'
import { CheckCircle } from 'react-feather'
import styled from 'styled-components'

import useCopyClipboard from '../../hooks/useCopyClipboard'
import { LinkStyledButton } from '../../theme'

const CopyIcon = styled(LinkStyledButton)`
  color: ${({ theme }) => theme.text3};
  flex-shrink: 0;
  display: flex;
  text-decoration: none;
  font-size: 0.825rem;
  :hover,
  :active,
  :focus {
    text-decoration: none;
    color: ${({ theme }) => theme.text2};
  }
`
const TransactionStatusText = styled.span`
  margin-left: 0.25rem;
  font-size: 0.825rem;
  ${({ theme }) => theme.flexRowNoWrap};
  align-items: center;
`

export default function CopyHelper(props: { toCopy: string; children?: React.ReactNode }) {
  const [isCopied, setCopied] = useCopyClipboard()

  return (
    <CopyIcon onClick={() => setCopied(props.toCopy)}>
      {isCopied ? (
        <TransactionStatusText>
          <CheckCircle size={'1rem'} />
          <TransactionStatusText>Copied</TransactionStatusText>
        </TransactionStatusText>
      ) : (
        <TransactionStatusText>
          {/* <Copy size={'16'} /> */}
          <img src={CopyIconSvg} alt="copy-icon" style={{ width: '1rem', height: '1rem' }} />
        </TransactionStatusText>
      )}
      {isCopied ? '' : props.children}
    </CopyIcon>
  )
}
