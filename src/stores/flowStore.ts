import { create } from 'zustand'

type EdgeType = 'smoothstep' | 'default'
type FlowStore = {
  edgeType: EdgeType
  editMode: boolean
  setEditMode: (editMode: boolean) => void
  getEdgeType: () => EdgeType
  setEdgeType: (edgeType: EdgeType) => void
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  edgeType: 'smoothstep',
  editMode: true,
  setEditMode: (editMode) => set(() => ({ editMode })),
  getEdgeType: () => get().edgeType,
  setEdgeType: (edgeType) => set(() => ({ edgeType }))
}))