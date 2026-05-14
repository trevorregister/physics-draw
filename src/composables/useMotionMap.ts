import { ref, computed } from 'vue'
import type { MMDot, MMState, MMOrientation } from '@/types'
import { useUndoStack } from './useUndoStack'
import { snapToIncrement } from './useSnap'

const INITIAL_STATE: MMState = {
  orientation: 'horizontal',
  dots: [],
  accelMag: 60,
  accelDir: 1,
  showVelocity: true,
  showAccel: true,
  showLabels: true,
  snapEnabled: true,
}

export function useMotionMap() {
  const state = ref<MMState>(structuredClone(INITIAL_STATE))
  const selectedId = ref<string | null>(null)
  const { push: pushUndo, undo, canUndo } = useUndoStack<MMState>(INITIAL_STATE)

  const sortedDots = computed(() =>
    [...state.value.dots].sort((a, b) => a.position - b.position)
  )

  const selectedDot = computed(() =>
    state.value.dots.find((d) => d.id === selectedId.value) ?? null
  )

  function addDot(rawPosition: number) {
    let position = rawPosition
    if (state.value.snapEnabled) {
      position = snapToIncrement(rawPosition, 10)
    }
    const dot: MMDot = {
      id: crypto.randomUUID(),
      position,
      velocityMag: 40,
      velocityDir: 1,
    }
    state.value = { ...state.value, dots: [...state.value.dots, dot] }
    pushUndo(state.value)
    selectedId.value = dot.id
  }

  function deleteDot(id: string) {
    state.value = { ...state.value, dots: state.value.dots.filter((d) => d.id !== id) }
    if (selectedId.value === id) selectedId.value = null
    pushUndo(state.value)
  }

  function updateDotPosition(id: string, rawPosition: number) {
    let position = rawPosition
    if (state.value.snapEnabled) {
      position = snapToIncrement(rawPosition, 10)
    }
    state.value = {
      ...state.value,
      dots: state.value.dots.map((d) => (d.id === id ? { ...d, position } : d)),
    }
  }

  function commitDotUpdate() {
    pushUndo(state.value)
  }

  function updateDotVelocity(id: string, mag: number, dir: 1 | -1) {
    state.value = {
      ...state.value,
      dots: state.value.dots.map((d) =>
        d.id === id ? { ...d, velocityMag: Math.max(0, mag), velocityDir: dir } : d
      ),
    }
    pushUndo(state.value)
  }

  function setOrientation(orientation: MMOrientation) {
    state.value = { ...state.value, orientation, dots: [] }
    selectedId.value = null
    pushUndo(state.value)
  }

  function setAccel(mag: number, dir: 1 | -1) {
    state.value = { ...state.value, accelMag: Math.max(0, mag), accelDir: dir }
    pushUndo(state.value)
  }

  function setShowVelocity(show: boolean) {
    state.value = { ...state.value, showVelocity: show }
  }

  function setShowAccel(show: boolean) {
    state.value = { ...state.value, showAccel: show }
  }

  function setShowLabels(show: boolean) {
    state.value = { ...state.value, showLabels: show }
  }

  function setSnapEnabled(enabled: boolean) {
    state.value = { ...state.value, snapEnabled: enabled }
  }

  function undoAction() {
    const prev = undo()
    if (prev) {
      state.value = prev
      if (selectedId.value && !prev.dots.find((d) => d.id === selectedId.value)) {
        selectedId.value = null
      }
    }
  }

  return {
    state,
    selectedId,
    selectedDot,
    sortedDots,
    canUndo,
    addDot,
    deleteDot,
    updateDotPosition,
    commitDotUpdate,
    updateDotVelocity,
    setOrientation,
    setAccel,
    setShowVelocity,
    setShowAccel,
    setShowLabels,
    setSnapEnabled,
    undoAction,
  }
}
