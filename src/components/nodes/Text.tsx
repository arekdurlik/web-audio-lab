import { NoteProps } from './types'
import { useRef, useEffect, useState } from 'react'
import { useOutsideClick } from '../../hooks/useOutsideClick'
import styled from 'styled-components'
import { Delete } from './BaseNode/styled'
import { useUpdateFlowNode } from '../../hooks/useUpdateFlowNode'

export function Text({ id, data }: NoteProps) {
  const [active, setActive] = useState(false)
  const [content, setContent] = useState(data.content ?? ``)
  const activator = useOutsideClick(() => setActive(false))
  const textarea = useRef<HTMLTextAreaElement | null>(null)
  const { updateNode, deleteNode } = useUpdateFlowNode(id)

  useEffect(() => {
    updateNode({ content })
  }, [content])

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
const Container = styled.div`
min-width: 30px;
min-height: 30px;

&:hover {
  box-shadow: inset 0px 0px 0px 1px #000;
}
`

const Textarea = styled.textarea`
margin: 5px; 
margin-right: 20px;
background: none;
border: none;
outline: none;
font-size: 12px;
resize: none;

&:hover, &:active {
  resize: both;
}
`
