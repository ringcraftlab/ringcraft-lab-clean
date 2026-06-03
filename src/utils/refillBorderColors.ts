/** リフィル枠線の色プリセット（Step4 プレビュー・印刷キャプチャ共通） */
export const REFILL_BORDER_COLOR_PRESETS = [
  { id: 'greige', label: 'グレージュ', hex: '#b0a89e' },
  { id: 'pink', label: 'ピンク', hex: '#e8a0a0' },
  { id: 'light-pink', label: '薄ピンク', hex: '#f0c0c0' },
  { id: 'green', label: 'グリーン', hex: '#8fbfb0' },
  { id: 'navy', label: 'ネイビー', hex: '#6080a8' },
  { id: 'purple', label: 'パープル', hex: '#9080b0' },
  { id: 'black', label: 'ブラック', hex: '#000000' },
] as const

export const DEFAULT_REFILL_BORDER_COLOR = '#000000'

const TRANSPARENT_EDGE = '0.5px solid transparent'

export type RefillSheetCellGrid = {
  col: number
  row: number
  cols: number
  rows: number
}

/** 隣接セルで枠線が二重にならないよう、右・下＋外周のみ描画 */
export function refillSheetCellBorders(
  showBorder: boolean,
  borderColor: string = DEFAULT_REFILL_BORDER_COLOR,
  { col, row }: RefillSheetCellGrid,
): {
  borderTop: string
  borderRight: string
  borderBottom: string
  borderLeft: string
} {
  if (!showBorder) {
    return {
      borderTop: TRANSPARENT_EDGE,
      borderRight: TRANSPARENT_EDGE,
      borderBottom: TRANSPARENT_EDGE,
      borderLeft: TRANSPARENT_EDGE,
    }
  }
  const line = `0.5px solid ${borderColor}`
  return {
    borderTop: row === 0 ? line : 'none',
    borderLeft: col === 0 ? line : 'none',
    borderRight: line,
    borderBottom: line,
  }
}
