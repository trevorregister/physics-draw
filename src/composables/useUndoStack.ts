import { ref, computed } from 'vue'

export function useUndoStack<T>(initial: T) {
  // Use plain arrays + a trigger ref to avoid Vue's deep-unwrap type conflicts
  let stack: T[] = [structuredClone(initial)]
  let pointer = 0
  const _version = ref(0)

  const canUndo = computed(() => {
    void _version.value
    return pointer > 0
  })

  function push(state: T) {
    stack = stack.slice(0, pointer + 1)
    stack.push(structuredClone(state))
    if (stack.length > 50) stack.shift()
    pointer = stack.length - 1
    _version.value++
  }

  function undo(): T | null {
    if (pointer <= 0) return null
    pointer--
    _version.value++
    return structuredClone(stack[pointer])
  }

  return { push, undo, canUndo }
}
