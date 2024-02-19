import { ChangeEvent, useEffect, useState } from 'react'
import { useFlowStore } from '../../stores/flowStore'
import { ReactFlowJsonObject, useReactFlow } from 'reactflow'
import styled from 'styled-components'
import { FlexContainer } from '../../styled'
import { audio } from '../../main'
import { presets } from '../../presets'
export function Navbar() {
  const reactFlowInstance = useReactFlow()
  const edgeType = useFlowStore(state => state.edgeType)
  const setEdgeType = useFlowStore(state => state.setEdgeType)
  const setAnimated = useFlowStore(state => state.setAnimated)
  const animated = useFlowStore(state => state.animated)
  const [saveName, setSaveName] = useState('')
  const [saves, setSaves] = useState<{ id: string, obj: ReactFlowJsonObject }[]>([])
  
  useEffect(() => {
    const saves = localStorage.getItem('saves')
    if (!saves) return

    setSaves(JSON.parse(saves))
  }, [])
  useEffect(() => {
    const newEdges = reactFlowInstance.getEdges().map((edge) => {
      edge.type = edgeType
      edge.animated = animated
      return edge
    })
    reactFlowInstance.setEdges(newEdges)
  }, [edgeType, animated])

  async function handleSave() {
    if (saveName === '') return

    const saves = localStorage.getItem('saves')

    const saveObj = {
      id: saveName,
      obj: reactFlowInstance.toObject()
    }
    
    if (!saves) {
      localStorage.setItem('saves', JSON.stringify([saveObj]))
      setSaves([saveObj])
    } else {
      const parsed = await JSON.parse(saves)
      parsed.push(saveObj)
      setSaves(parsed)
      localStorage.setItem('saves', JSON.stringify(parsed))
    }
  }

  function handleLoad(event: ChangeEvent<HTMLSelectElement>) {
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


  return (
    <Wrapper>
      <FlexContainer justify='space-between' width='100%'>
        <FlexContainer align='center' gap={10}>
        <Logo>Web Audio Circuit Creator<Trademark>TM</Trademark></Logo>
        <Button onClick={() => setEdgeType(edgeType === 'smoothstep' ? 'default' : 'smoothstep')}>Edge type</Button>
        <Button onClick={() => setAnimated(animated ? false : true)}>Edge animation</Button>
        <Button onClick={handleReload}>Reload</Button>
        {/* Title:
        <Input type='text' value={saveName} onChange={(e) => setSaveName(e.target.value)} />
        <Button onClick={handleSave}>Save</Button> */}
        </FlexContainer>
        <FlexContainer justify='flex-end' align='center' gap={10}>
        Load:
        <Select onChange={handleLoad}>
          <option key='null'></option>
          {presets.map((o, i) => <option key={i} value={o.id}>{o.id}</option>)}
        </Select>
        </FlexContainer>
      </FlexContainer>
        
    </Wrapper>
  )
}

const Logo = styled.span`
font-size: 32px;
color: darkred;
font-weight: 600;
font-style: italic;
font-smoothing: none;
-webkit-font-smoothing: none;
display: flex;
gap: 10px;
text-shadow: 
  3px 3px 2px #00000022;
position: relative;
padding: 5px;
`

const Trademark = styled.span`
font-size: 11px;
font-weight: 900;
`
const Button = styled.button`
padding: 10px;
border: 3px outset;
background-color: #d7d5cf;

&:hover {
  background-color: #c8c6c0; 
}

&:active {
  border: 3px inset;
}
`

const Wrapper = styled.div`
padding: 5px;
top: 0;
left: 0;
right: 0;
background-color: #d7d5cf;
z-index: 1000;
border-bottom: 1px solid #000;
display: flex;
gap: 10px;
align-items: center;
`

const Input = styled.input`
padding: 9px;
font-size: 16px;
border: 2px inset;
outline: none;
`

const Select = styled.select`
padding: 9px;
font-size: 16px;
border: 2px inset;
outline: none;
`