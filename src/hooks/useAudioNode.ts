import { RefObject, useRef } from 'react';

export function useAudioNode<T>(factory: () => T): T {
    return useLazyRef(factory).current;
}

// for nodes that get intentionally reconstructed later (e.g. immutable ctor options changing)
export function useLazyRef<T>(factory: () => T): RefObject<T> {
    const ref = useRef<T | undefined>(undefined);
    if (!ref.current) ref.current = factory();
    return ref as RefObject<T>;
}
