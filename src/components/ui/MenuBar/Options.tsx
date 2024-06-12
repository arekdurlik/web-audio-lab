import { useEffect } from 'react'
import { Menu, MenuItem } from './styled'
import { useReactFlow } from 'reactflow'
import { useSettingsStore } from '../../../stores/settingsStore'

export function Options() {
  const edgeType = useSettingsStore(state => state.edgeType)
  const setEdgeType = useSettingsStore(state => state.setEdgeType)
  const uiScale = useSettingsStore(state => state.uiScale)
  const setUIScale = useSettingsStore(state => state.setUIScale)
  const reactFlowInstance = useReactFlow()

  useEffect(() => {
    const newEdges = reactFlowInstance.getEdges().map((edge) => {
      edge.type = edgeType
      return edge
    })
    reactFlowInstance.setEdges(newEdges)
  }, [edgeType])

 

  return <Menu width={95}>
    <MenuItem 
      icon={uiScale === 1 ? 'radio' : ''} 
      onClick={() => setUIScale(1)}
    >
      Small UI
    </MenuItem>
    <MenuItem 
      icon={uiScale === 2 ? 'radio' : ''} 
      onClick={() => setUIScale(2)}
    >
      Big UI
    </MenuItem>
    <hr/>
    <MenuItem 
      icon={edgeType === 'smoothstep' ? 'radio' : ''} 
      onClick={() => setEdgeType('smoothstep')}
    >
      Step edge
    </MenuItem>
    <MenuItem 
      icon={edgeType === 'default' ? 'radio' : ''} 
      onClick={() => setEdgeType('default')}
    >
      Bezier edge
    </MenuItem>

  </Menu>
}