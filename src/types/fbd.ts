export interface FBDVector {
  id: string
  angle: number
  magnitude: number
  label: string
  color: string
}

export type ObjectStyle = 'dot' | 'box' | 'circle'

export interface FBDState {
  vectors: FBDVector[]
  objectStyle: ObjectStyle
  snapEnabled: boolean
  showGrid: boolean
  showCrosshair: boolean
}
