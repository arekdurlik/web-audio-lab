import { useEffect } from 'react'
import { useFlowStore } from '../../stores/flowStore'
import { useReactFlow } from 'reactflow'
import styled from 'styled-components'

export function Navbar() {
  const reactFlowInstance = useReactFlow()
  const edgeType = useFlowStore(state => state.edgeType)
  const setEdgeType = useFlowStore(state => state.setEdgeType)
  const setAnimated = useFlowStore(state => state.setAnimated)
  const animated = useFlowStore(state => state.animated)

  useEffect(() => {
    const newEdges = reactFlowInstance.getEdges().map((edge) => {
      edge.type = edgeType
      edge.animated = animated
      return edge
    })
    reactFlowInstance.setEdges(newEdges)
  }, [edgeType, animated])


  return (
    <Wrapper>
      <button onClick={() => setEdgeType(edgeType === 'smoothstep' ? 'default' : 'smoothstep')}>Edge type</button>
      <button onClick={() => setAnimated(animated ? false : true)}>Edge animation</button>
    </Wrapper>
  )
}

const Wrapper = styled.div`
top: 0;
left: 0;
right: 0;
background-color: #fff;
z-index: 1000;
border-bottom: 1px solid #000;
padding: 10px;
display: flex;
gap: 10px;
align-items: center;
`