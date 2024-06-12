import { create } from 'zustand'
import { persist, createJSONStorage, PersistStorage } from 'zustand/middleware'

type EdgeType = 'default' | 'smoothstep'
type UIScale = 1 | 2

type SettingsStore = {
  edgeType: EdgeType
  getEdgeType: () => EdgeType,
  uiScale: UIScale
  setEdgeType: (edgeType: EdgeType) => void
  setUIScale: (uiScale: UIScale) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      edgeType: 'smoothstep',
      getEdgeType: () => get().edgeType,
      uiScale: 2,
      setEdgeType: (edgeType: EdgeType) => set({ edgeType }),
      setUIScale: (uiScale: UIScale) => set({ uiScale })
    }),
    {
      name: 'settings', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    },
  ),
)