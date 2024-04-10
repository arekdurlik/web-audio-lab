import Tippy from '@tippyjs/react/headless'; // different import path!
import { ReactElement } from 'react'
import styled from 'styled-components'
import { followCursor } from 'tippy.js'

type TooltipProps = {
  content: string
  delay?: number
  children: ReactElement
  zoom?: number
}

export function Tooltip ({ content, children, delay = 500, zoom }: TooltipProps) {
  return <Tippy 
    plugins={[followCursor]}
    followCursor='initial'
    placement='bottom-start'
    offset={[10, 5]}
    delay={[delay, 0]}
    hideOnClick={false}
    render={attrs => (
      <TooltipContainer 
        zoom={zoom}
        tabIndex={-1} {...attrs}>
        {content}
      </TooltipContainer>
    )}
  >
    {children}
  </Tippy>
}

const TooltipContainer = styled.div<{ zoom?: number }>`
display: flex;
padding: 2px 5px;
background-color: #faf0c8;
border: 1px solid darkkhaki;
${({ zoom }) => zoom !== undefined && `zoom: ${Math.max(0.5, zoom)};`}
`