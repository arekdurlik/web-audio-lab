import { Position } from 'reactflow';
import styled from 'styled-components';

export const Label = styled.span<{ position: Position }>`
    position: absolute;
    font-size: 11px;

    ${({ position }) => {
        switch (position) {
            case Position.Right:
                return `
                    right: 5px;
                    bottom: 3px;
                `;
            case Position.Bottom:
                return `
                    bottom: 0px;
                    left: 8px
                `;
            case Position.Left:
                return `
                    eft: 5px;
                    ottom: 3px
                `;
            case Position.Top:
                return `
                    top: -2px;
                    left: 8px
                `;
        }
    }}
`;
