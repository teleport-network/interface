import styled from 'styled-components'

const ToggleElement = styled.span<{ isActive?: boolean; isOnSwitch?: boolean }>`
  // padding: 0.25rem 0.5rem;
  border-radius: 100%;
  background: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.primary1 : '#D9D9D9') : 'none')};
  // color: ${({ theme, isActive, isOnSwitch }) => (isActive ? (isOnSwitch ? theme.white : theme.text2) : theme.text3)};
  font-size: 1rem;
  font-weight: 400;

  // padding: 0.35rem 0.6rem;
  // border-radius: 12px;
  :hover {
    user-select: ${({ isOnSwitch }) => (isOnSwitch ? 'none' : 'initial')};
  }
  width: 1rem;
  height: 1rem;
`

const StyledToggle = styled.button<{ isActive?: boolean; activeElement?: boolean }>`
  border-radius: 1.2rem;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  width: fit-content;
  cursor: pointer;
  outline: none;
  padding: 0;
  width: 2.8rem;
  height: 1.4rem;

  align-items: center;
  padding: 0.2rem;
`

export interface ToggleProps {
  id?: string
  isActive: boolean
  toggle: () => void
}

export default function Toggle({ id, isActive, toggle }: ToggleProps) {
  return (
    <StyledToggle id={id} isActive={isActive} onClick={toggle}>
      <ToggleElement isActive={!isActive} isOnSwitch={false}></ToggleElement>
      <ToggleElement isActive={isActive} isOnSwitch={true} style={{ marginLeft: 'auto' }}></ToggleElement>
    </StyledToggle>
  )
}
