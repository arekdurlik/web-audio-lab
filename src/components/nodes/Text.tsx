import { NoteProps } from './types'
import { useRef, useEffect, useState } from 'react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import styled from 'styled-components'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'
import nodeDelete from '/svg/node_delete.svg'
import resizer from '/svg/resizer.svg'
import SVG from 'react-inlinesvg'

export function Text({ id, data }: NoteProps) {
  const [active, setActive] = useState(false)
  const [content, setContent] = useState(data.content ?? ``)
  const [size, setSize] = useState(data.size)
  const resizeObserver = useRef(new ResizeObserver(entries => {
    const { inlineSize, blockSize } = entries[0].borderBoxSize[0]
    setSize({
      width: inlineSize,
      height: blockSize
    })
  }))
  const activator = useOutsideClick(() => setActive(false))
  const textarea = useRef<HTMLTextAreaElement | null>(null)
  const { updateNode, deleteNode } = useUpdateFlowNode(id)

  // init note size and observer
  useEffect(() => {
    if (!textarea.current) return

    if (data.size) {
      textarea.current.style.width = data.size.width + 'px'
      textarea.current.style.height = data.size.height + 'px'
    }

    resizeObserver.current.observe(textarea.current)
  }, [textarea])

  useEffect(() => {
    updateNode({ content, size })
  }, [content, size])

  // on init, expand height if there is overflow
  useEffect(() => {
    if (!textarea.current || content === data.content) return

    if (textarea.current.offsetHeight < textarea.current.scrollHeight) {
      textarea.current.style.height = ''
      textarea.current.style.height = textarea.current.scrollHeight + 'px'
    }
  }, [content])

  return (
    <div
      onPointerOver={() => setActive(true)}
      onPointerOut={() => setActive(false)} 
      ref={activator}
    >
      <Container>
        {active && <Delete src={nodeDelete} onClick={deleteNode}/>}
        <Textarea 
          placeholder='Type here...'
          ref={textarea}
          spellCheck={false}
          onPointerDownCapture={e => { e.stopPropagation() }}
          onMouseDownCapture={e => { e.stopPropagation() }}
          onChange={e => setContent(e.target.value)}
          value={content}
        />
        <Resizer src={resizer}/>
      </Container>
    </div>
  )
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
`

const Resizer = styled(SVG)`
width: 7px;
height: 7px;
position: absolute;
right: 16px;
bottom: 0px;
opacity: 0;
pointer-events: none;
`

const Textarea = styled.textarea`
margin-right: 16px;
margin-bottom: -2px;
background: none;
border: none;
outline: none;
font-size: 11px;
resize: none;

::-webkit-resizer {
  display: none;
}
`

const Container = styled.div`

&:hover {
  box-shadow: inset 0px 0px 0px 1px #000;
  background-color: #fff;

  ${Resizer} {
    opacity: 1;
  }

  ${Textarea} {
    box-shadow: inset 0px 0px 0px 1px #000;
    resize: both;
  }
}
`



