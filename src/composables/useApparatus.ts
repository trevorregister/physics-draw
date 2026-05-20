import { ref, computed } from 'vue'
import type { ApparatusState, ApparatusObject, ApparatusObjectType, ObjectLabel } from '@/types/apparatus'
import { useUndoStack } from './useUndoStack'
import { snapToIncrement } from './useSnap'

export const DEFAULT_DIMS: Record<ApparatusObjectType, [number, number]> = {
  'line': [200, 4],
  'hatched-line': [200, 30],
  'box': [80, 80],
  'spring': [120, 80],
  'incline': [160, 120],
  'jagged-line': [200, 20],
  'pulley': [60, 60],
  'circle': [60, 60],
  'cart': [120, 60],
  'arrow': [120, 20],
  'rod': [200, 10],
  'disk': [60, 60],
  'torque-arrow': [60, 60],
  'container': [120, 100],
  'fluid-fill': [120, 60],
  'pressure-arrow': [100, 20],
  'pipe': [200, 40],
  'height-bracket': [20, 100],
  'ground-reference': [200, 20],
  'standalone-label': [80, 32],
}


const INITIAL_STATE: ApparatusState = {
  objects: [],
  snapEnabled: true,
  gridSpacing: 40,
  showGrid: true,
}

export function useApparatus() {
  const state = ref<ApparatusState>(structuredClone(INITIAL_STATE))
  const selectedId = ref<string | null>(null)
  const { push: pushUndo, undo, canUndo } = useUndoStack<ApparatusState>(INITIAL_STATE)

  const selectedObject = computed(() =>
    state.value.objects.find((o) => o.id === selectedId.value) ?? null
  )

  function addObject(type: ApparatusObjectType, x: number, y: number, labelKatex?: string): string {
    const [width, height] = DEFAULT_DIMS[type]
    const labels: ObjectLabel[] = (type === 'standalone-label' && labelKatex)
      ? [{ id: crypto.randomUUID(), katex: labelKatex, value: '', unit: '', offsetX: 0, offsetY: 0 }]
      : []
    const obj: ApparatusObject = {
      id: crypto.randomUUID(),
      type, x, y, width, height, rotation: 0, labels,
    }
    state.value = { ...state.value, objects: [...state.value.objects, obj] }
    selectedId.value = obj.id
    pushUndo(state.value)
    return obj.id
  }

  function deleteObject(id: string) {
    state.value = { ...state.value, objects: state.value.objects.filter((o) => o.id !== id) }
    if (selectedId.value === id) selectedId.value = null
    pushUndo(state.value)
  }

  function patchObject(id: string, patch: Partial<Omit<ApparatusObject, 'id' | 'type'>>) {
    state.value = {
      ...state.value,
      objects: state.value.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }
  }

  function moveObject(id: string, x: number, y: number) {
    patchObject(id, { x, y })
  }

  function commitMove(id: string) {
    pushUndo(state.value)
    void id
  }

  function resizeObject(id: string, x: number, y: number, width: number, height: number) {
    patchObject(id, { x, y, width: Math.max(10, width), height: Math.max(10, height) })
  }

  function commitResize(id: string) {
    pushUndo(state.value)
    void id
  }

  function rotateObject(id: string, rotation: number) {
    patchObject(id, { rotation })
  }

  function commitRotation(id: string) {
    pushUndo(state.value)
    void id
  }

  function moveLabelOffset(objId: string, lblId: string, offsetX: number, offsetY: number) {
    state.value = {
      ...state.value,
      objects: state.value.objects.map((o) =>
        o.id === objId
          ? {
              ...o,
              labels: o.labels.map((l) => (l.id === lblId ? { ...l, offsetX, offsetY } : l)),
            }
          : o
      ),
    }
  }

  function commitLabelMove(objId: string, lblId: string) {
    pushUndo(state.value)
    void objId; void lblId
  }

  function addLabel(objId: string, partial: Omit<ObjectLabel, 'id'>) {
    const label: ObjectLabel = { ...partial, id: crypto.randomUUID() }
    state.value = {
      ...state.value,
      objects: state.value.objects.map((o) =>
        o.id === objId ? { ...o, labels: [...o.labels, label] } : o
      ),
    }
    pushUndo(state.value)
  }

  function updateLabel(objId: string, lblId: string, patch: Partial<Omit<ObjectLabel, 'id'>>) {
    state.value = {
      ...state.value,
      objects: state.value.objects.map((o) =>
        o.id === objId
          ? { ...o, labels: o.labels.map((l) => (l.id === lblId ? { ...l, ...patch } : l)) }
          : o
      ),
    }
    pushUndo(state.value)
  }

  function deleteLabel(objId: string, lblId: string) {
    state.value = {
      ...state.value,
      objects: state.value.objects.map((o) =>
        o.id === objId ? { ...o, labels: o.labels.filter((l) => l.id !== lblId) } : o
      ),
    }
    pushUndo(state.value)
  }

  function select(id: string | null) {
    selectedId.value = id
  }

  function setSnap(enabled: boolean) {
    state.value = { ...state.value, snapEnabled: enabled }
  }

  function setGridSpacing(spacing: number) {
    state.value = { ...state.value, gridSpacing: Math.min(80, Math.max(20, spacing)) }
  }

  function setShowGrid(show: boolean) {
    state.value = { ...state.value, showGrid: show }
  }

  function undoAction() {
    const prev = undo()
    if (prev) {
      state.value = prev
      if (selectedId.value && !prev.objects.find((o) => o.id === selectedId.value)) {
        selectedId.value = null
      }
    }
  }

  function clearAll() {
    state.value = structuredClone(INITIAL_STATE)
    selectedId.value = null
    pushUndo(state.value)
  }

  function snapPos(val: number) {
    return state.value.snapEnabled ? snapToIncrement(val, state.value.gridSpacing) : val
  }

  return {
    state,
    selectedId,
    selectedObject,
    canUndo,
    addObject,
    deleteObject,
    moveObject,
    commitMove,
    resizeObject,
    commitResize,
    rotateObject,
    commitRotation,
    moveLabelOffset,
    commitLabelMove,
    addLabel,
    updateLabel,
    deleteLabel,
    select,
    setSnap,
    setGridSpacing,
    setShowGrid,
    undoAction,
    clearAll,
    snapPos,
  }
}
