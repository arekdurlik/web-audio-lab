export type GranularParams = {
    position: number;
    seek: number;
    spray: number;
    size: number;
    pitch: number;
    pitchJitter: number;
    direction: number;
    pan: number;
    density: number;
    attack: number;
    decay: number;
    captureLength: number;
};

const MAX_GRAINS = 300;
const SEEK_INTERVAL_MS = 30;

function snapshotIntervalFor(captureLengthSeconds: number) {
    const t = Math.max(0, Math.min(1, (captureLengthSeconds - 2) / (20 - 2)));
    return Math.round(100 + t * (300 - 100));
}

export type ActiveGrain = {
    x0: number;
    y: number;
    spawnTime: number;
    life: number;
    attackTime: number;
    decayTime: number;
    speed: number;
};

export class GranularNode {
    readonly recorder: AudioWorkletNode;
    readonly output: GainNode;

    params: GranularParams = {
        position: 0.5,
        seek: 0,
        spray: 0.2,
        size: 0.3,
        pitch: 1,
        pitchJitter: 0,
        direction: 1,
        pan: 0.5,
        density: 10,
        attack: 0.3,
        decay: 0.3,
        captureLength: 20,
    };
    playing = false;
    held = false;
    liveMode = true;

    private ctx: AudioContext;
    private buffer: AudioBuffer | null = null;
    private reverseBuffer: AudioBuffer | null = null;
    private snapshotInterval = 0;
    private spawnInterval = 0;
    private seekInterval = 0;
    private grains = 0;
    private mute: GainNode;
    private activeGrains: ActiveGrain[] = [];
    private events = new EventTarget();

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.recorder = new AudioWorkletNode(ctx, 'granular-recorder-processor');
        this.output = new GainNode(ctx);
        this.attach();

        this.mute = new GainNode(ctx, { gain: 0 });
        this.recorder.connect(this.mute).connect(ctx.destination);
    }

    attach() {
        this.recorder.port.onmessage = ({ data }) => {
            if (data.type === 'snapshot') this.applySnapshot(data.channels, data.sampleRate);
        };
    }

    setParams(patch: Partial<GranularParams>) {
        const densityChanged = patch.density !== undefined && patch.density !== this.params.density;
        const captureLengthChanged =
            patch.captureLength !== undefined && patch.captureLength !== this.params.captureLength;
        const directionChanged =
            patch.direction !== undefined && patch.direction !== this.params.direction;
        this.params = { ...this.params, ...patch };
        if (densityChanged && this.playing) this.restartSpawner();
        if (captureLengthChanged && this.playing && !this.held) this.startSnapshotting();
        if (directionChanged && !this.liveMode) this.buildReverseBuffer();
    }

    start() {
        if (this.playing) return;
        this.attach();
        this.playing = true;
        if (this.liveMode && !this.held) this.startSnapshotting();
        this.restartSpawner();
        this.startSeeking();
    }

    setLiveMode(live: boolean) {
        if (live === this.liveMode) return;
        this.liveMode = live;
        if (!live) {
            clearInterval(this.snapshotInterval);
        } else if (this.playing && !this.held) {
            this.startSnapshotting();
        }
    }

    setStaticBuffer(buffer: AudioBuffer) {
        this.buffer = buffer;
        this.buildReverseBuffer();
    }

    stop() {
        this.playing = false;
        clearInterval(this.snapshotInterval);
        clearInterval(this.spawnInterval);
        clearInterval(this.seekInterval);
    }

    onPosition(cb: (position: number) => void) {
        const listener = (e: Event) => cb((e as CustomEvent).detail);
        this.events.addEventListener('position', listener);
        return () => this.events.removeEventListener('position', listener);
    }

    private startSeeking() {
        clearInterval(this.seekInterval);
        this.seekInterval = window.setInterval(() => {
            if (this.params.seek === 0) return;
            const next =
                (((this.params.position + (this.params.seek * SEEK_INTERVAL_MS) / 1000) % 1) + 1) %
                1;
            this.params.position = next;
            this.events.dispatchEvent(new CustomEvent('position', { detail: next }));
        }, SEEK_INTERVAL_MS);
    }

    setHold(held: boolean) {
        if (held === this.held) return;
        this.held = held;
        if (held) {
            clearInterval(this.snapshotInterval);
        } else if (this.playing) {
            this.startSnapshotting();
        }
    }

    private startSnapshotting() {
        clearInterval(this.snapshotInterval);
        this.requestSnapshot();
        this.snapshotInterval = window.setInterval(
            () => this.requestSnapshot(),
            snapshotIntervalFor(this.params.captureLength)
        );
    }

    getBuffer(): AudioBuffer | null {
        return this.buffer;
    }

    getActiveGrains(): ActiveGrain[] {
        const now = this.ctx.currentTime;
        this.activeGrains = this.activeGrains.filter(g => now - g.spawnTime < g.life);
        return this.activeGrains;
    }

    dispose() {
        this.stop();
        this.recorder.port.onmessage = null;
        try {
            this.recorder.disconnect();
            this.mute.disconnect();
        } catch {}
    }

    private applySnapshot(channels: Float32Array[], sampleRate: number) {
        const length = channels[0].length;
        const buf = this.ctx.createBuffer(channels.length, length, sampleRate);

        channels.forEach((data, ch) =>
            buf.copyToChannel(data as unknown as Float32Array<ArrayBuffer>, ch)
        );
        this.buffer = buf;
        this.buildReverseBuffer();
    }

    private buildReverseBuffer() {
        if (!this.buffer || this.params.direction >= 1) {
            this.reverseBuffer = null;
            return;
        }

        const rev = this.ctx.createBuffer(
            this.buffer.numberOfChannels,
            this.buffer.length,
            this.buffer.sampleRate
        );
        for (let ch = 0; ch < this.buffer.numberOfChannels; ch++) {
            const data = this.buffer.getChannelData(ch);
            rev.copyToChannel(data.slice().reverse() as unknown as Float32Array<ArrayBuffer>, ch);
        }
        this.reverseBuffer = rev;
    }

    private requestSnapshot() {
        this.recorder.port.postMessage({ cmd: 'snapshot', length: this.params.captureLength });
    }

    private restartSpawner() {
        clearInterval(this.spawnInterval);
        const intervalMs = Math.max(5, 1000 / Math.max(0.1, this.params.density));
        this.spawnInterval = window.setInterval(() => this.spawnGrain(), intervalMs);
    }

    private spawnGrain() {
        if (!this.buffer || this.grains >= MAX_GRAINS) return;

        const { position, spray, size, pitch, pitchJitter, direction, pan, attack, decay } =
            this.params;
        const reverse = Math.random() > direction;
        if (reverse && !this.reverseBuffer) return;

        this.grains++;
        const duration = this.buffer.duration;

        const jitterCents = (Math.random() * 2 - 1) * pitchJitter;
        const grainPitch = pitch * Math.pow(2, jitterCents / 1200);

        const sprayAmount = (Math.random() * 2 - 1) * spray * duration;
        const pos = Math.max(0, Math.min(duration, position * duration + sprayAmount));
        const src = new AudioBufferSourceNode(this.ctx, {
            buffer: reverse ? this.reverseBuffer : this.buffer,
            playbackRate: Math.max(0.01, grainPitch),
        });
        const panValue = (Math.random() * 2 - 1) * pan;
        const gain = new GainNode(this.ctx, { gain: 0 });
        const panner = new StereoPannerNode(this.ctx, { pan: panValue });

        src.connect(gain).connect(panner).connect(this.output);

        const startOffset = reverse ? Math.max(0, duration - pos) : pos;
        src.start(this.ctx.currentTime, startOffset);

        let a = attack * size;
        let d = decay * size;
        const sum = a + d;
        if (sum > size) {
            const scale = size / sum;
            a *= scale;
            d *= scale;
        }
        const decayStart = this.ctx.currentTime + size - d;
        const volume = 1 / Math.sqrt(this.grains);

        gain.gain.setTargetAtTime(volume, this.ctx.currentTime, Math.max(0.001, a / 3));
        gain.gain.setTargetAtTime(0, decayStart, Math.max(0.001, d / 3));

        this.activeGrains.push({
            x0: pos / duration,
            y: (panValue + 1) / 2,
            spawnTime: this.ctx.currentTime,
            life: size,
            attackTime: a,
            decayTime: d,
            speed: ((reverse ? -1 : 1) * Math.max(0.01, grainPitch)) / duration,
        });

        src.stop(this.ctx.currentTime + size + 0.2);
        let cleaned = false;
        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;
            this.grains = Math.max(0, this.grains - 1);
            src.disconnect();
            gain.disconnect();
            panner.disconnect();
        };
        src.onended = cleanup;
        window.setTimeout(cleanup, (size + 0.3) * 1000);
    }
}
