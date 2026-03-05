import { create } from 'zustand'
import type { Scene } from '@/types'

interface SceneState {
  scenes: Scene[]
  load: () => Promise<void>
  add: (scene: Scene) => Promise<void>
  update: (scene: Scene) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSceneStore = create<SceneState>((set, get) => ({
  scenes: [],

  load: async () => {
    const data = (await window.api.getAll('scenes')) as Scene[]
    set({ scenes: data })
  },

  add: async (scene) => {
    const updated = [...get().scenes, scene]
    await window.api.set('scenes', updated)
    set({ scenes: updated })
  },

  update: async (scene) => {
    const updated = get().scenes.map((s) => (s.id === scene.id ? scene : s))
    await window.api.set('scenes', updated)
    set({ scenes: updated })
  },

  remove: async (id) => {
    const updated = get().scenes.filter((s) => s.id !== id)
    await window.api.set('scenes', updated)
    set({ scenes: updated })
  }
}))
