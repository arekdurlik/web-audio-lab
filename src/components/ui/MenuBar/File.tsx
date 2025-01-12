import { ReactFlowJsonObject, useReactFlow } from 'reactflow';
import { audio } from '../../../main';
import { useSettingsStore } from '../../../stores/settingsStore';
import { Tooltip } from '../Tooltip';
import { Menu, MenuItem } from './styled';

type Save = {
    edges: 'default' | 'smoothstep';
    flow: ReactFlowJsonObject;
};

export function File({ onBlur }: { onBlur?: Function }) {
    const reactFlowInstance = useReactFlow();
    const edgeType = useSettingsStore(state => state.edgeType);
    const setEdgeType = useSettingsStore(state => state.setEdgeType);

    function handleReload() {
        const edges = reactFlowInstance.getEdges();
        const nodes = reactFlowInstance.getNodes();

        reactFlowInstance.setEdges([]);
        reactFlowInstance.setNodes([]);
        setTimeout(() => {
            reactFlowInstance.setEdges(edges);
            reactFlowInstance.setNodes(nodes);
        });

        audio.getLive();
    }

    async function handleSave() {
        const saveObj = JSON.stringify({
            edges: edgeType,
            flow: reactFlowInstance.toObject(),
        });
        const blob = new Blob([saveObj]);

        if ('showSaveFilePicker' in window) {
            const handle = await showSaveFilePicker({
                suggestedName: 'circuit.json',
                types: [
                    {
                        accept: { 'application/json': ['.json'] },
                    },
                ],
            });

            const writableStream = await handle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
        } else {
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'circuit.json';
            link.click();
        }

        if (onBlur) onBlur();
    }

    async function handleLoad() {
        function readFile(file: File) {
            const fileReader = new FileReader();

            fileReader.onload = function (e: ProgressEvent<FileReader>) {
                if (e.target === null) return;

                const result = e.target.result;

                if (typeof result !== 'string') return;

                const obj = JSON.parse(result) as Save;

                if (obj.hasOwnProperty('flow') && obj.hasOwnProperty('edges')) {
                    reactFlowInstance.setEdges([]);
                    reactFlowInstance.setNodes([]);
                    if (onBlur) onBlur();
                    setTimeout(() => {
                        reactFlowInstance.setEdges(obj.flow.edges);
                        reactFlowInstance.setNodes(obj.flow.nodes);
                        reactFlowInstance.setViewport(obj.flow.viewport);
                        setEdgeType(obj.edges);
                    });
                } else {
                    console.error('Invalid save file format.');
                }
            };
            fileReader.readAsText(file);
        }

        if ('showSaveFilePicker' in window) {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        accept: { 'application/json': ['.json'] },
                    },
                ],
                excludeAcceptAllOption: true,
                multiple: false,
            });

            const file = await fileHandle.getFile();

            readFile(file);
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.addEventListener('change', () => {
                if (input.files) {
                    readFile(input.files[0]);
                }
            });
            input.click();
        }
    }

    return (
        <Menu width={105}>
            <MenuItem>New</MenuItem>
            <MenuItem onClick={handleSave}>Save</MenuItem>
            <MenuItem onClick={handleLoad}>Load</MenuItem>
            <Tooltip content="Reload all nodes (can lower latency)">
                <MenuItem onClick={handleReload}>Reload audio</MenuItem>
            </Tooltip>
        </Menu>
    );
}
