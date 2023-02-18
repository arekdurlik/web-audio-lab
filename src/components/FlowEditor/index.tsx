import { DragEvent, useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  Edge,
  Connection,
  ConnectionLineType,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { initialNodes, nodeTypes, propOptions } from './utils'
import { FlowControls } from './Controls'
import { useNodeStore } from '../../stores/nodeStore'
import { useFlowStore } from '../../stores/flowStore'
import styled from 'styled-components'

export function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const reactFlowInstance = useReactFlow()
  const setConnections = useNodeStore(state => state.setConnections)
  const edgeUpdateSuccessful = useRef(true)
  const getEdgeType = useFlowStore(state => state.getEdgeType)
  const isAnimated = useFlowStore(state => state.isAnimated)

  useEffect(() => {
    const connections = edges.map(edge => ({ source: edge.sourceHandle, target: edge.targetHandle }))
    setConnections(connections)
  }, [edges])

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: DragEvent) => {
      if (reactFlowWrapper.current === null) return

      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
      const type = event.dataTransfer.getData('application/reactflow')

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: String(new Date()),
        type,
        position,
        data: { label: `${type} node` },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [reactFlowInstance]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeUpdateSuccessful.current = true
    setEdges((els) => updateEdge(oldEdge, newConnection, els))
  }, [])

  const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
    if (!edgeUpdateSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id))
    }

    edgeUpdateSuccessful.current = true
  }, [])

  const onConnect = useCallback((params: Edge | Connection) => setEdges((edges) => {
    const type = getEdgeType()
    return addEdge({ 
      ...params, 
      type, 
      style: { stroke: `#000`, strokeWidth: 1 }, 
      pathOptions: { borderRadius: 0, offset: 19, curvature: 0.5 }
    } as any, edges)
  }), [setEdges])

  return <Wrapper ref={reactFlowWrapper}>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      snapToGrid
      snapGrid={[8, 8]}
      connectionLineType={ConnectionLineType.Straight}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onEdgeUpdate={onEdgeUpdate}
      onEdgeUpdateStart={onEdgeUpdateStart}
      onEdgeUpdateEnd={onEdgeUpdateEnd}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      defaultEdgeOptions={{
        animated: isAnimated()
      }}
      proOptions={propOptions}
    >
      <FlowControls />
      <Background gap={16} />
    </ReactFlow>
  </Wrapper>
}

const Wrapper = styled.div`
width: 100%;
height: 100%;
`