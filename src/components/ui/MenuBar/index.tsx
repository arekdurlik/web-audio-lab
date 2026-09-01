import { cloneElement, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { outsetBorder, surface } from '../../../98';
import { useOutsideClick } from '../../../hooks/useOutsideClick';
import { useUndoRedo } from '../../../hooks/useUndoRedo';
import { useFlowStore } from '../../../stores/flowStore';
import { File } from './File';
import { Options } from './Options';
import { Palette } from './Palette';
import { MenuBarButton, MenuBarContainer, MenuBarOption } from './styled';

export function MenuBar() {
    const { editMode, setEditMode } = useFlowStore();
    const { undo, redo, canUndo, canRedo } = useUndoRedo();

    return (
        <Container>
            <MenuBarContainer>
                <MenuBarItem label="File">
                    <File />
                </MenuBarItem>
                {/* <MenuBarItem label="Presets">
                    <Presets />
                </MenuBarItem> */}
                <MenuBarItem label="Options">
                    <Options />
                </MenuBarItem>
                <MenuBarItem label="Palette">
                    <Palette />
                </MenuBarItem>
            </MenuBarContainer>
            <Group>
                <Button disabled={!canUndo} onClick={undo}>
                    Undo
                </Button>
                <Button disabled={!canRedo} onClick={redo}>
                    Redo
                </Button>
                <Button className={`${editMode && 'active'}`} onClick={() => setEditMode(!editMode)}>
                    Edit mode
                </Button>
            </Group>
        </Container>
    );
}

function MenuBarItem({ label, children }: { label: string; children: ReactElement }) {
    const [active, setActive] = useState(false);
    const activator = useOutsideClick(() => setActive(false));

    function handleBlur() {
        setActive(false);
    }

    return (
        <MenuBarOption ref={activator} active={active}>
            <MenuBarButton active={active} onClick={() => setActive(!active)}>
                {label}
            </MenuBarButton>
            {/* @ts-expect-error onBlur does not exist */}
            {cloneElement(children, { onBlur: handleBlur, active })}
        </MenuBarOption>
    );
}

export const headerHeight = 21;

const Container = styled.div`
    width: 100%;
    display: flex;
    box-sizing: border-box;
    padding: 2px;
    ${outsetBorder}
    height: ${headerHeight}px;
    background-color: ${surface};
`;

const Group = styled.div`
    display: flex;
`;

const Button = styled.button`
    padding: 2px 15px;
    margin: 1px;
    min-height: unset;
    height: 15px;
    background: ${surface};

    &:disabled {
        color: #888;
    }
`;
