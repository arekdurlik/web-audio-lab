export type LooperState = 'empty' | 'recording' | 'playing' | 'overdubbing' | 'stopped';

export class LooperNode {
    readonly ctx: AudioContext;
    readonly node: AudioWorkletNode;
    readonly speed: AudioParam;
    readonly scrub: AudioParam;
    readonly trigger: GainNode;
    readonly loop: GainNode;

    state: LooperState = 'empty';
    position = 0;
    duration = 0;
    elapsed = 0;

    private events = new EventTarget();

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.node = new AudioWorkletNode(ctx, 'looper-processor', {
            numberOfOutputs: 3,
            outputChannelCount: [2, 1, 2],
        });
        this.speed = this.node.parameters.get('speed')!;
        this.scrub = this.node.parameters.get('scrub')!;
        this.trigger = new GainNode(ctx);
        this.loop = new GainNode(ctx);
        this.node.port.onmessage = ({ data }) => {
            if (data.type === 'state') {
                this.state = data.value;
                this.duration = data.duration;
                this.emit('statechange', this.state);
            } else if (data.type === 'position') {
                this.position = data.value;
                this.emit('position', this.position);
            } else if (data.type === 'elapsed') {
                this.elapsed = data.value;
                this.emit('elapsed', this.elapsed);
            }
        };
    }

    // classic 1-track toggle: record -> play -> overdub -> play -> overdub -> ...
    toggle() {
        switch (this.state) {
            case 'empty':
                this.node.port.postMessage({ cmd: 'record-start' });
                break;
            case 'recording':
                this.node.port.postMessage({ cmd: 'record-stop' });
                break;
            case 'playing':
            case 'stopped':
                this.node.port.postMessage({ cmd: 'overdub-start' });
                break;
            case 'overdubbing':
                this.node.port.postMessage({ cmd: 'overdub-stop' });
                break;
        }
    }

    stop() {
        this.node.port.postMessage({ cmd: 'stop' });
    }

    play() {
        this.node.port.postMessage({ cmd: 'play' });
    }

    undo() {
        this.node.port.postMessage({ cmd: 'undo' });
    }

    clear() {
        this.node.port.postMessage({ cmd: 'clear' });
    }

    setReverse(value: boolean) {
        this.node.port.postMessage({ cmd: 'reverse', value });
    }

    setScrubConnected(value: boolean) {
        this.node.port.postMessage({ cmd: 'scrub-connected', value });
    }

    onStateChange(cb: (state: LooperState) => void) {
        const listener = (e: Event) => cb((e as CustomEvent).detail);
        this.events.addEventListener('statechange', listener);
        return () => this.events.removeEventListener('statechange', listener);
    }

    onPosition(cb: (position: number) => void) {
        const listener = (e: Event) => cb((e as CustomEvent).detail);
        this.events.addEventListener('position', listener);
        return () => this.events.removeEventListener('position', listener);
    }

    onElapsed(cb: (elapsed: number) => void) {
        const listener = (e: Event) => cb((e as CustomEvent).detail);
        this.events.addEventListener('elapsed', listener);
        return () => this.events.removeEventListener('elapsed', listener);
    }

    private emit(name: string, detail?: unknown) {
        this.events.dispatchEvent(new CustomEvent(name, { detail }));
    }
}
