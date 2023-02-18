import { create } from 'zustand'

type EdgeType = 'smoothstep' | 'default'
type FlowStore = {
  edgeType: EdgeType
  animated: boolean
  setAnimated: (animated: boolean) => void
  isAnimated: () => boolean
  getEdgeType: () => EdgeType
  setEdgeType: (edgeType: EdgeType) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  edgeType: 'smoothstep',
  animated: false,
  setAnimated: (animated) => set(() => ({ animated })),
  isAnimated: () => get().animated,
  getEdgeType: () => get().edgeType,
  setEdgeType: (edgeType) => set(() => ({ edgeType }))
}))