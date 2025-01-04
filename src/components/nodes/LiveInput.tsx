import { useEffect } from 'react';
import { HandleType } from 'reactflow';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { SocketOnly } from './SocketOnlyNode';
import { NodeProps } from './types';

export function LiveInput({ id, data }: NodeProps) {
    const nodes = useNodeStore(state => state.nodes);
    const audioId = `${id}-audio`;

    useEffect(() => {
        nodes.set(audioId, { instance: audio.circuit.in, type: 'source' });
    }, []);

    const socket = {
        id: audioId,
        type: 'source' as HandleType,
        offset: 20,
    };

    return <SocketOnly id={id} label="Live in" data={data} socket={socket} />;
}
