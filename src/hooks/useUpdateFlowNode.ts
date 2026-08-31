import { useReactFlow } from 'reactflow';

export function useUpdateFlowNode(id: string) {
    const reactFlowInstance = useReactFlow();

    function updateNode(newData: {}) {
        const newNodes = reactFlowInstance
            .getNodes()
            .map(node => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node));

        reactFlowInstance.setNodes(newNodes);
    }

    function deleteNode() {
        reactFlowInstance.deleteElements({ nodes: [{ id }] });
    }

    return { updateNode, deleteNode };
}
