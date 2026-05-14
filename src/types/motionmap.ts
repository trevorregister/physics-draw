export interface MMDot {
  id: string
  position: number
  velocityMag: number
  velocityDir: 1 | -1
}

export type MMOrientation = 'horizontal' | 'vertical'

export interface MMState {
  orientation: MMOrientation
  dots: MMDot[]
  accelMag: number
  accelDir: 1 | -1
  showVelocity: boolean
  showAccel: boolean
  showLabels: boolean
  snapEnabled: boolean
}
