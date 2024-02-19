import { NoteProps } from './types'
import { useRef, useEffect, useState } from 'react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import styled from 'styled-components'
import { Delete } from './BaseNode/styled'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'

export function Note({ id, data }: NoteProps) {
  const [active, setActive] = useState(false)
  const [content, setContent] = useState(data.content ?? '')
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
      textarea.current.style.width = data.size.width - 4 + 'px'
      textarea.current.style.height = data.size.height - 4 + 'px'
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
        {active && <DeleteWrapper>
          <Delete onClick={deleteNode}/>
        </DeleteWrapper>}
        <Textarea 
          placeholder='Type here...'
          ref={textarea}
          spellCheck={false}
          onPointerDownCapture={e => { e.stopPropagation() }}
          onMouseDownCapture={e => { e.stopPropagation() }}
          onChange={e => setContent(e.target.value)}
          value={content}
        />
      </Container>
    </div>
  )
}

const DeleteWrapper = styled.div`
position: absolute;
right: 0;
padding: 5px;
`

const Textarea = styled.textarea`
margin: 5px; 
margin-right: 20px;
background: none;
border: none;
outline: none;
resize: none;
`

const Container = styled.div`
background: #faf0c8;
min-width: 30px;
min-height: 30px;
box-shadow: 0px 0px 0px 1px darkkhaki inset;

&:hover, &:active {
  ${Textarea} {
    resize: both;
  }
}
`
