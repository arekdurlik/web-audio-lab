import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { clamp, countDecimals } from '../../helpers';

type NumberInputProps = {
    value?: number;
    onChange?: (value: number) => void;
    label?: string;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    width?: number;
    disabled?: boolean;
    unit?: string;
    margin?: boolean;
};

export function NumberInput({
    label,
    value = 0,
    min = -Infinity,
    max = Infinity,
    step = 0.01,
    width = 38,
    disabled,
    margin = false,
    onChange,
}: NumberInputProps) {
    const [internalValue, setInternalValue] = useState(value.toString());
    const ref = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // e.g. value 1 overwriting internal value 1.0
        if (Number(internalValue) === value) return;

        setInternalValue(value.toString());
    }, [value]);

    function checkBounds(e: ChangeEvent<HTMLInputElement>) {
        const target = e.target as HTMLInputElement;

        // digits and a single dot
        const regex = /^\d*(\.\d*)?$/;

        if (!regex.test(target.value)) {
            flashError();
            return;
        }

        setInternalValue(target.value);

        if (!target.value.length || target.value.at(-1) === '.') return;

        const numberValue = Number(target.value);

        if (Number.isNaN(numberValue)) return;

        // check out of bounds
        if (ref.current && (numberValue < min || numberValue > max)) {
            flashError();
        }

        const clamped = clamp(Number(numberValue), min, max);

        // clamp value decimals to step decimals
        const stepDecimals = countDecimals(step.toString());
        const valueDecimals = countDecimals(target.value);
        const rounded = clamped.toFixed(Math.min(stepDecimals, valueDecimals));

        setInternalValue(rounded);
        if (typeof onChange === 'function') onChange(Number(rounded));
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            changeValue('increment');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            changeValue('decrement');
        }
    }

    function changeValue(type: 'increment' | 'decrement') {
        const newValue =
            type === 'increment' ? Number(internalValue) + step : Number(internalValue) - step;

        if (ref.current && (newValue < min || newValue > max)) {
            flashError();
            return;
        }

        // clamp value decimals to step decimals
        const stepDecimals = countDecimals(step.toString());
        const numberRounded = Number(newValue.toFixed(stepDecimals));

        const valueDecimals = countDecimals(numberRounded.toString());
        const rounded = newValue.toFixed(Math.min(stepDecimals, valueDecimals));

        setInternalValue(rounded);

        if (typeof onChange === 'function') onChange(Number(rounded));
    }

    function flashError() {
        ref.current?.classList.remove('error');
        setTimeout(() => {
            ref.current?.classList.add('error');
        }, 50);
    }

    return (
        <Wrapper $margin={margin}>
            {label && <span>{label}</span>}
            <Input
                ref={ref}
                type="text"
                step={step}
                value={internalValue}
                min={min}
                max={max}
                disabled={disabled}
                onChange={checkBounds}
                onMouseDownCapture={e => e.stopPropagation()}
                onPointerDownCapture={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                width={width}
            />
        </Wrapper>
    );
}

const Wrapper = styled.div<{ $margin: boolean }>`
    display: flex;
    gap: 5px;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    ${({ $margin }) =>
        $margin &&
        `
margin: 2px 5px;
`}
`;

const Input = styled.input<{ width?: number }>`
    border-radius: 0;
    border: 1px solid #000;
    outline: none;
    z-index: 500;
    max-width: ${({ width }) => width}px;
    min-width: ${({ width }) => width}px;

    @keyframes error {
        0% {
            background-color: #f99;
        }
        24% {
            background-color: #f99;
        }

        25% {
            background-color: #fff;
        }
        49% {
            background-color: #fff;
        }

        50% {
            background-color: #f99;
        }
        74% {
            background-color: #f99;
        }

        75% {
            background-color: #fff;
        }
        99% {
            background-color: #fff;
        }
    }

    &.error {
        animation-name: error;
        animation-duration: 0.25s;
    }

    &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`;
