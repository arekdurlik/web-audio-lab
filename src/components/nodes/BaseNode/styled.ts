import { GiClockwiseRotation } from 'react-icons/gi';
import { RiDeleteBin2Line } from 'react-icons/ri';
import styled from 'styled-components';
import { outsetBorder, surface } from '../../../98';
import { StyledLineHandle } from '../../handles/LineHandle';
import { CheckboxWrapper } from '../../inputs/CheckboxInput';
import { ExpandableInputWrapper, InputLabel } from '../../inputs/styled';
import { TextInputWrapper } from '../../inputs/TextInput';

export const NodeTitle = styled.span<{
    rotation?: 0 | 1 | 2 | 3;
    position?: [[number, number], [number, number]];
}>`
    font-size: 11px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    height: 100%;
    flex: 1;
    white-space: nowrap;
    pointer-events: none;

    ${({ rotation }) => {
        switch (rotation) {
            case 1:
            case 3:
                return 'rotate: -90deg;';
        }
    }}

    ${({ position, rotation }) =>
        position &&
        `
  position: absolute;
  transform-origin: 51% 50%;
  left: ${rotation === 0 || rotation === 2 ? position[0][0] : position[1][0]}px;
  top: ${rotation === 0 || rotation === 2 ? position[0][1] : position[1][1]}px;
`}
`;

export const NodeContainer = styled.div<{
    width?: number;
    height?: number;
    rotation?: number;
    disableBackground?: boolean;
    disableBorder?: boolean;
    active?: boolean;
}>`
    position: relative;
    box-sizing: border-box;
    background-color: white;
    padding: 5px;
    box-shadow: inset 0px 0px 0px 1px #000;
    display: flex;
    flex-direction: column;
    gap: 5px;

    ${({ width }) => `width: ${width ? width : '120'}px;`}
    ${({ height }) => `height: ${height ? height : '60'}px;`}
  ${({ disableBackground }) => disableBackground && 'background: none;'}
  ${({ disableBorder }) => disableBorder && 'box-shadow: none;'}
  ${({ active }) => active && 'z-index: 999;'}

  ${({ rotation }) => {
        switch (rotation) {
            case 1:
                return 'transform: rotate(90deg);';
            case 2:
                return 'transform: rotate(180deg);';
            case 3:
                return 'transform: rotate(-90deg);';
        }
    }}
  &:hover {
        ${StyledLineHandle} {
            &.target {
                &:before {
                    opacity: 1;
                }
            }
            &.source {
                &:before {
                    opacity: 1;
                }
            }
        }
    }

    .react-flow__handle {
        border-color: #000;

        &.target {
            background-color: #fff;
        }
    }
`;

/**
 * @param rotation - rotation of the node
 * @param positions - placement of the parameters window for each rotation
 */
export const Parameters = styled.div<{
    rotation?: 0 | 1 | 2 | 3;
    positions?: ('left' | 'top' | 'right' | 'bottom')[];
    offset?: number;
}>`
    ${outsetBorder}
    font-size: 11px;
    background-color: ${surface};
    width: max-content;

    ${({ rotation = 0, positions = ['bottom', 'right', 'bottom', 'right'], offset = 0 }) => {
        switch (positions[rotation]) {
            case 'bottom':
                return `
      position: absolute;
      top: 100%;
      left: ${offset}px;`;
            case 'right':
                return `
      position: absolute;
      top: ${offset}px;
      left: 100%;`;
            case 'top':
                return `
      position: absolute;
      bottom: 100%;
      left: ${offset}px;`;
            case 'left':
                return `
      position: absolute;
      top: ${offset}px;
      right: 100%;`;
        }
    }}

    ${ExpandableInputWrapper}:first-child > ${InputLabel} {
        margin-top: 2px;
    }

    ${ExpandableInputWrapper}:last-child > ${InputLabel} {
        margin-bottom: 2px;
    }

    ${CheckboxWrapper}:last-child {
        margin-bottom: 5px;
    }

    ${TextInputWrapper}:last-child {
        margin-bottom: 5px;
    }
`;

export const Parameter = styled.div`
    display: flex;
    gap: 5px;
`;

export const ParameterName = styled.div`
    white-space: nowrap;
`;
export const Expand = styled.div`
    display: flex;
    svg {
        cursor: pointer;
    }
`;

export const Delete = styled(RiDeleteBin2Line)`
    cursor: pointer;
    z-index: 13;
`;
export const Rotate = styled(GiClockwiseRotation)`
    cursor: pointer;
    z-index: 13;
`;

export const LeftOptions = styled.div`
    display: flex;
    gap: 1px;
`;

export const HoverOptions = styled.div<{ color?: string }>`
    box-sizing: border-box;
    position: absolute;
    top: 4px;
    padding-bottom: 15px;
    left: 4px;
    width: calc(100% - 8px);
    display: flex;
    justify-content: space-between;
    z-index: 1;
    ${({ color }) => color && `color: ${color};`}

    & > div {
        display: flex;
    }

    svg {
        font-size: 11px;
    }
`;

export const Hr = styled.div`
    position: relative;
    left: 1px;
    width: calc(100% - 2px);
    height: 2px;
    box-shadow: inset -1px -1px #ffffff, inset 1px 1px #808080;
`;
