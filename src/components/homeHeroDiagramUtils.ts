import { SIZES, getHolePositions } from '../config/sizes'
import { calcLayout } from '../utils/layout'

/** シート配置と同じ穴列幅（mm） */
export const SHEET_HOLE_ZONE_MM = 6.5

const M5 = SIZES.find((s) => s.id === 'microfive')

export interface HeroM5LandscapeLayout {
  paperW: number
  paperH: number
  refillW: number
  refillH: number
  holePosY: number[]
  holeZoneMm: number
  cols: number
  rows: number
  total: number
  marginX: number
  marginY: number
}

/** ヒーロー図解用：M5・A4横・4×2（アプリのデフォルトに合わせる） */
export function heroM5LandscapeLayout(): HeroM5LandscapeLayout {
  const w = M5!.w as number
  const h = M5!.h as number
  const layout = calcLayout(w, h, 'landscape')
  const holePosY = getHolePositions(M5!)
  return {
    paperW: 297,
    paperH: 210,
    refillW: w,
    refillH: h,
    holePosY,
    holeZoneMm: SHEET_HOLE_ZONE_MM,
    ...layout,
  }
}
