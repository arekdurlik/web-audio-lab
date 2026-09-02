import React from 'react';
import styled from 'styled-components';
import { insetBorder } from '../../../98';

export const Button = styled.button<{ $variant?: 'primary' | 'secondary'; $active?: boolean }>`
    ${({ $variant }) =>
        $variant === 'secondary' &&
        `
        box-shadow: none;
        border: none;

        &:active {
            box-shadow: none !important;
        }

        &:hover:not(:disabled) {
            background-image: var(--hover-dither);
        }
    `}

    ${({ $variant, $active }) => $variant === 'secondary' && $active && insetBorder}
`;

const StyledIconButton = styled(Button)`
    height: 22px;
    min-width: unset;
    min-height: unset;
    padding: 0 6px 0 4px;
    margin: 1px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
`;

const IconImg = styled.img`
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    image-rendering: pixelated;
    pointer-events: none;
`;

export function IconButton({
    icon,
    label,
    disabled,
    ...props
}: React.ComponentProps<typeof StyledIconButton> & { icon: string; label?: string }) {
    return (
        <StyledIconButton disabled={disabled} {...props}>
            <IconImg src={icon} draggable={false} style={disabled ? { opacity: 0.5 } : undefined} />
            {label}
        </StyledIconButton>
    );
}
