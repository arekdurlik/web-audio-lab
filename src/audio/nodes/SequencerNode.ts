export type RampAnchor = 'start' | 'end' | 'both';
export type SequencerStep = { value: number; ramp: number; rampAnchor: RampAnchor };
export type SequencerLane = { output: ConstantSourceNode; steps: SequencerStep[] };
export type TimingMode = 'free' | 'sync';
export type NoteDivision = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/8t' | '1/16t';

const DIVISION_BEATS: Record<NoteDivision, number> = {
    '1/1': 4,
    '1/2': 2,
    '1/4': 1,
    '1/8': 0.5,
    '1/16': 0.25,
    '1/8t': 1 / 3,
    '1/16t': 1 / 6,
};

const LOOKAHEAD = 0.1;
const SCHEDULE_INTERVAL_MS = 25;
const DECLICK_SECONDS = 0.005;

export const MAX_STEPS = 16;

function freshSteps(): SequencerStep[] {
    return Array.from({ length: MAX_STEPS }, () => ({
        value: 0,
        ramp: 0,
        rampAnchor: 'start' as RampAnchor,
    }));
}

export class SequencerNode {
    readonly ctx: AudioContext;
    readonly lanes: SequencerLane[] = [];

    stepCount = 8;
    bpm = 120;
    division: NoteDivision = '1/8';
    timingMode: TimingMode = 'free';
    freeSeconds = 0.25;
    playing = false;

    private stepIndex = 0;
    private nextStepTime = 0;
    private schedulerTimer?: ReturnType<typeof setTimeout>;
    private uiTimer?: ReturnType<typeof setTimeout>;
    private uiQueue: { step: number; time: number }[] = [];
    private lastValues: number[] = [];
    private events = new EventTarget();

    constructor(ctx: AudioContext, lanes = 1) {
        this.ctx = ctx;
        for (let i = 0; i < lanes; i++)
            this.lanes.push({ output: this.freshOutput(), steps: freshSteps() });
    }

    get stepDuration() {
        const MIN_STEP_DURATION = 0.001;
        const duration =
            this.timingMode === 'free'
                ? this.freeSeconds
                : (60 / this.bpm) * DIVISION_BEATS[this.division];

        return Math.max(MIN_STEP_DURATION, duration);
    }

    private freshOutput(): ConstantSourceNode {
        const output = new ConstantSourceNode(this.ctx, { offset: 0 });
        output.start();
        return output;
    }

    activateAll() {
        this.lanes.forEach(lane => {
            try {
                lane.output.stop();
            } catch {}
            lane.output.disconnect();
            lane.output = this.freshOutput();
        });
    }

    deactivateAll() {
        this.stop();
        this.lanes.forEach(lane => {
            try {
                lane.output.stop();
            } catch {}
            lane.output.disconnect();
        });
    }

    addLane(): SequencerLane {
        const lane: SequencerLane = { output: this.freshOutput(), steps: freshSteps() };
        this.lanes.push(lane);
        this.emit('laneschange');
        return lane;
    }

    removeLane(index: number) {
        const lane = this.lanes[index];
        if (!lane) return;

        try {
            lane.output.stop();
        } catch {}
        lane.output.disconnect();
        this.lanes.splice(index, 1);
        this.emit('laneschange');
    }

    setStep(laneIndex: number, stepIndex: number, step: Partial<SequencerStep>) {
        const lane = this.lanes[laneIndex];
        if (!lane) return;

        Object.assign(lane.steps[stepIndex], step);
    }

    setStepCount(count: number) {
        this.stepCount = Math.min(MAX_STEPS, Math.max(1, count));
        this.emit('stepcountchange', this.stepCount);
    }

    setBpm(bpm: number) {
        this.bpm = Math.max(1, bpm);
    }

    setDivision(division: NoteDivision) {
        this.division = division;
    }

    setTimingMode(mode: TimingMode) {
        this.timingMode = mode;
    }

    setFreeSeconds(seconds: number) {
        this.freeSeconds = Math.max(0.001, seconds);
    }

    start() {
        if (this.playing) return;

        this.playing = true;
        this.stepIndex = 0;
        this.nextStepTime = this.ctx.currentTime;

        this.lastValues = this.lanes.map(lane => {
            const param = lane.output.offset;
            param.cancelScheduledValues(this.ctx.currentTime);
            param.setValueAtTime(param.value, this.ctx.currentTime);
            return param.value;
        });

        this.scheduler();
        this.uiLoop();
        this.emit('playchange', true);
    }

    stop() {
        this.playing = false;
        clearTimeout(this.schedulerTimer);
        clearTimeout(this.uiTimer);
        this.uiQueue = [];
        this.emit('playchange', false);
        this.emit('step', -1);
    }

    onStep(cb: (step: number) => void) {
        const listener = (e: Event) => cb((e as CustomEvent).detail);
        this.events.addEventListener('step', listener);
        return () => this.events.removeEventListener('step', listener);
    }

    onPlayChange(cb: (playing: boolean) => void) {
        const listener = (e: Event) => cb((e as CustomEvent).detail);
        this.events.addEventListener('playchange', listener);
        return () => this.events.removeEventListener('playchange', listener);
    }

    onLanesChange(cb: () => void) {
        const listener = () => cb();
        this.events.addEventListener('laneschange', listener);
        return () => this.events.removeEventListener('laneschange', listener);
    }

    private scheduler = () => {
        if (!this.playing) return;

        while (this.nextStepTime < this.ctx.currentTime + LOOKAHEAD) {
            this.scheduleStep(this.stepIndex, this.nextStepTime);
            this.uiQueue.push({ step: this.stepIndex, time: this.nextStepTime });
            this.stepIndex = (this.stepIndex + 1) % this.stepCount;
            this.nextStepTime += this.stepDuration;
        }

        this.schedulerTimer = setTimeout(this.scheduler, SCHEDULE_INTERVAL_MS);
    };

    private scheduleStep(stepIndex: number, time: number) {
        const stepDuration = this.stepDuration;

        this.lanes.forEach((lane, laneIndex) => {
            const { value, ramp, rampAnchor } = lane.steps[stepIndex];
            const param = lane.output.offset;
            const rampSeconds = ramp * stepDuration;

            if (rampSeconds <= 0) {
                const declick = Math.min(DECLICK_SECONDS, stepDuration / 4);
                param.setValueAtTime(this.lastValues[laneIndex] ?? value, time);
                param.linearRampToValueAtTime(value, time + declick);
                this.lastValues[laneIndex] = value;
            } else if (rampAnchor === 'end') {
                // hold this step's value, then glide toward the next step's value at the tail
                const nextValue = lane.steps[(stepIndex + 1) % this.stepCount].value;
                const declick = Math.min(DECLICK_SECONDS, stepDuration / 4);
                const holdUntil = time + stepDuration - rampSeconds;

                param.setValueAtTime(this.lastValues[laneIndex] ?? value, time);
                param.linearRampToValueAtTime(value, time + declick);
                if (holdUntil > time + declick) {
                    param.setValueAtTime(value, holdUntil);
                }
                param.linearRampToValueAtTime(nextValue, time + stepDuration);
                this.lastValues[laneIndex] = nextValue;
            } else if (rampAnchor === 'both') {
                // glide in then out, each side capped at 50% so they can't overlap
                const half = Math.min(ramp, 0.5) * stepDuration;
                const nextValue = lane.steps[(stepIndex + 1) % this.stepCount].value;

                param.setValueAtTime(this.lastValues[laneIndex] ?? value, time);
                param.linearRampToValueAtTime(value, time + half);
                param.setValueAtTime(value, time + stepDuration - half);
                param.linearRampToValueAtTime(nextValue, time + stepDuration);
                this.lastValues[laneIndex] = nextValue;
            } else {
                // anchor at 'time', or the ramp silently starts from an earlier scheduled event
                param.setValueAtTime(this.lastValues[laneIndex] ?? value, time);
                param.linearRampToValueAtTime(value, time + rampSeconds);
                this.lastValues[laneIndex] = value;
            }
        });
    }

    private uiLoop = () => {
        if (!this.playing) return;

        while (this.uiQueue.length && this.uiQueue[0].time <= this.ctx.currentTime) {
            const { step } = this.uiQueue.shift()!;
            this.emit('step', step);
        }

        this.uiTimer = setTimeout(this.uiLoop, 16);
    };

    private emit(name: string, detail?: unknown) {
        this.events.dispatchEvent(new CustomEvent(name, { detail }));
    }
}
