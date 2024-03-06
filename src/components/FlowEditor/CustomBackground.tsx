import { useEffect, useState } from 'react'
import { useViewport } from 'reactflow'
import { waitForElement } from '../../helpers'

const PATTERN_SIZE = 16

export function CustomBackground() {
  const { x, y, zoom } = useViewport()
  const [bg] = useState(document.createElement('div'))

  useEffect(() => {
    setupBackground()
  }, [])

  useEffect(() => {
    const offset = PATTERN_SIZE * zoom
    bg.style.left = x % offset + 'px'
    bg.style.top = y % offset + 'px'
  }, [x, y])
  
  useEffect(() => {
    bg.style.backgroundSize = `${PATTERN_SIZE * zoom}px ${PATTERN_SIZE * zoom}px`
  }, [zoom])

  async function setupBackground() {
    const rf = await waitForElement('[data-testid="rf__wrapper"]')

    if (!rf) return

    bg.style.backgroundImage = 'url(svg/dotted_background.svg)'
    bg.style.position = 'absolute'
    bg.style.top = '0'
    bg.style.left = '0'
    bg.style.width = '100%'
    bg.style.height = '100%'
    
    rf.appendChild(bg)
  }

  return null 
}