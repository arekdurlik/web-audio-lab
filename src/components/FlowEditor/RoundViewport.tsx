import { useEffect, useRef } from 'react';
import { useReactFlow, useViewport } from 'reactflow';

export function RoundViewport() {
    const reactFlowInstance = useReactFlow();
    const { x, y, zoom } = useViewport();
    const rounded = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (x === rounded.current.x && y === rounded.current.y) return;
        rounded.current = { x: Math.round(x), y: Math.round(y) };

        reactFlowInstance.setViewport({ x: rounded.current.x, y: rounded.current.y, zoom });
    }, [x, y, zoom]);

    return null;
}
