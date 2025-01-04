import Tippy from '@tippyjs/react/headless'; // different import path!
import { ReactElement } from 'react';
import styled from 'styled-components';
import { followCursor } from 'tippy.js';
import { useSettingsStore } from '../../stores/settingsStore';

type TooltipProps = {
    content: string;
    delay?: number;
    children: ReactElement;
    zoom?: number;
};

export function Tooltip({ content, children, delay = 250, zoom }: TooltipProps) {
    const uiScale = useSettingsStore(state => state.uiScale);

    return (
        <Tippy
            plugins={[followCursor]}
            followCursor="initial"
            placement="bottom-start"
            offset={[10, 5]}
            delay={[delay, 0]}
            hideOnClick={false}
            render={attrs => (
                <TooltipContainer zoom={zoom} scale={uiScale} tabIndex={-1} {...attrs}>
                    {content}
                </TooltipContainer>
            )}
        >
            {children}
        </Tippy>
    );
}

const TooltipContainer = styled.div<{ zoom?: number; scale?: number }>`
    display: flex;
    padding: 2px 5px;
    background-color: #faf0c8;
    border: 1px solid darkkhaki;
    ${({ zoom, scale }) => `zoom: ${zoom !== undefined ? zoom : scale};`}
`;
