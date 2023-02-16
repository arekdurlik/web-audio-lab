import { useState } from 'react'
import { Controls, MiniMap, useReactFlow } from 'reactflow'

export function FlowControls() {
  const [zoom, setZoom] = useState(1)
  const zoomLevels = [0.5, 0.75, 1, 1.5, 2]
  const reactFlowInstance = useReactFlow()

  return <>
    <MiniMap />
    <Controls 
      showInteractive={false} 
      position='bottom-right' 
      onZoomIn={() => {
        const newZoom = Math.min(4, zoom + 1)
        reactFlowInstance.zoomTo(zoomLevels[newZoom])
        setZoom(newZoom)
      }}
      onZoomOut={() => {
        const newZoom = Math.max(0, zoom - 1)
        reactFlowInstance.zoomTo(zoomLevels[newZoom])
        setZoom(newZoom)
      }}
    />
  </>
}