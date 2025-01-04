import { useReactFlow } from 'reactflow';

export function useUpdateFlowNode(id: string) {
    const reactFlowInstance = useReactFlow();

    function updateNode(newData: {}) {
        const newNodes = reactFlowInstance.getNodes().map(node => {
            if (node.id === id) {
                node.data = { ...node.data, ...newData };
            }
            return node;
        });

        reactFlowInstance.setNodes(newNodes);
    }

    function deleteNode() {
        reactFlowInstance.deleteElements({ nodes: [{ id }] });
    }

    return { updateNode, deleteNode };
}
