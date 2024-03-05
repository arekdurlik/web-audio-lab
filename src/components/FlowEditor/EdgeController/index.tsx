import { useEffect, useReducer, useRef, useState } from 'react'
import { useReactFlow, useViewport, Edge as EdgeType } from 'reactflow'
import { plotCubicBezier } from './bezier'
import { range } from '../../../helpers'
import { useFlowStore } from '../../../stores/flowStore'

const NAVBAR_HEIGHT = 47

export function EdgeController({ edges }: {edges: any }) {
  const { getEdges } = useReactFlow()
  const [, forceUpdate] = useReducer(x => x + 1, 0)
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null)
  const { getEdgeType } = useFlowStore()

  useEffect(() => {
    // @ts-ignore Property 'handleResize' does not exist on type 'Element' duhh
    Element.prototype.handleResize = function() {}
    setResizeObserver(new ResizeObserver(function roDispatchCallback(entries) {
      for (const e of entries)
        (e.target as HTMLElement & { handleResize: Function }).handleResize(e)
    }))
  }, [])

  // force a re-render, otherwise edge state is stale
  useEffect(() => {
    forceUpdate()
  }, [edges])

  return <>
    {getEdgeType() === 'default' && getEdges().map((edge, i) => <Edge key={i} edge={edge} resizeObserver={resizeObserver} />)}
  </>
}

function Edge({ edge, resizeObserver }: { edge: EdgeType<any>, resizeObserver: ResizeObserver | null }) {
  const [canvas, setCanvas] = useState(document.createElement('canvas'))
  const [ctx, setCtx] = useState<CanvasRenderingContext2D  | null>(null)
  const [el, setEl] = useState<Element | null>(null)
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const sourceHandle = useRef<Element | null>(null)
  const targetHandle = useRef<Element | null>(null)
  const imgData = useRef(new Uint8ClampedArray())
  const { x, y, zoom } = useViewport()

  function waitForElement(selector: string): Promise<Element | null> {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector))
      }

      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          observer.disconnect()
          resolve(document.querySelector(selector))
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    })
  }

  async function setupCanvas() {
    const el = await waitForElement(`.react-flow__edge-default[data-testid="rf__edge-${edge.id}"]`)
    if (!el) return
    const rf = document.querySelector('.react-flow')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!ctx || !rf || !el || !resizeObserver) return

    //@ts-ignore
    el.handleResize = function() {
      if (!sourceHandle.current || !targetHandle.current) return

      setSourceRect(sourceHandle.current.getBoundingClientRect())
      setTargetRect(targetHandle.current.getBoundingClientRect())
    }
    
    resizeObserver.observe(el)

    const source = document.querySelector(`.source[data-handleid="${edge.sourceHandle}"]`)
    const target = document.querySelector(`.target[data-handleid="${edge.targetHandle}"]`)

    if (!source || !target) return

    sourceHandle.current = source
    targetHandle.current = target
    setEl(el)
    setCanvas(canvas)
    setCtx(ctx)
    rf.appendChild(canvas)
  }

  useEffect(() => {
    setupCanvas()  

    return (() => {
      canvas.remove()
      if (el) resizeObserver?.unobserve(el)
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
    if (!el || !canvas || !ctx || !sourceHandle || !targetHandle) return

    const { width, height, left, top } = el.getBoundingClientRect()
    
    canvas.width = width + 1
    canvas.height = height + 1
    canvas.style.position = 'absolute'
    canvas.style.left = -1 + left + 'px'
    canvas.style.top = (Math.floor(- 1 + top - NAVBAR_HEIGHT)) + 'px'
    
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
    const sx = range(left,  left + width, 0,  canvas.width - 1,   sourceXPos)
    const sy = range(top,   top + height, 0,  canvas.height - 1,  sourceYPos)
    const tx = range(left,  left + width, 0,  canvas.width - 1,   targetXPos)
    const ty = range(top,   top + height, 0,  canvas.height - 1,  targetYPos)

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
  }, [x, y, zoom, el, edge, canvas, ctx, sourceRect, targetRect])
    
  return null
}