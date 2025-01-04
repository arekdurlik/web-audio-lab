import styled from 'styled-components';
import { useSettingsStore } from '../../stores/settingsStore';
import { MenuBar } from './MenuBar';

export function Navbar() {
    const uiScale = useSettingsStore(state => state.uiScale);

    return (
        <Container
            onWheel={e => {
                e.stopPropagation();
            }}
            scale={uiScale}
        >
            <MenuBar />
        </Container>
    );
}

const Container = styled.div<{ scale: number }>`
    display: flex;
    justify-content: space-between;

    ${({ scale }) => `zoom: ${scale};`}
`;
const TopBarButton = styled.span`
    border: 1px solid transparent;
    padding: 2px 10px;
    &:hover {
        border: 1px dashed #86cfff;
        background-color: #abddff6d;
        cursor: default;
    }
`;

export const TopBarOption = styled.span`
    position: relative;
    &:hover {
        ${TopBarButton} {
            border: 1px dashed #86cfff;
            background-color: #abddff6d;
            cursor: default;
        }
    }
`;
