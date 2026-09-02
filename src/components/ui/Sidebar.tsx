import { DragEvent, useState } from 'react';
import SVG from 'react-inlinesvg';
import { useReactFlow } from 'reactflow';
import styled from 'styled-components';
import { button_shadow, fieldBorder, outsetBorder, surface, text_color } from '../../98';
import { useSettingsStore } from '../../stores/settingsStore';
import { initialNodeData, nodeSizes, NodeType } from '../FlowEditor/utils';
import { headerHeight } from './MenuBar';
import triangle from '/svg/triangle.svg';

export function Sidebar() {
    const [options, setOptions] = useState([
        {
            title: 'Base nodes',
            active: true,
            items: [
                {
                    id: 'gainNode',
                    label: 'Gain',
                },
                {
                    id: 'delayNode',
                    label: 'Delay',
                },
                {
                    id: 'convolverNode',
                    label: 'Convolver',
                },
                {
                    id: 'filterNode',
                    label: 'Biquad filter',
                },
                {
                    id: 'compressorNode',
                    label: 'Compressor',
                },
                {
                    id: 'oscillatorNode',
                    label: 'Oscillator',
                },
                {
                    id: 'constantSourceNode',
                    label: 'Constant source',
                },
                {
                    id: 'audioBufferSourceNode',
                    label: 'Audio buffer source',
                },
                {
                    id: 'stereoPannerNode',
                    label: 'Stereo panner',
                },
                {
                    id: 'waveShaperNode',
                    label: 'Wave shaper',
                },
                {
                    id: 'analyserNode',
                    label: 'Analyser',
                },
                {
                    id: 'liveInput',
                    label: 'Live Input',
                },
                {
                    id: 'destination',
                    label: 'Output',
                },
            ],
        },
        {
            title: 'Custom nodes',
            active: false,
            items: [
                {
                    id: 'bitcrusher',
                    label: 'Bitcrusher',
                },
                {
                    id: 'pitchshifter',
                    label: 'Pitchshifter',
                },
                {
                    id: 'gate',
                    label: 'Gate',
                },
                {
                    id: 'envelope',
                    label: 'Envelope',
                },
                {
                    id: 'sequencer',
                    label: 'Sequencer',
                },
                {
                    id: 'looper',
                    label: 'Looper',
                },
                {
                    id: 'random',
                    label: 'Random',
                },
                {
                    id: 'knob',
                    label: 'Knob',
                },
            ],
        },
        {
            title: 'Switches',
            active: false,
            items: [
                {
                    id: 'spdtFork',
                    label: 'SPDT Fork',
                },
                {
                    id: 'spdtJoin',
                    label: 'SPDT Join',
                },
            ],
        },
        {
            title: 'Utils',
            active: false,
            items: [
                {
                    id: 'note',
                    label: 'Note',
                },
                {
                    id: 'text',
                    label: 'Text',
                },
            ],
        },
    ]);
    const [query, setQuery] = useState('');
    const uiScale = useSettingsStore(state => state.uiScale);
    const { setNodes, screenToFlowPosition, getNodes } = useReactFlow();

    const isFiltering = !!query.trim();
    const filteredGroups = options.map(o => ({
        ...o,
        items: isFiltering
            ? o.items.filter(item => item.label.toLowerCase().includes(query.trim().toLowerCase()))
            : o.items,
    }));
    const hasResults = !isFiltering || filteredGroups.some(o => o.items.length > 0);

    function handleTabClick(index: number) {
        const newOptions = options.slice();
        newOptions[index].active = !newOptions[index].active;

        setOptions(newOptions);
    }

    function onDragStart(event: DragEvent, nodeType: string) {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
        const preview = document.createElement('div');
        preview.style.display = 'none';
        event.dataTransfer.setDragImage(preview, 0, 0);
    }

    function handleClick(nodeType: NodeType) {
        return () => {
            const size = nodeSizes[nodeType as keyof typeof nodeSizes] ?? { x: 6, y: 3 };
            const offsetX = size.x * 16;
            const offsetY = size.y * 16;

            const pos = screenToFlowPosition({
                x: innerWidth / 2 - offsetX,
                y: innerHeight / 2 - offsetY,
            });

            while (getNodes().some(n => n.position.x === pos.x && n.position.y === pos.y)) {
                pos.x += 16;
                pos.y += 16;
            }

            const newNode = {
                id: String(Date.now()),
                type: nodeType,
                position: pos,
                data: {
                    ...initialNodeData[nodeType],
                },
            };

            setNodes(nodes => nodes.concat(newNode));
        };
    }

    return (
        <Container
            onWheel={e => {
                e.stopPropagation();
            }}
            scale={uiScale}
        >
            <SearchContainer>
                <SearchInput
                    type="text"
                    placeholder="Search..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </SearchContainer>
            {filteredGroups.map(
                (o, i) =>
                    (!isFiltering || o.items.length > 0) && (
                        <div key={i}>
                            <Tab
                                active={isFiltering || options[i].active}
                                onClick={() => !isFiltering && handleTabClick(i)}
                            >
                                <Triangle src={triangle} />
                                {o.title}
                            </Tab>
                            <Options active={isFiltering || options[i].active}>
                                {o.items.map((item, j) => (
                                    <Option
                                        key={j}
                                        onDragStart={event => onDragStart(event, item.id)}
                                        onClick={handleClick(item.id as NodeType)}
                                        draggable
                                    >
                                        {item.label}
                                    </Option>
                                ))}
                            </Options>
                        </div>
                    )
            )}
            {!hasResults && <NoResults>No results</NoResults>}
        </Container>
    );
}

const Triangle = styled(SVG)`
    width: 7px;
    height: 4px;
    transform: rotate(90deg);
`;

const Tab = styled.div<{ active: boolean }>`
    ${outsetBorder}
    position: relative;
    user-select: none;
    display: flex;
    align-items: center;
    padding: 2px 15px 3px 5px;
    gap: 5px;
    background-color: ${surface};

    &:hover {
        background-image: var(--hover-dither);
        cursor: pointer;
    }

    ${({ active }) =>
        active &&
        `${Triangle} {
  transform: rotate(180deg);
`}
`;

const Options = styled.div<{ active: boolean }>`
    overflow: hidden;
    border-right: 1px solid ${button_shadow};

    height: 0;
    ${({ active }) =>
        active
            ? `
  height: auto;
`
            : `
  border-bottom: none !important;
`}

    &:hover {
        cursor: grab;
    }
`;
const SearchContainer = styled.div`
    display: flex;
    border-right: 1px solid ${button_shadow};
`;

const SearchInput = styled.input`
    display: block;
    box-sizing: border-box;
    flex: 1;
    width: auto;
    margin: 2px;
    padding: 3px 5px;
    outline: none;
    ${fieldBorder}
`;

const NoResults = styled.div`
    padding: 8px 5px;
    color: ${button_shadow};
    border-right: 1px solid ${button_shadow};
    border-bottom: 1px solid ${button_shadow};
`;

const Option = styled.div`
    padding: 5px;

    background-color: ${surface};

    &:hover {
        background-image: var(--hover-dither);
    }
`;

const Container = styled.div<{ scale: number }>`
    background-color: ${surface};
    color: ${text_color};
    box-sizing: border-box;
    overflow-y: auto;
    min-width: 100px;
    max-height: calc(100% - ${headerHeight}px);
    position: absolute;
    z-index: 999;

    ${({ scale }) => `zoom: ${scale};`}

    & > div:last-child > ${Options}:last-child {
        border-bottom: 1px solid ${button_shadow};
    }
`;
