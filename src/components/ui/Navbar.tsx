import { ChangeEvent, useEffect, useState } from 'react'
import { useFlowStore } from '../../stores/flowStore'
import { useReactFlow } from 'reactflow'
import styled from 'styled-components'
import { FlexContainer } from '../../styled'
import { audio } from '../../main'
import { presets } from '../../presets'
import smooth from '/icons/edge_smooth.png'
import smoothLines from '/icons/edge_smooth_lines.png'
import sharp from '/icons/edge_sharp.png'
import sharpLines from '/icons/edge_sharp_lines.png'
import zoomIn from '/icons/zoom_in.png'
import zoomOut from '/icons/zoom_out.png'
import { surface } from '../../98'

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

  function handleLoadPreset(event: ChangeEvent<HTMLSelectElement>) {
    const index = presets.find(save => save.id === event.target.value)

    if (!index) return
    reactFlowInstance.setEdges([])
    reactFlowInstance.setNodes([])
    setTimeout(() => {
      reactFlowInstance.setEdges(index.obj.edges)
      reactFlowInstance.setNodes(index.obj.nodes)
      reactFlowInstance.setViewport(index.obj.viewport)
    })
  }

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
    const saveObj = JSON.stringify(reactFlowInstance.toObject())

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

        const obj = JSON.parse(result)

        reactFlowInstance.setEdges([])
        reactFlowInstance.setNodes([])
        setTimeout(() => {
          reactFlowInstance.setEdges(obj.edges)
          reactFlowInstance.setNodes(obj.nodes)
          reactFlowInstance.setViewport(obj.viewport)
        })
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
    <div>
      <TopBar>
        <TopBarButton>File</TopBarButton>
        <TopBarButton>Nodes</TopBarButton>
        <TopBarButton>Presets</TopBarButton>
        <TopBarButton>Options</TopBarButton>
        <TopBarButton>Help</TopBarButton>
      </TopBar>
      <BottomBar>
      
      <FlexContainer justify='space-between' width='100%'>
        <FlexContainer align='center' gap={5}>
          {/* <Logo>Web Audio Lab</Logo> */}
          <Button>New</Button>
          <Button onClick={handleSave}>Save</Button>
          <Button onClick={handleLoad}>Load</Button>
          <Button onClick={handleReload}>Reload</Button>
          <Button className={`${editMode && 'active'}`} onClick={() => setEditMode(!editMode)}>Edit mode</Button>
    
          <Button className={`${edgeType === 'smoothstep' && 'active'}`} onClick={setStep}>Step edge</Button>
          <Button className={`${edgeType === 'default' && 'active'}`} onClick={setBezier}>Bezier edge</Button>
        </FlexContainer>
        {/* <FlexContainer justify='flex-end' align='center' gap={10}>
        Load preset:
        <Select onChange={handleLoadPreset}>
          <option key='null'></option>
          {presets.map((o, i) => <option key={i} value={o.id}>{o.id}</option>)}
        </Select>
        </FlexContainer> */}
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

const Logo = styled.span`
font-size: 32px;
color: darkred;
font-weight: 600;
font-style: italic;
font-family: 'Pixel';
font-smoothing: none;
-webkit-font-smoothing: none;
display: flex;
gap: 10px;
text-shadow: 
  3px 3px 2px #00000022;
position: relative;
padding-inline: 10px;
`

const Trademark = styled.span`
font-size: 11px;
font-weight: 900;
`
const Button = styled.button`
padding: 5px 15px;
min-width: auto;
`

const IconButton = styled(Button)`
width: 24px;
padding: 0;
display: flex;
justify-content: center;
align-items: center;
`

const Section = styled.div`
position: relative;
display: flex;
flex-direction: column;
padding-right: 10px;
margin-right: 10px;
gap: 2px;
margin-top: 3px;



&:after {
  content: '';
  position: absolute;
  right: 0;
  top: 3px;
  height: 18px;
  width: 1px;
  background-color: #aaa;
}
`

const SectionTitle = styled.span`
font-size: 11px;
`

const SectionOptions = styled.div`
display: flex;
gap: 1px;
`
const Icon = styled.img`

`

const Input = styled.input`
padding: 9px;
font-size: 16px;
border: 2px inset;
outline: none;
`

const Select = styled.select`
font-size: 16px;
border: 2px inset;
outline: none;
`