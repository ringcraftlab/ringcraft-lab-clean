import type { ImageAreaMode } from '../components/step4/Step4ImagesSidePanel'
import type { HoleSide } from '../components/step4/Step4SettingsBlock'
import type { PrintTypePreviewLayout } from './printTypePreviewLayout'

export type FoldImageMode = 'panels' | 'panorama'

export type PanoramaStripRectPercent = {
  bookIndex: number
  left: number
  top: number
  width: number
  height: number
}

const HOLE_ZONE_MM = 6.5
const IMAGE_START_MM = 6.7

/** 折り帯1冊分のパノラマ画像領域（用紙に対する%） */
export function buildPanoramaStripRects(
  layout: PrintTypePreviewLayout,
  imageAreaMode: ImageAreaMode,
  holeSide: HoleSide,
): PanoramaStripRectPercent[] {
  if (layout.kind !== 'fold') return []

  const { paperW, paperH, refillH } = layout
  const { marginX, marginY, bookCount, foldCount, panelW, holeZoneMm } = layout.fold
  const avoidsHole = imageAreaMode === 'avoid'
  const stripW = holeZoneMm + panelW * foldCount
  const panoramaW = panelW * foldCount

  return Array.from({ length: bookCount }, (_, bookIndex) => {
    const stripY = marginY + bookIndex * refillH
    let x = marginX
    let w = stripW

    if (avoidsHole) {
      w = panoramaW
      x = holeSide === 'right' ? marginX : marginX + holeZoneMm
    }

    return {
      bookIndex,
      left: (x / paperW) * 100,
      top: (stripY / paperH) * 100,
      width: (w / paperW) * 100,
      height: (refillH / paperH) * 100,
    }
  })
}

export function getFoldPanoramaPreviewMm(
  layout: PrintTypePreviewLayout,
  imageAreaMode: ImageAreaMode,
): { previewW: number; previewH: number } | null {
  if (layout.kind !== 'fold') return null
  const { panelW, foldCount } = layout.fold
  const avoidsHole = imageAreaMode === 'avoid'
  const insetMm = avoidsHole ? Math.max(0, IMAGE_START_MM - HOLE_ZONE_MM) : 0
  return {
    previewW: panelW * foldCount - insetMm,
    previewH: layout.refillH,
  }
}

export type PanoramaFitMode = 'cover' | 'contain' | 'fill'

/** 1冊分のパノラマを全帯へ複製 */
export function copyPanoramaToAllBooks(
  sourceBookIndex: number,
  bookCount: number,
  panoramaImages: Record<number, string>,
  panoramaFitModes: Record<number, PanoramaFitMode>,
  panoramaRotations: Record<number, number>,
): {
  panoramaImages: Record<number, string>
  panoramaFitModes: Record<number, PanoramaFitMode>
  panoramaRotations: Record<number, number>
} | null {
  const sourceImage = panoramaImages[sourceBookIndex]
  if (!sourceImage || bookCount <= 0) return null

  const sourceFit = panoramaFitModes[sourceBookIndex]
  const sourceRotation = panoramaRotations[sourceBookIndex] ?? 0
  const panoramaImagesNext: Record<number, string> = {}
  const panoramaFitModesNext: Record<number, PanoramaFitMode> = {}
  const panoramaRotationsNext: Record<number, number> = {}

  for (let i = 0; i < bookCount; i += 1) {
    panoramaImagesNext[i] = sourceImage
    if (sourceFit) panoramaFitModesNext[i] = sourceFit
    panoramaRotationsNext[i] = sourceRotation
  }

  return {
    panoramaImages: panoramaImagesNext,
    panoramaFitModes: panoramaFitModesNext,
    panoramaRotations: panoramaRotationsNext,
  }
}

export function clearPanoramaState(): {
  panoramaImages: Record<number, string>
  panoramaFitModes: Record<number, 'cover' | 'contain' | 'fill'>
  panoramaRotations: Record<number, number>
} {
  return {
    panoramaImages: {},
    panoramaFitModes: {},
    panoramaRotations: {},
  }
}
