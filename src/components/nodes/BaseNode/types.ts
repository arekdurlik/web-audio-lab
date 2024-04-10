import { ReactNode } from 'react'

export type Socket = {
  id: string
  label?: string
  tooltip?: string
  visual?: 'line' | 'param' | 'circle'
  type: 'target' | 'source'
  edge: Edge
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
  parameterOffset?: number
  parametersWidth?: number
  data: {
    rotation?: Rotation
  }
  sockets: Socket[]

  startExpanded?: boolean
  disableRemoval?: boolean
  disableBackground?: boolean
  disableBorder?: boolean
  borderColor?: string
  background?: ReactNode
  optionsColor?: string
  valueFont?: string
  valueColor?: string
  valueUnit?: string
  constantSize?: boolean
  optionsStyle?: {
    [x:string]: string
  }
  labelPosition?: [[number, number], [number, number]]
  onRotate?: (value?: Rotation) => any
}

type Rotation = 0 | 2 | 1 | 3