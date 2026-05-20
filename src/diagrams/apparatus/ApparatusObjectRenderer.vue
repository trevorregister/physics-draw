<template>
  <component v-if="comp" :is="comp" :width="width" :height="height" />
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import type { ApparatusObjectType } from '@/types/apparatus'
import AppLine from './objects/AppLine.vue'
import AppHatchedLine from './objects/AppHatchedLine.vue'
import AppBox from './objects/AppBox.vue'
import AppSpring from './objects/AppSpring.vue'
import AppIncline from './objects/AppIncline.vue'
import AppJaggedLine from './objects/AppJaggedLine.vue'
import AppPulley from './objects/AppPulley.vue'
import AppAtwood from './objects/AppAtwood.vue'
import AppHalfAtwood from './objects/AppHalfAtwood.vue'
import AppCircle from './objects/AppCircle.vue'
import AppCart from './objects/AppCart.vue'
import AppArrow from './objects/AppArrow.vue'
import AppRod from './objects/AppRod.vue'
import AppDisk from './objects/AppDisk.vue'
import AppTorqueArrow from './objects/AppTorqueArrow.vue'
import AppContainer from './objects/AppContainer.vue'
import AppFluidFill from './objects/AppFluidFill.vue'
import AppPressureArrow from './objects/AppPressureArrow.vue'
import AppPipe from './objects/AppPipe.vue'
import AppHeightBracket from './objects/AppHeightBracket.vue'
import AppGroundReference from './objects/AppGroundReference.vue'

const COMPONENTS: Partial<Record<ApparatusObjectType, Component>> = {
  'line': AppLine,
  'hatched-line': AppHatchedLine,
  'box': AppBox,
  'spring': AppSpring,
  'incline': AppIncline,
  'jagged-line': AppJaggedLine,
  'pulley': AppPulley,
  'atwood': AppAtwood,
  'half-atwood': AppHalfAtwood,
  'circle': AppCircle,
  'cart': AppCart,
  'arrow': AppArrow,
  'rod': AppRod,
  'disk': AppDisk,
  'torque-arrow': AppTorqueArrow,
  'container': AppContainer,
  'fluid-fill': AppFluidFill,
  'pressure-arrow': AppPressureArrow,
  'pipe': AppPipe,
  'height-bracket': AppHeightBracket,
  'ground-reference': AppGroundReference,
}

const props = defineProps<{ type: ApparatusObjectType; width: number; height: number }>()
const comp = computed(() => COMPONENTS[props.type] ?? null)
</script>
