import { DragEvent, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
    Connection,
    ConnectionLineType,
    Edge,
    addEdge,
    updateEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useFlowStore } from '../../stores/flowStore';
import { snapshotFingerprint, useHistoryStore } from '../../stores/historyStore';
import { useNodeStore } from '../../stores/nodeStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { FlowControls } from './Controls';
import { CustomBackground } from './CustomBackground';
import { EdgeController } from './EdgeController/index';
import { RoundViewport } from './RoundViewport';
import { NodeType, initialNodeData, initialNodes, nodeTypes, propOptions } from './utils';
import { ZoomController } from './ZoomController';

export function FlowEditor() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();
    const setConnections = useNodeStore(state => state.setConnections);
    const edgeUpdateSuccessful = useRef(true);
    const setPanning = useFlowStore(state => state.setPanning);
    const editMode = useFlowStore(state => state.editMode);
    const getEdgeType = useSettingsStore(state => state.getEdgeType);
    const lastSnapshot = useHistoryStore(state => state.lastSnapshot);
    const commitHistory = useHistoryStore(state => state.commit);
    const historyTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const { undo: handleUndo, redo: handleRedo } = useUndoRedo();

    useEffect(() => {
        const connections = edges.map(edge => ({
            source: edge.sourceHandle,
            target: edge.targetHandle,
        }));
        setConnections(connections);
    }, [edges]);

    useEffect(() => {
        const current = { nodes, edges };
        if (snapshotFingerprint(current) === snapshotFingerprint(lastSnapshot)) return;

        clearTimeout(historyTimerRef.current);
        historyTimerRef.current = setTimeout(() => {
            commitHistory(lastSnapshot, current);
        }, 500);

        return () => clearTimeout(historyTimerRef.current);
    }, [nodes, edges]);

    const flushHistory = useCallback(() => {
        const current = { nodes, edges };
        if (snapshotFingerprint(current) === snapshotFingerprint(lastSnapshot)) return;

        clearTimeout(historyTimerRef.current);
        commitHistory(lastSnapshot, current);
    }, [lastSnapshot, nodes, edges, commitHistory]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            const isEditable =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable;
            if (isEditable) return;

            if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;

            e.preventDefault();
            if (e.shiftKey) {
                handleRedo();
            } else {
                handleUndo();
            }
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const onDragOver = useCallback((event: DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: DragEvent) => {
            if (reactFlowWrapper.current === null) return;
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow') as NodeType;

            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) return;

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode = {
                id: String(Date.now()),
                type,
                position,
                data: {
                    ...initialNodeData[type],
                },
            };

            setNodes(nodes => nodes.concat(newNode));
        },
        [reactFlowInstance]
    );

    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeUpdateSuccessful.current = true;
        setEdges(els => updateEdge(oldEdge, newConnection, els));
    }, []);

    const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges(eds => eds.filter(e => e.id !== edge.id));
        }

        edgeUpdateSuccessful.current = true;
    }, []);

    const onConnect = useCallback(
        (params: Edge | Connection) => {
            flushHistory();
            setEdges(edges => {
                return addEdge(
                    {
                        ...params,
                        type: getEdgeType(),
                        style: { stroke: `#000`, strokeWidth: 1 },
                        pathOptions: { borderRadius: 0, offset: 16.5, curvature: 0.5 },
                    } as any,
                    edges
                );
            });
        },
        [setEdges, flushHistory]
    );

    const onNodeDragStart = useCallback(() => {
        flushHistory();
    }, [flushHistory]);

    return (
        <Wrapper ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                zoomOnScroll={false}
                snapToGrid
                snapGrid={[8, 8]}
                connectionLineType={ConnectionLineType.Straight}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onEdgeUpdate={onEdgeUpdate}
                onEdgeUpdateStart={onEdgeUpdateStart}
                onEdgeUpdateEnd={onEdgeUpdateEnd}
                onConnect={onConnect}
                onNodeDragStart={onNodeDragStart}
                onDrop={onDrop}
                onDragOver={onDragOver}
                proOptions={propOptions}
                onMoveStart={() => setPanning(true)}
                onMoveEnd={() => setPanning(false)}
                nodesDraggable={editMode}
                edgesFocusable={editMode}
                nodesConnectable={editMode}
            >
                <FlowControls />
                <EdgeController edges={edges} />
                <ZoomController />
                <CustomBackground />
                <RoundViewport />
            </ReactFlow>
        </Wrapper>
    );
}

const Wrapper = styled.div`
    width: 100%;
    height: 100%;
`;
