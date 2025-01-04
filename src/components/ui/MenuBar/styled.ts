import styled from 'styled-components';
import { insetBorder, surface, windowBorder } from '../../../98';

export const MenuBarContainer = styled.div`
    display: flex;

    position: relative;
    width: 100%;
    padding-block: 0;
    padding-inline: 0;
`;

export const Menu = styled.div<{ width?: number }>`
    position: absolute;
    display: none;
    left: -1px;
    top: 19px;
    ${windowBorder}
    background: ${surface};
    padding: 3px;
    z-index: 9999;

    ${({ width }) => width && `min-width: ${width}px;`}
`;
export const MenuBarOption = styled.div<{ active: boolean }>`
    display: inline;
    position: relative;

    ${({ active }) =>
        active &&
        `
  ${Menu} {
    display: block;
  }
`}
`;

export const MenuBarButton = styled.button<{ active: boolean }>`
    position: relative;
    box-shadow: none;
    border: none;
    padding: 3px 10px;
    min-width: auto;
    min-height: unset;
    height: 19px;

    &:active {
        box-shadow: none !important;
    }

    &:hover {
        background-color: lightgray;
    }

    ${({ active }) =>
        active &&
        `
${insetBorder};
`}
`;

export const MenuItem = styled.button<{ icon?: string }>`
    display: block;
    box-shadow: none !important;
    margin: 0;
    width: 100%;
    text-align: left;
    display: flex;
    padding-left: 22px;
    padding-top: 5px;
    padding-bottom: 5px;
    position: relative;

    &:hover {
        background-color: lightgray;
    }

    ${({ icon }) =>
        icon === 'radio' &&
        `
&:before {
  content: url('svg/radio.svg');
  display: block;
  width: 6px;
  height: 6px;
  position: absolute; 
  left: 8px;
  top: 4px;
}
`}
`;

export const BottomBar = styled.div`
    background-color: ${surface};
    padding-top: 1px;
    padding-bottom: 1px;
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px outset;
    padding-inline: 2px;
`;
