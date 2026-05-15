import { ref, computed } from 'vue'
import type { FBDVector, FBDState, ObjectStyle } from '@/types'
import { useUndoStack } from './useUndoStack'
import { snapToIncrement } from './useSnap'

const INITIAL_STATE: FBDState = {
  vectors: [],
  objectStyle: 'dot',
  snapEnabled: true,
  showGrid: false,
  showCrosshair: false,
}

export function useFBD() {
  const state = ref<FBDState>(structuredClone(INITIAL_STATE))
  const selectedId = ref<string | null>(null)
  const { push: pushUndo, undo, canUndo } = useUndoStack<FBDState>(INITIAL_STATE)

  const selectedVector = computed(() =>
    state.value.vectors.find((v) => v.id === selectedId.value) ?? null
  )

  function addVector(opts: Omit<FBDVector, 'id'>) {
    const vector: FBDVector = { ...opts, id: crypto.randomUUID() }
    state.value = { ...state.value, vectors: [...state.value.vectors, vector] }
    pushUndo(state.value)
    selectedId.value = vector.id
    return vector.id
  }

  function deleteVector(id: string) {
    state.value = { ...state.value, vectors: state.value.vectors.filter((v) => v.id !== id) }
    if (selectedId.value === id) selectedId.value = null
    pushUndo(state.value)
  }

  function updateVector(id: string, patch: Partial<Omit<FBDVector, 'id'>>) {
    state.value = {
      ...state.value,
      vectors: state.value.vectors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }
  }

  function commitVectorUpdate() {
    pushUndo(state.value)
  }

  function updateVectorSnapped(id: string, rawAngle: number, rawMagnitude: number) {
    let angle = ((rawAngle % 360) + 360) % 360
    let magnitude = Math.max(30, rawMagnitude)

    if (state.value.snapEnabled) {
      angle = ((snapToIncrement(angle, 15) % 360) + 360) % 360
      magnitude = Math.max(30, snapToIncrement(magnitude, 20))
    }

    updateVector(id, { angle, magnitude })
    return { angle, magnitude }
  }

  function setObjectStyle(style: ObjectStyle) {
    state.value = { ...state.value, objectStyle: style }
    pushUndo(state.value)
  }

  function setSnapEnabled(enabled: boolean) {
    state.value = { ...state.value, snapEnabled: enabled }
  }

  function setShowGrid(show: boolean) {
    state.value = { ...state.value, showGrid: show }
  }

  function setShowCrosshair(show: boolean) {
    state.value = { ...state.value, showCrosshair: show }
  }

  function clearAll() {
    state.value = structuredClone(INITIAL_STATE)
    selectedId.value = null
    pushUndo(state.value)
  }

  function undoAction() {
    const prev = undo()
    if (prev) {
      state.value = prev
      if (selectedId.value && !prev.vectors.find((v) => v.id === selectedId.value)) {
        selectedId.value = null
      }
    }
  }

  return {
    state,
    selectedId,
    selectedVector,
    canUndo,
    addVector,
    deleteVector,
    updateVector,
    commitVectorUpdate,
    updateVectorSnapped,
    setObjectStyle,
    setSnapEnabled,
    setShowGrid,
    setShowCrosshair,
    clearAll,
    undoAction,
  }
}
