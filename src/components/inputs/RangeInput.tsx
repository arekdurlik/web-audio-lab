import { ChangeEvent, CSSProperties, useEffect, useState } from 'react';
import { clamp, countDecimals } from '../../helpers';
import { FlexContainer } from '../../styled';
import Log from './log';
import { NumberInput } from './NumberInput';
import {
    ExpandableInputContainer,
    ExpandableInputContent,
    ExpandableInputLabel,
    ExpandableInputWrapper,
    Triangle,
} from './styled';
import triangle from '/svg/triangle.svg';

type RangeInputProps = {
    value: number;
    onChange?: (value: number) => void;
    onMaxChange?: (value: number) => void;
    onMinChange?: (value: number) => void;
    label?: string;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    expanded?: boolean;
    onExpandChange?: (value: boolean) => void;
    style?: CSSProperties;
    logarithmic?: boolean;
    adjustableBounds?: boolean;
    numberInput?: boolean;
    numberInputWidth?: number;
};
export function RangeInput({
    value,
    min = 0,
    max = 100,
    label,
    disabled,
    expanded = true,
    onExpandChange,
    step = 0.001,
    numberInput,
    numberInputWidth,
    adjustableBounds,
    logarithmic,
    onChange,
    onMinChange,
    onMaxChange,
    style,
}: RangeInputProps) {
    const [internalValue, setInternalValue] = useState(value);
    const log = new Log({ minval: Math.max(1, min), maxval: max });

    useEffect(() => {
        if (logarithmic) {
            const pos = log.position(value);
            setInternalValue(pos);
        } else {
            setInternalValue(value);
        }
    }, [value]);

    useEffect(() => {
        const newValue = clamp(value, min, max);

        if (typeof onChange === 'function') onChange(newValue);
    }, [min, max]);

    function handleNumberChange(value: number) {
        if (typeof onChange === 'function') onChange(value);
    }

    function calculateValue(pos: number) {
        const decimals = countDecimals(step.toString());
        const value = log.value(pos).toFixed(decimals);
        return Number(value);
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (logarithmic) {
            const newPosition = Number(e.target.value);
            setInternalValue(newPosition);

            if (typeof onChange === 'function') onChange(calculateValue(newPosition));
        } else {
            const target = e.target as HTMLInputElement;
            const value = Number(target.value);

            if (typeof onChange === 'function') onChange(value);
        }
    }

    return (
        <ExpandableInputWrapper>
            {label && (
                <ExpandableInputLabel
                    $expanded={expanded}
                    onClick={() =>
                        typeof onExpandChange === 'function' && onExpandChange(!expanded)
                    }
                >
                    <span>
                        {label}
                        {!expanded && ' ' + value}
                    </span>
                    <Triangle $expanded={expanded} src={triangle} />
                </ExpandableInputLabel>
            )}
            <ExpandableInputContent $expanded={expanded}>
                <ExpandableInputContainer gap={4}>
                    <input
                        type="range"
                        step={step}
                        value={internalValue}
                        min={logarithmic ? 0 : min}
                        max={logarithmic ? 100 : max}
                        disabled={disabled}
                        onChange={handleChange}
                        onMouseDownCapture={e => e.stopPropagation()}
                        onPointerDownCapture={e => e.stopPropagation()}
                        style={style}
                    />
                    {numberInput && (
                        <NumberInput
                            min={min}
                            max={max}
                            step={step}
                            value={value}
                            disabled={disabled}
                            onChange={handleNumberChange}
                            width={numberInputWidth}
                        />
                    )}
                </ExpandableInputContainer>
                {adjustableBounds && (
                    <ExpandableInputContainer justify="flex-end" gap={8} style={{ marginTop: 8 }}>
                        <FlexContainer align="center">
                            <NumberInput
                                label="min:"
                                width={50}
                                onChange={onMinChange}
                                value={min}
                            />
                        </FlexContainer>
                        <FlexContainer align="center">
                            <NumberInput
                                label="max:"
                                width={50}
                                onChange={onMaxChange}
                                value={max}
                            />
                        </FlexContainer>
                    </ExpandableInputContainer>
                )}
            </ExpandableInputContent>
        </ExpandableInputWrapper>
    );
}
