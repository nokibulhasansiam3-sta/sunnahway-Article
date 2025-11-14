import { reactive } from 'vue'

export type Toast = { id: number; text: string; type?: 'success' | 'error' | 'info' }

const state = reactive({
  list: [] as Toast[],
  nextId: 1,
})

export function useToast() {
  function show(text: string, type: Toast['type'] = 'info', ms = 2500) {
    const id = state.nextId++
    state.list.push({ id, text, type })
    setTimeout(() => remove(id), ms)
  }
  function remove(id: number) {
    const idx = state.list.findIndex(t => t.id === id)
    if (idx !== -1) state.list.splice(idx, 1)
  }
  return { state, show, remove }
}
