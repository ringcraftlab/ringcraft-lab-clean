import { A4, type PaperOrientation } from '../config/sizes'

/** 折り帯の左端・通常リフィルのリング穴列（mm） */
export const FOLD_HOLE_ZONE_MM = 6.5

/** 折り目ガイドの上下チックの長さ（mm） */
export const FOLD_GUIDE_TICK_MM = 2

export function isFoldLayoutMode(layoutMode: string) {
  return layoutMode === 'fold3' || layoutMode === 'fold4'
}

export function foldCountFromMode(layoutMode: string) {
  if (layoutMode === 'fold4') return 4
  if (layoutMode === 'fold3') return 3
  return 0
}

/** portrait | landscape | fold* はいずれも印刷用の向き */
export function paperOrientationForLayout(layoutMode: string): PaperOrientation {
  return layoutMode === 'portrait' ? 'portrait' : 'landscape'
}

/**
 * A4横に載せる折り帯レイアウト（面ごと画像・左穴1列）
 */
export function calcFoldLayout(refillW: number, refillH: number, foldCount: 3 | 4) {
  const paperW = A4.landscape.w
  const paperH = A4.landscape.h
  const holeZoneMm = FOLD_HOLE_ZONE_MM
  const panelW = Math.max(refillW - holeZoneMm, 0)
  const stripW = holeZoneMm + panelW * foldCount
  const bookCount = Math.max(Math.floor(paperH / refillH), 0)
  const supported = panelW > 0 && stripW <= paperW && bookCount > 0
  const total = supported ? foldCount * bookCount : 0
  const marginX = supported ? (paperW - stripW) / 2 : 0
  const marginY = supported ? (paperH - bookCount * refillH) / 2 : 0

  return {
    kind: 'fold' as const,
    foldCount,
    bookCount,
    panelW,
    stripW,
    holeZoneMm,
    cols: foldCount,
    rows: bookCount,
    total,
    marginX,
    marginY,
    supported,
  }
}

// A4に何枚入るか自動計算
export function calcLayout(refillW: number, refillH: number, orientation: PaperOrientation) {
  const paper = A4[orientation]
  const cols = Math.floor(paper.w / refillW)
  const rows = Math.floor(paper.h / refillH)
  const total = cols * rows

  // 余白（センタリング）
  const marginX = (paper.w - cols * refillW) / 2
  const marginY = (paper.h - rows * refillH) / 2

  return { cols, rows, total, marginX, marginY }
}

// 縦横どちらが多く入るか自動選択
export function bestOrientation(refillW: number, refillH: number): PaperOrientation {
  const portrait = calcLayout(refillW, refillH, 'portrait')
  const landscape = calcLayout(refillW, refillH, 'landscape')
  return portrait.total >= landscape.total ? 'portrait' : 'landscape'
}

// mm → px変換（96dpi基準）
export const MM_TO_PX = 3.7795
export const mmToPx = (mm: number) => mm * MM_TO_PX

/** 画面レイアウトの CSS px 基準 DPI */
export const LAYOUT_SCREEN_DPI = 96
/** 印刷・PDF キャプチャの目標 DPI（プレビュー表示は 96dpi のまま） */
export const PRINT_CAPTURE_DPI = 300

export function printCaptureScale() {
  return PRINT_CAPTURE_DPI / LAYOUT_SCREEN_DPI
}
