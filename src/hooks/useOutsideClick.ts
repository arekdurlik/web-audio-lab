import { useEffect, useRef } from 'react'
import { difference } from '../helpers'

export function useOutsideClick(callback: Function, { ignoreOnDrag = false, threshold = 5 } = {}) {
  const ref = useRef<any>()
  const mouseDown = useRef({ x: 0, y: 0 })

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {

        if (ignoreOnDrag) {
          const { x, y } = mouseDown.current
          if (difference(event.clientX, x) > threshold 
          || difference(event.clientY, y) > threshold) {
            return
          }
        }
        
        callback()
      }
    }
    
    function handleMouseDown(event: MouseEvent) {
      mouseDown.current = {
        x: event.clientX,
        y: event.clientY
      }
    }

    document.addEventListener('click', handleClick, true)
    if (ignoreOnDrag) document.addEventListener('mousedown', handleMouseDown, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('mousedown', handleMouseDown, true)
    }
  }, [ref])

  return ref
}