<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/30" @click="$emit('cancel')" />
      <div class="relative z-10 bg-white rounded-xl shadow-xl border border-border p-6 w-80 space-y-4">
        <h3 class="text-sm font-semibold text-foreground">{{ title }}</h3>
        <p class="text-sm text-muted-foreground">{{ message }}</p>
        <div class="flex gap-2 justify-end">
          <button
            type="button"
            class="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-muted transition-colors"
            @click="$emit('cancel')"
          >Cancel</button>
          <button
            type="button"
            class="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
            @click="$emit('confirm')"
          >{{ confirmLabel ?? 'Confirm' }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  title: string
  message: string
  confirmLabel?: string
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
