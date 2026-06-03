import type { HoleSide } from '../components/step4/Step4SettingsBlock'

export function resolveSlotHoleSide(
  slotIndex: number,
  holeSlotSides: Record<number, HoleSide>,
  defaultSide: HoleSide = 'left',
): HoleSide {
  return holeSlotSides[slotIndex] ?? defaultSide
}

export function buildAllSlotHoleSides(total: number, side: HoleSide): Record<number, HoleSide> {
  const next: Record<number, HoleSide> = {}
  for (let i = 0; i < total; i += 1) {
    next[i] = side
  }
  return next
}
