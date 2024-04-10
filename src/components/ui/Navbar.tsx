import { useFlowStore } from '../../stores/flowStore'
import { ReactFlowJsonObject, useReactFlow } from 'reactflow'
import styled from 'styled-components'
import { FlexContainer } from '../../styled'
import { audio } from '../../main'
import { surface } from '../../98'
import { useEffect } from 'react'
import { Tooltip } from './Tooltip'

type Save = {
  edges: 'default' | 'smoothstep'
  flow: ReactFlowJsonObject
}
export function Navbar() {
  const reactFlowInstance = useReactFlow()
  const { edgeType, editMode, setEdgeType, setEditMode } = useFlowStore()
  
  useEffect(() => {
    const newEdges = reactFlowInstance.getEdges().map((edge) => {
      edge.type = edgeType
      return edge
    })
    reactFlowInstance.setEdges(newEdges)
  }, [edgeType])

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
  }

  function setStep() {
    setEdgeType('smoothstep')
  }
  
  function setBezier() {
    setEdgeType('default')
  }

  return (
    <div onWheel={e => { e.stopPropagation() }}>
      <TopBar>
        <TopBarButton>File</TopBarButton>
        <TopBarButton>Presets</TopBarButton>
        <TopBarButton>Options</TopBarButton>
        <TopBarButton>Help</TopBarButton>
      </TopBar>
      <BottomBar>
      
      <FlexContainer justify='space-between' width='100%'>
        <FlexContainer align='center' gap={5}>
          <Button>New</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleLoad}>Load</Button>
          <Tooltip content='Reload all nodes (can lower latency)'>
            <Button onClick={handleReload}>Reload</Button>
          </Tooltip>
          <Button className={`${editMode && 'active'}`} onClick={() => setEditMode(!editMode)}>Edit mode</Button>
    
          <Button className={`${edgeType === 'smoothstep' && 'active'}`} onClick={setStep}>Step edge</Button>
          <Button className={`${edgeType === 'default' && 'active'}`} onClick={setBezier}>Bezier edge</Button>
        </FlexContainer>
      </FlexContainer>
      </BottomBar>
    </div>
  )
}



const TopBar = styled.div`
border: 1px outset;
position: relative;
background-color: ${surface};
width: 100%;
padding-block: 3px;
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

const BottomBar = styled.div`
background-color: ${surface};
padding-top: 1px;
padding-bottom: 1px;
display: flex;
gap: 10px;
align-items: center;
border: 1px outset;
padding-inline: 2px;
`

const Button = styled.button`
padding: 5px 15px;
min-width: auto;
`
