export type ApparatusObjectType =
  | 'line'
  | 'hatched-line'
  | 'box'
  | 'spring'
  | 'incline'
  | 'jagged-line'
  | 'pulley'
  | 'atwood'
  | 'atwood-asym'
  | 'half-atwood'
  | 'circle'
  | 'cart'
  | 'arrow'
  | 'rod'
  | 'disk'
  | 'torque-arrow'
  | 'container'
  | 'fluid-fill'
  | 'pressure-arrow'
  | 'pipe'
  | 'height-bracket'
  | 'ground-reference'
  | 'standalone-label'

export interface ObjectLabel {
  id: string
  katex: string
  value: string
  unit: string
  offsetX: number
  offsetY: number
}

export interface ApparatusObject {
  id: string
  type: ApparatusObjectType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  flipX?: boolean
  flipY?: boolean
  labels: ObjectLabel[]
}

export interface ApparatusState {
  objects: ApparatusObject[]
  snapEnabled: boolean
  gridSpacing: number
  showGrid: boolean
}
