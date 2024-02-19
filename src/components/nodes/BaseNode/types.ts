import { ReactNode } from 'react'

export type Socket = {
  id: string,
  label?: string,
  visual?: 'line' | 'triangle' | 'circle',
  type: 'target' | 'source',
  edge: Edge,
  offset: number | [number, number, number, number]
}
export type Edge = 'left' | 'top' | 'right' | 'bottom'

export type NodeProps = {
  id: string,
  name?: string | ReactNode,
  value?: number | string,
  width?: number
  height?: number
  children?: ReactNode
  parameters?: ReactNode
  parameterPositions?: ('bottom' | 'left' | 'top' | 'right')[]
  data: {
    rotation?: Rotation
  }
  sockets: Socket[]

  disableRemoval?: boolean
  disableBackground?: boolean
  disableBorder?: boolean
  background?: ReactNode
  optionsColor?: string
  valueFont?: string
  valueColor?: string
  valueUnit?: string
  constantSize?: boolean

  onRotate?: (value?: Rotation) => any
}

type Rotation = 0 | 2 | 1 | 3