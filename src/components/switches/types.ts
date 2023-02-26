import { NodeProps } from '../nodes/types'

export type SPDTProps = NodeProps & {
  data: {
    state: 'A' | 'B'
  }
}