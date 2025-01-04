import { useEffect } from 'react';
import { HandleType } from 'reactflow';
import { audio } from '../../main';
import { useNodeStore } from '../../stores/nodeStore';
import { SocketOnly } from './SocketOnlyNode';
import { NodeProps } from './types';

export function Destination({ id, data }: NodeProps) {
    const nodes = useNodeStore(state => state.nodes);

    useEffect(() => {
        nodes.set('destination', { instance: audio.circuit.out, type: 'target' });
    }, []);

    const socket = {
        id: 'destination',
        type: 'target' as HandleType,
        offset: 20,
    };

    return <SocketOnly id={id} label="Output" data={data} defaultRotation={2} socket={socket} />;
}
