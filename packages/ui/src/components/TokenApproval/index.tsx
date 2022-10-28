import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const ApprovalView = styled.div`
  font-family: 'Poppins';
  font-style: normal;
  font-weight: 400;
  font-size: 0.9rem;
  color: #d7dce0;
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
      width: 6rem;
      background: transparent;
      outline: none;
      color: #d7dce0;
    }
    input {
      margin-right: 0.85rem;
    }
  }
`

export const TokenApprovalView = () => {
  const [approveParams, setApproveParams] = useState({
    custom: false,
    approveValue: '1000',
    tempValue: '1000'
  })
  useEffect(() => {
    const value = new BigNumber(approveParams.approveValue).toString(16)
    localStorage.setItem('redux_localstorage_simple_approve', value)
  }, [approveParams])
  return (
    <ApprovalView>
      <div className="approvalLine"></div>
      <div className="approvalTitle">Token Approval</div>
      <div className="approvalRow">
        <div
          className="approvalFlexBetweenCenter"
          onClick={() => {
            setApproveParams({
              ...approveParams,
              custom: false,
              approveValue: '1000'
            })
          }}
        >
          <input type="radio" name="approvalRadio cp" checked={!approveParams.custom} />
          <span>Suggest approval limit</span>
        </div>
        <div>
          <span>1000 </span>
          <span>USDT</span>
        </div>
      </div>
      <div className="approvalRow">
        <div
          className="approvalFlexBetweenCenter cp"
          onClick={() => {
            setApproveParams({
              ...approveParams,
              custom: true,
              approveValue: approveParams.tempValue
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
            value={approveParams?.approveValue || ''}
            onChange={(evt) => {
              const pureNum = evt.target.value.replace(/[^\d]/g, '') || ''
              setApproveParams({
                ...approveParams,
                approveValue: pureNum,
                tempValue: pureNum
              })
            }}
          />
          <span>USDT</span>
        </div>
      </div>
      <div className="approvalLine"></div>
    </ApprovalView>
  )
}
