import styled from 'styled-components';

export const PlayButton = styled.button`
    margin: 5px;
`;

export const ButtonGroup = styled.div`
    display: flex;

    & > button + button {
        margin-left: 0;
    }

    & > button:not(:last-child) {
        margin-right: 0;
    }
`;
