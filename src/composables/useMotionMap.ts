import { ref, computed } from 'vue'
import type { MMDot, MMState, MMOrientation, MMPositiveDirection } from '@/types'
import { useUndoStack } from './useUndoStack'

const INITIAL_STATE: MMState = {
  orientation: 'horizontal',
  positiveDirection: 'right',
  gridSpacing: 40,
  showGrid: true,
  showAllVelocity: true,
  showAllAccel: true,
  showLabels: true,
  velocityScale: 0.75,
  dots: [],
}

export function useMotionMap() {
  const state = ref<MMState>(structuredClone(INITIAL_STATE))
  const selectedId = ref<string | null>(null)
  const { push: pushUndo, undo, canUndo } = useUndoStack<MMState>(INITIAL_STATE)

  const selectedDot = computed(() =>
    state.value.dots.find((d) => d.id === selectedId.value) ?? null
  )

  function addDot(gridIndex: number) {
    const existing = state.value.dots.find((d) => d.gridIndex === gridIndex)
    if (existing) {
      selectedId.value = existing.id
      return
    }
    const nextTime =
      state.value.dots.length === 0
        ? 0
        : Math.max(...state.value.dots.map((d) => d.timeIndex)) + 1
    const dot: MMDot = {
      id: crypto.randomUUID(),
      gridIndex,
      timeIndex: nextTime,
      velocity: { direction: 1, visible: true },
      acceleration: { magnitude: 0, direction: 1, visible: true },
    }
    state.value = { ...state.value, dots: [...state.value.dots, dot] }
    pushUndo(state.value)
    selectedId.value = dot.id
  }

  function deleteDot(id: string) {
    const remaining = state.value.dots
      .filter((d) => d.id !== id)
      .sort((a, b) => a.timeIndex - b.timeIndex)
      .map((d, i) => ({ ...d, timeIndex: i }))
    state.value = { ...state.value, dots: remaining }
    if (selectedId.value === id) selectedId.value = null
    pushUndo(state.value)
  }

  function updateDotVelocity(id: string, velocity: MMDot['velocity']) {
    state.value = {
      ...state.value,
      dots: state.value.dots.map((d) => (d.id === id ? { ...d, velocity } : d)),
    }
    pushUndo(state.value)
  }

  function updateDotAcceleration(id: string, acceleration: MMDot['acceleration']) {
    state.value = {
      ...state.value,
      dots: state.value.dots.map((d) => (d.id === id ? { ...d, acceleration } : d)),
    }
    pushUndo(state.value)
  }

  function setOrientation(orientation: MMOrientation) {
    const positiveDirection: MMPositiveDirection =
      orientation === 'horizontal' ? 'right' : 'up'
    state.value = { ...state.value, orientation, positiveDirection, dots: [] }
    selectedId.value = null
    pushUndo(state.value)
  }

  function setPositiveDirection(positiveDirection: MMPositiveDirection) {
    state.value = { ...state.value, positiveDirection }
    pushUndo(state.value)
  }

  function setGridSpacing(px: number) {
    state.value = { ...state.value, gridSpacing: Math.max(20, Math.min(80, px)) }
    pushUndo(state.value)
  }

  function setShowGrid(showGrid: boolean) {
    state.value = { ...state.value, showGrid }
  }

  function setShowAllVelocity(showAllVelocity: boolean) {
    state.value = { ...state.value, showAllVelocity }
  }

  function setShowAllAccel(showAllAccel: boolean) {
    state.value = { ...state.value, showAllAccel }
  }

  function setShowLabels(showLabels: boolean) {
    state.value = { ...state.value, showLabels }
  }

  function setVelocityScale(scale: number) {
    state.value = { ...state.value, velocityScale: Math.max(0.1, Math.min(5, scale)) }
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
    canUndo,
    addDot,
    deleteDot,
    updateDotVelocity,
    updateDotAcceleration,
    setOrientation,
    setPositiveDirection,
    setGridSpacing,
    setShowGrid,
    setShowAllVelocity,
    setShowAllAccel,
    setShowLabels,
    setVelocityScale,
    undoAction,
  }
}
