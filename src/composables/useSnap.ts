export function snapToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment
}

// Snaps an object's center so that its bottom-left corner lands on a grid line.
// Used for the incline, whose axis-aligned edges are the bottom and left sides.
export function snapInclineCenter(
  cx: number, cy: number,
  width: number, height: number,
  gridSpacing: number,
): { x: number; y: number } {
  const hw = width / 2
  const hh = height / 2
  return {
    x: snapToIncrement(cx - hw, gridSpacing) + hw,
    y: snapToIncrement(cy + hh, gridSpacing) - hh,
  }
}
