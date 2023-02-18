import { Position } from 'reactflow'
import { Edge } from './BaseNode/types'

export const positions = [
  [Position.Left, Position.Top, Position.Right, Position.Bottom],
  [Position.Top, Position.Right, Position.Bottom, Position.Left],
  [Position.Right, Position.Bottom, Position.Left, Position.Top],
  [Position.Bottom, Position.Left, Position.Top, Position.Right],
]

export function getEdgeIndex(edge: Edge) {
  switch(edge) {
    case 'left':    return 0
    case 'top':     return 1
    case 'right':   return 2
    case 'bottom':  return 3
  }
}