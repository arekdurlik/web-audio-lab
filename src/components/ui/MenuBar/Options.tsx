import { useEffect } from 'react'
import { useFlowStore } from '../../../stores/flowStore'
import { Menu, MenuItem } from './styled'
import { useReactFlow } from 'reactflow'

export function Options() {
  const { setEdgeType, edgeType } = useFlowStore()
  const reactFlowInstance = useReactFlow()

  useEffect(() => {
    const newEdges = reactFlowInstance.getEdges().map((edge) => {
      edge.type = edgeType
      return edge
    })
    reactFlowInstance.setEdges(newEdges)
  }, [edgeType])

  function setStep() {
    setEdgeType('smoothstep')
  }
  
  function setBezier() {
    setEdgeType('default')
  }

  return <Menu width={95}>
      <MenuItem 
      icon={edgeType === 'smoothstep' ? 'radio' : ''} 
      onClick={() => setStep()}
    >
      Step edge
    </MenuItem>
    <MenuItem 
      icon={edgeType === 'default' ? 'radio' : ''} 
      onClick={() => setBezier()}
    >
      Bezier edge
    </MenuItem>

  </Menu>
}