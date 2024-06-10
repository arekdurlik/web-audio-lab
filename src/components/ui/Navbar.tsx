import { useFlowStore } from '../../stores/flowStore'
import { useReactFlow } from 'reactflow'
import styled from 'styled-components'
import { surface, windowBorder } from '../../98'
import { useEffect } from 'react'
import { MenuBar } from './MenuBar'

export function Navbar() {

  return (
    <Container onWheel={e => { e.stopPropagation() }}>
      <MenuBar/>
    </Container>
  )
}

const Container = styled.div`
display: flex;
justify-content: space-between;
`
const TopBarButton = styled.span`
border: 1px solid transparent;
padding: 2px 10px;
&:hover {
  border: 1px dashed #86cfff;
  background-color: #abddff6d;
  cursor: default;
}
`

export const TopBarOption = styled.span`
  position: relative;
  &:hover {
    ${TopBarButton} {
      border: 1px dashed #86cfff;
      background-color: #abddff6d;
      cursor: default;
    }

  }
`
