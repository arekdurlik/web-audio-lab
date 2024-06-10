import { Menu, MenuItem } from './styled'
import { Tooltip } from '../Tooltip'
import { ReactFlowJsonObject, useReactFlow } from 'reactflow'
import { useFlowStore } from '../../../stores/flowStore'
import { audio } from '../../../main'

type Save = {
  edges: 'default' | 'smoothstep'
  flow: ReactFlowJsonObject
}

export function File({ onBlur }: { onBlur?: Function }) {
  const reactFlowInstance = useReactFlow()
  const { edgeType, setEdgeType,  } = useFlowStore()
  function handleReload() {
    const edges = reactFlowInstance.getEdges()
    const nodes = reactFlowInstance.getNodes()

    reactFlowInstance.setEdges([])
    reactFlowInstance.setNodes([])
    setTimeout(() => {
      reactFlowInstance.setEdges(edges)
      reactFlowInstance.setNodes(nodes)
    })

    audio.getLive()
  }

  async function handleSave() {
    const saveObj = JSON.stringify({
      edges: edgeType,
      flow: (reactFlowInstance.toObject())
    })

    const handle = await showSaveFilePicker({
      suggestedName: 'circuit.json',
      types: [{
          accept: { 'application/json': ['.json'] },
      }],
    })
  
    const blob = new Blob([saveObj])
    
    const writableStream = await handle.createWritable()
    await writableStream.write(blob)
    await writableStream.close()

  }

  async function handleLoad() {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        accept: { 'application/json': ['.json'] },
      }],
      excludeAcceptAllOption: true,
      multiple: false,
    })

    const file = await fileHandle.getFile()

    const fileReader = new FileReader()

    fileReader.onload = function(e: ProgressEvent<FileReader>) {
      if (e.target === null) return

      const result = e.target.result

      if (typeof result !== 'string') return

      const obj = JSON.parse(result) as Save
      
      if (obj.hasOwnProperty('flow') && obj.hasOwnProperty('edges')) {
        reactFlowInstance.setEdges([])
        reactFlowInstance.setNodes([])
        setTimeout(() => {
          reactFlowInstance.setEdges(obj.flow.edges)
          reactFlowInstance.setNodes(obj.flow.nodes)
          reactFlowInstance.setViewport(obj.flow.viewport)
          setEdgeType(obj.edges)
        })
      } else {
        console.error('Invalid save file format.')
      }
    }
    fileReader.readAsText(file)
    if (onBlur) onBlur()
  }

  return <Menu width={105}>
      <MenuItem>New</MenuItem>
      <MenuItem onClick={handleSave}>Save</MenuItem>
      <MenuItem onClick={handleLoad}>Load</MenuItem>
      <Tooltip content='Reload all nodes (can lower latency)'>
        <MenuItem onClick={handleReload}>Reload audio</MenuItem>
      </Tooltip>
    </Menu>
}