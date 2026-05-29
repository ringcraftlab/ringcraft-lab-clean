import { A4, SIZES, getHolePositions, type SizeDefinition } from '../config/sizes'
import {
  calcFoldLayout,
  calcLayout,
  foldCountFromMode,
  FOLD_HOLE_ZONE_MM,
  isFoldLayoutMode,
  paperOrientationForLayout,
} from './layout'

export interface PrintTypePreviewLayoutParams {
  refillW?: number
  refillH?: number
  layoutMode?: string
  sizeId?: string
  customHoleStandard?: string
  showHoleGuide?: boolean
  holeSide?: 'left' | 'right'
}

type FoldPreviewLayout = {
  kind: 'fold'
  paperW: number
  paperH: number
  refillW: number
  refillH: number
  holePosY: number[]
  holeZoneMm: number
  fold: ReturnType<typeof calcFoldLayout>
}

type SheetPreviewLayout = {
  kind: 'sheet'
  paperW: number
  paperH: number
  refillW: number
  refillH: number
  holePosY: number[]
  holeZoneMm: number
} & ReturnType<typeof calcLayout>

export type PrintTypePreviewLayout = FoldPreviewLayout | SheetPreviewLayout

/** Step3 プレビュー用：選択サイズ・レイアウトに合わせたA4配置 */
export function buildPrintTypePreviewLayout({
  refillW,
  refillH,
  layoutMode,
  sizeId,
  customHoleStandard,
}: PrintTypePreviewLayoutParams): PrintTypePreviewLayout | null {
  if (!refillW || !refillH || !layoutMode) return null

  const sizePreset: SizeDefinition | undefined =
    sizeId === 'custom'
      ? ({ id: 'custom' } as SizeDefinition)
      : SIZES.find((s) => s.id === sizeId)
  const holePosY = getHolePositions(sizePreset, customHoleStandard)

  if (isFoldLayoutMode(layoutMode)) {
    const foldCount = foldCountFromMode(layoutMode) as 3 | 4
    const fold = calcFoldLayout(refillW, refillH, foldCount)
    if (!fold.supported) return null
    return {
      kind: 'fold',
      paperW: A4.landscape.w,
      paperH: A4.landscape.h,
      refillW,
      refillH,
      holePosY,
      holeZoneMm: fold.holeZoneMm,
      fold,
    }
  }

  const orient = paperOrientationForLayout(layoutMode)
  const paper = A4[orient]
  const grid = calcLayout(refillW, refillH, orient)
  if (grid.total <= 0) return null

  return {
    kind: 'sheet',
    paperW: paper.w,
    paperH: paper.h,
    refillW,
    refillH,
    holePosY,
    holeZoneMm: FOLD_HOLE_ZONE_MM,
    ...grid,
  }
}
