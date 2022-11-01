import { MaxUint256 } from '@ethersproject/constants'
import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const ApprovalView = styled.div`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-size: 0.9rem;
  color: #d7dce0;
  .symbolLabel {
    margin-left: 0.5rem;
  }
  .approvalLine {
    border: 1px solid rgba(255, 255, 255, 0.2);
    margin: 1.7rem 0;
  }
  .approvalTitle {
    font-style: normal;
    font-weight: 500;
    font-size: 1rem;
    color: #ffffff;
    margin-bottom: 0.86rem;
  }
  .approvalFlexBetweenCenter {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .cp {
    cursor: pointer;
  }
  .approvalRow {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
    .customIpt {
      padding: 3px 6px;
      height: 1.8rem;
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 8px;
      width: 6.5rem;
      background: transparent;
      outline: none;
      color: #d7dce0;
    }
    input {
      margin-right: 0.85rem;
    }
  }
`

interface ITokenApprovalView {
  tokenSymbol?: string
}

export const TokenApprovalView = ({ tokenSymbol }: ITokenApprovalView) => {
  const [approveParams, setApproveParams] = useState({
    custom: false,
    customValue: '0',
    suggestValue: MaxUint256?.toString(),
    tempValue: '0'
  })
  useEffect(() => {
    const approveValue = approveParams.custom ? approveParams.customValue : approveParams.suggestValue
    const value = new BigNumber(approveValue).toString(16)
    localStorage.setItem('redux_localstorage_simple_approve', value)
  }, [approveParams])
  return (
    <ApprovalView>
      <div className="approvalLine"></div>
      <div className="approvalTitle">Token Approval</div>
      <div className="approvalRow">
        <div
          className="approvalFlexBetweenCenter cp"
          onClick={() => {
            setApproveParams({
              ...approveParams,
              custom: false,
              suggestValue: MaxUint256?.toString() || '1000'
            })
          }}
        >
          <input type="radio" name="approvalRadio cp" checked={!approveParams.custom} />
          <span>Suggest approval limit</span>
        </div>
        <div>
          <span>+∞</span>
          <span className="symbolLabel">{tokenSymbol}</span>
        </div>
      </div>
      <div className="approvalRow">
        <div
          className="approvalFlexBetweenCenter cp"
          onClick={() => {
            setApproveParams({
              ...approveParams,
              custom: true,
              customValue: approveParams.tempValue
            })
          }}
        >
          <input type="radio" name="approvalRadio" checked={approveParams.custom} />
          <span>Customize approval limit</span>
        </div>
        <div>
          <input
            className="customIpt"
            type="text"
            value={approveParams?.customValue || ''}
            onChange={(evt) => {
              const pureNum = evt.target.value.replace(/[^1-9]{0,1}(\d*(?:\.\d{0,30})?).*$/g, '$1') || ''
              setApproveParams({
                ...approveParams,
                customValue: pureNum,
                tempValue: pureNum
              })
            }}
          />
          <span className="symbolLabel">{tokenSymbol}</span>
        </div>
      </div>
      <div className="approvalLine"></div>
    </ApprovalView>
  )
}
