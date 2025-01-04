import { cloneElement, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { surface } from '../../../98';
import { useOutsideClick } from '../../../hooks/useOutsideClick';
import { useFlowStore } from '../../../stores/flowStore';
import { File } from './File';
import { Options } from './Options';
import { Presets } from './Presets';
import { MenuBarButton, MenuBarContainer, MenuBarOption } from './styled';

export function MenuBar() {
    const { editMode, setEditMode } = useFlowStore();

    return (
        <Container>
            <MenuBarContainer>
                <MenuBarItem label="File">
                    <File />
                </MenuBarItem>
                <MenuBarItem label="Presets">
                    <Presets />
                </MenuBarItem>
                <MenuBarItem label="Options">
                    <Options />
                </MenuBarItem>
            </MenuBarContainer>
            <Button className={`${editMode && 'active'}`} onClick={() => setEditMode(!editMode)}>
                Edit mode
            </Button>
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
            {cloneElement(children, { onBlur: handleBlur, active })}
        </MenuBarOption>
    );
}

export const headerHeight = 21;

const Container = styled.div`
    width: 100%;
    display: flex;
    border: 1px outset;
    height: ${headerHeight}px;
    background-color: ${surface};
`;

const Button = styled.button`
    padding: 2px 15px;
    margin: 1px;
    min-height: unset;
    height: 17px;
    background: ${surface};
`;
