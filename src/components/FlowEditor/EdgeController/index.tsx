import { useEffect, useReducer, useRef, useState } from 'react'
import { useViewport, Edge } from 'reactflow'
import { plotCubicBezier } from './bezier'
import { range, waitForElement } from '../../../helpers'
import { useFlowStore } from '../../../stores/flowStore'
import { useSettingsStore } from '../../../stores/settingsStore'



export function EdgeController({ edges }: { edges: Edge[] }) {
  const [edgeWrapper, setEdgeWrapper] = useState({ el: document.createElement('div'), x: 0, y: 0})
  const [mutationObserver, setMutationObserver] = useState<MutationObserver | null>(null)
  const { getEdgeType } = useSettingsStore()
  const { x, y, zoom } = useViewport()
  const [viewport, setViewport] = useState<HTMLDivElement | null>(null)
  const panning = useFlowStore(state => state.panning)
  const prevZoom = useRef(zoom)

  useEffect(() => {
    setViewport(document.querySelector('.react-flow__viewport') as HTMLDivElement)
    if (!viewport) return
    viewport.style.position = 'relative'
  }, [])
  useEffect(() => {
    if (!viewport) return

    const style = getComputedStyle(viewport)
    const matrix = new WebKitCSSMatrix(style.transform)

    // reduce beziers jumping around during zooming in and out
    if (!panning || prevZoom.current !== zoom) {
      prevZoom.current = zoom
      setTimeout(() => edgeWrapper.el.style.transform = `translate(${matrix.m41}px, ${matrix.m42}px)`)
      return
    }
    prevZoom.current = zoom
    
    edgeWrapper.el.style.transform = `translate(${matrix.m41}px, ${matrix.m42}px)`
  }, [x, y])

  useEffect(() => {
    // @ts-ignore Property 'handleMutation' does not exist on type 'Element' duhh
    Element.prototype.handleMutation = function() {}
    setMutationObserver(new MutationObserver(function moDispatchCallback(entries) {
      for (const e of entries)
        (e.target as HTMLElement & { handleMutation: Function }).handleMutation(e)
    }))

    const rf = document.querySelector('.react-flow')
    if (!rf) return

    rf.appendChild(edgeWrapper.el)
  }, [])

  useEffect(() => {
    if (!mutationObserver) return
    // @ts-ignore Property 'handleMutation' does not exist on type 'Element' duhh
    edgeWrapper.el.handleMutation = function() {
      const style = window.getComputedStyle(edgeWrapper.el)
      const matrix = new WebKitCSSMatrix(style.transform)
      setEdgeWrapper(state => ({ ...state, x: matrix.m41, y: matrix.m42 }))
    }

    mutationObserver.observe(edgeWrapper.el, { attributeFilter: ['style'] })
  }, [mutationObserver])


  return <>
    {getEdgeType() === 'default' && edges.map(edge => 
      <BezierEdge 
        key={edge.id}
        edge={edge} 
        mutationObserver={mutationObserver}
        edgeWrapper={edgeWrapper}
      />
    )}
  </>
}

function BezierEdge({ edge, mutationObserver, edgeWrapper }: { edge: Edge<any>, mutationObserver: MutationObserver | null, edgeWrapper: { el: HTMLDivElement, x: number, y: number } }) {
  const [canvas, setCanvas] = useState(document.createElement('canvas'))
  const [ctx, setCtx] = useState<CanvasRenderingContext2D  | null>(null)
  const [el, setEl] = useState<Element | null>(null)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const sourceHandle = useRef<Element | null>(null)
  const targetHandle = useRef<Element | null>(null)
  const imgData = useRef(new Uint8ClampedArray())
  const { zoom } = useViewport()
  
  const uiScale = useSettingsStore(state => state.uiScale)
  const NAVBAR_HEIGHT = 19 * uiScale
  async function setupCanvas() {

    const el = await waitForElement(`.react-flow__edge-default[data-testid="rf__edge-${edge.id}"]`)
    if (!el) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx || !el || !mutationObserver) return

    const path = el.querySelector('path')
    if (!path) return

    //@ts-ignore
    path.handleMutation = function() {
      if (!sourceHandle.current || !targetHandle.current) return

      setSourceRect(sourceHandle.current.getBoundingClientRect())
      setTargetRect(targetHandle.current.getBoundingClientRect())
    }
    
    mutationObserver.observe(path, { attributeFilter: ['d'] })

    const source = document.querySelector(`.source[data-handleid="${edge.sourceHandle}"]`)
    const target = document.querySelector(`.target[data-handleid="${edge.targetHandle}"]`)

    if (!source || !target) return

    sourceHandle.current = source
    targetHandle.current = target
    setEl(el)
    setCanvas(canvas)
    setCtx(ctx)
    edgeWrapper.el.appendChild(canvas)
  }

  useEffect(() => {
    setupCanvas()  

    return (() => {
      // TODO: unobserve edge element before it's removed
      canvas.remove()
    })
  }, [])

  
  function setPixel(x: number, y: number, width: number) {
    var n = (y * width + x) * 4
    imgData.current[n] = 0
    imgData.current[n + 1] = 0
    imgData.current[n + 2] = 0  
    imgData.current[n + 3] = 255
  }

  useEffect(() => {
    if (!el) return

    const { left, top } = el.getBoundingClientRect()
    
    canvas.style.left = -edgeWrapper.x + Math.round(left) - (0.5 * zoom) + 'px'
    canvas.style.top = -edgeWrapper.y + (Math.floor(top - NAVBAR_HEIGHT)) 
    //pixel perfect adjustments
    - zoom - (uiScale === 1 ? 1 : 3) + 'px'

  }, [edgeWrapper.x, edgeWrapper.y])

  useEffect(() => {
    if (!el || !canvas || !ctx || !sourceHandle || !targetHandle) return
    
    const { width, height, left, top } = el.getBoundingClientRect()
    canvas.width = ((width) / zoom)
    canvas.height = ((height) / zoom)
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    canvas.style.position = 'absolute'
    
    canvas.style.left = -edgeWrapper.x + Math.round(left) - (0.5 * zoom) + 'px'
    canvas.style.top = -edgeWrapper.y + (Math.floor(top - NAVBAR_HEIGHT)) 
    //pixel perfect adjustments
    - zoom - (uiScale === 1 ? 1 : 3) + 'px'

    let imageData: ImageData
    try { 
      imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      imgData.current = imageData.data
    } catch {
      return
    }
    
    const source = sourceHandle.current?.getBoundingClientRect()
    const target = targetHandle.current?.getBoundingClientRect()
    
    if (!source || !target) return

    const sourceXPos = (source.left + source.right) / 2
    const sourceYPos = (source.top  + source.bottom) / 2

    const targetXPos = (target.left + target.right ) / 2
    const targetYPos = (target.top  + target.bottom ) / 2

    const pathEl = el.querySelector('path')
    const path = pathEl?.getAttribute('d')?.split(' ')
    
    if (!path) return

    // get bezier curve points from svg path
    const [p_sx, p_sy] =   path[0].split(',').map(v => Math.round(Number(v.replace('M', ''))))
    const [p_tx, p_ty] =   path[3].split(',').map(v => Math.round(Number(v)))
    const [p_sx2, p_sy2] = path[1].split(',').map(v => Math.round(Number(v.replace('C', ''))))
    const [p_tx2, p_ty2] = path[2].split(',').map(v => Math.round(Number(v)))

    // canvas bezier curve start and end points
    const sx = range(sourceXPos, left,  left + width, 0,  canvas.width - 1)
    const sy = range(sourceYPos, top,   top + height, 0,  canvas.height - 1)
    const tx = range(targetXPos, left,  left + width, 0,  canvas.width - 1)
    const ty = range(targetYPos, top,   top + height, 0,  canvas.height - 1)

    // canvas bezier curve control points
    const sx2 = sx + (p_sx2 - p_sx)
    const sy2 = sy + (p_sy2 - p_sy)
    const tx2 = tx - (p_tx - p_tx2)
    const ty2 = ty - (p_ty - p_ty2)

    plotCubicBezier(
      Math.round(sx), 
      Math.round(sy), 
      Math.round(sx2), 
      Math.round(sy2), 
      Math.round(tx2), 
      Math.round(ty2), 
      Math.round(tx), 
      Math.round(ty), 
      (x: number, y: number) => { setPixel(x, y, canvas.width) }
    )
    ctx.putImageData(imageData, 0, 0)
  }, [zoom, el, sourceRect, targetRect])
    
  return null
}