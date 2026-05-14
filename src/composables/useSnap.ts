export function snapToIncrement(value: number, increment: number): number {
  return Math.round(value / increment) * increment
}
