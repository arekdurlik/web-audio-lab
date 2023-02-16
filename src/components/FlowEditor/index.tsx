import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  updateEdge,
  Edge,
  Connection,
  ConnectionLineType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { edgeOptions, initialEdges, initialNodes, nodeTypes, propOptions } from './utils'
import { FlowControls } from './Controls'
import { useNodeStore } from '../../stores/nodeStore'

export function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const reconnectChain = useNodeStore(state => state.reconnectChain)
  const edgeUpdateSuccessful = useRef(true)

  useEffect(() => {
    const connections = edges.map(edge => ({ source: edge.sourceHandle, target: edge.targetHandle }))

    reconnectChain(connections)
  }, [edges])

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
    return addEdge({ 
      ...params, type: 'step', style: { stroke: `#000`, strokeWidth: 1 }},
      edges
    )
  }), [setEdges])

  return <ReactFlow
    nodes={nodes}
    edges={edges}
    nodeTypes={nodeTypes}
    snapToGrid
    snapGrid={[10, 10]}
    connectionLineType={ConnectionLineType.Straight}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onEdgeUpdate={onEdgeUpdate}
    onEdgeUpdateStart={onEdgeUpdateStart}
    onEdgeUpdateEnd={onEdgeUpdateEnd}
    onConnect={onConnect}
    defaultEdgeOptions={edgeOptions}
    proOptions={propOptions}
  >
    <FlowControls />
    <Background gap={20} />
  </ReactFlow>
}