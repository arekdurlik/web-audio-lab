import styled from 'styled-components'

export const NodeTitle = styled.span`
  font-weight: bold;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 31px;
`

export const NodeContainer = styled.div`
  box-sizing: border-box;
  background-color: white;
  border: 1px solid #000;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 135px;
  width: 135px;
  min-height: 45px;

  .react-flow__handle {
    border-color: #000;
    
    &.target {
      background-color: #fff;
    }

  }
`