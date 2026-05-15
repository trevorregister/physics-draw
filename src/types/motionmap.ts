export type MMOrientation = 'horizontal' | 'vertical'
export type MMPositiveDirection = 'right' | 'left' | 'up' | 'down'

export interface MMDot {
  id: string
  gridIndex: number
  timeIndex: number
  velocity: {
    direction: 1 | -1
    visible: boolean
  }
  acceleration: {
    magnitude: number
    direction: 1 | -1
    visible: boolean
  }
}

export interface MMState {
  orientation: MMOrientation
  positiveDirection: MMPositiveDirection
  gridSpacing: number
  showGrid: boolean
  showAllVelocity: boolean
  showAllAccel: boolean
  showLabels: boolean
  velocityScale: number
  dots: MMDot[]
}
