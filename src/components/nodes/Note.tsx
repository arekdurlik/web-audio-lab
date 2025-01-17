import { useEffect, useRef, useState } from 'react';
import SVG from 'react-inlinesvg';
import styled from 'styled-components';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode';
import { nodeSizes } from '../FlowEditor/utils';
import { NoteParams, NoteProps } from './types';
import nodeDelete from '/svg/node_delete.svg';
import resizer from '/svg/resizer.svg';

export function Note({ id, data }: NoteProps) {
    const [params, setParams] = useState<NoteParams>({
        ...{ content: '', size: { width: 0, height: 0 } },
        ...data.params,
    });

    const [active, setActive] = useState(false);
    const resizeObserver = useRef(
        new ResizeObserver(entries => {
            const { inlineSize, blockSize } = entries[0].borderBoxSize[0];
            setParams(state => ({ ...state, size: { width: inlineSize, height: blockSize } }));
        })
    );
    const activator = useOutsideClick(() => setActive(false));
    const textarea = useRef<HTMLTextAreaElement | null>(null);
    const { updateNode, deleteNode } = useUpdateFlowNode(id);

    // init note size and observer
    useEffect(() => {
        if (!textarea.current) return;

        if (data.params?.size) {
            textarea.current.style.width = params.size.width + 'px';
            textarea.current.style.height = params.size.height + 'px';
        } else {
            textarea.current.style.width = 16 * nodeSizes.note.x + 1 + 'px';
            textarea.current.style.height = 16 * nodeSizes.note.y + +1 + 'px';
        }

        resizeObserver.current.observe(textarea.current);
    }, [textarea]);

    useEffect(() => {
        updateNode({ params });
    }, [params]);

    // on init, expand height if there is overflow
    useEffect(() => {
        if (!textarea.current) return;

        if (textarea.current.offsetHeight < textarea.current.scrollHeight) {
            textarea.current.style.height = '';
            textarea.current.style.height = textarea.current.scrollHeight + 'px';
        }
    }, [params.content]);

    return (
        <div
            onPointerOver={() => setActive(true)}
            onPointerOut={() => setActive(false)}
            ref={activator}
        >
            <Container>
                {active && <Delete src={nodeDelete} onClick={deleteNode} />}
                <Textarea
                    placeholder="Type here..."
                    ref={textarea}
                    spellCheck={false}
                    onPointerDownCapture={e => {
                        e.stopPropagation();
                    }}
                    onMouseDownCapture={e => {
                        e.stopPropagation();
                    }}
                    onChange={e => setParams(state => ({ ...state, content: e.target.value }))}
                    value={params.content}
                />
                <Resizer src={resizer} />
            </Container>
        </div>
    );
}

const Delete = styled(SVG)`
    width: 8px;
    height: 8px;
    position: absolute;
    right: 0;
    margin: 4px;

    &:hover {
        cursor: pointer;
        color: #999;
    }
`;

const Resizer = styled(SVG)`
    width: 7px;
    height: 7px;
    position: absolute;
    right: 16px;
    bottom: 0px;
    opacity: 0;
    pointer-events: none;
`;

const Textarea = styled.textarea`
    margin-right: 16px;
    margin-bottom: -2px;
    font-size: 11px;
    background: none;
    border: none;
    outline: none;
    resize: none;
    background: #faf0c8;
    box-shadow: 0px 0px 0px 1px darkkhaki inset;

    ::-webkit-resizer {
        display: none;
    }
`;

const Container = styled.div`
    &:hover,
    &:active {
        box-shadow: 0px 0px 0px 1px #000 inset;
        background-color: #fff;

        ${Resizer} {
            opacity: 1;
        }

        ${Textarea} {
            resize: both;
        }
    }
`;
