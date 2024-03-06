import { useEffect, useRef } from 'react'
import { useReactFlow } from 'reactflow'
import { clamp } from '../../helpers'

export function ZoomController() {
  const zoom = useRef(1)
  const { zoomTo } = useReactFlow()

  function onScroll(event: Event) {
    const zoomIn = (event as WheelEvent).deltaY > 0
    zoom.current =  zoomIn ? clamp(zoom.current + 1, 0, 2) : clamp(zoom.current - 1, 0, 2)
    zoomTo(zoom.current)
  }
  
  useEffect(() => {
    document.addEventListener('mousewheel', onScroll)

    return(() => {
      document.removeEventListener('mousewheel', onScroll)
    })
  }, [zoomTo])

  return null
}