import { ReactNode } from 'react'

export type Socket = {
  id: string,
  label?: string,
  visual?: 'line' | 'triangle',
  type: 'target' | 'source',
  edge: Edge,
  offset: number
}
export type Edge = 'left' | 'top' | 'right' | 'bottom'

export type NodeProps = {
  id: string,
  name: string | ReactNode,
  width?: number
  height?: number
  parameters?: ReactNode
  parameterPositions?: ('bottom' | 'left' | 'top' | 'right')[]
  data: {
    rotation?: 0 | 1 | 2 | 3
  }
  sockets: Socket[]

  disableRemoval?: boolean
}