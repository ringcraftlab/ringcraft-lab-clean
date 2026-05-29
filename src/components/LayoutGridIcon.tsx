import { styled } from '@mui/material/styles'
import { type ReactElement } from 'react'
import type { WizardLayoutOption } from '../utils/refillSetupOptions'

/** A4横 / A4縦 の表示サイズ（px） */
const A4_LANDSCAPE_ASPECT = 297 / 210
const A4_PORTRAIT_ASPECT = 210 / 297

/** カード内のアイコン領域（縦向きA4の高さに合わせる） */
export const LAYOUT_ICON_HEIGHT = 72
const LAYOUT_ICON_HEIGHT_COMPACT = 52

/** 外枠は Step1 よりやや太め、グリッド点線は細かく */
const OUTER_STROKE = 1.8
const OUTER_RADIUS = 3.5
const GRID_STROKE = 0.75
const INNER_STROKE = 1
const GRID_DASH = '2 2'
/** 外枠とグリッドの間の余白（添付イメージ相当） */
const GRID_INSET_RATIO = 0.86

const COLOR_PRIMARY = 'var(--color-primary)'
const COLOR_MUTED = 'var(--color-muted)'
const COLOR_SURFACE = 'var(--color-surface)'

const GridSvg = styled('svg')({
  display: 'block',
  flexShrink: 0,
})

export interface LayoutGridIconProps {
  option: WizardLayoutOption
  refillW?: number
  refillH?: number
  active?: boolean
  compact?: boolean
}

/** A4縦：高さ基準で縦長に見せる */
function a4PortraitIconSize(iconHeight: number) {
  return {
    width: Math.round(iconHeight * A4_PORTRAIT_ASPECT),
    height: iconHeight,
  }
}

/** A4横・折り：長辺を幅にして横長・低め（縦向きA4と高さを揃えない） */
function a4LandscapeIconSize(iconHeight: number) {
  const width = iconHeight
  return {
    width,
    height: Math.round(width / A4_LANDSCAPE_ASPECT),
  }
}

function iconPixelSize(option: WizardLayoutOption, iconHeight = LAYOUT_ICON_HEIGHT) {
  if (option.id === 'portrait') {
    return a4PortraitIconSize(iconHeight)
  }
  return a4LandscapeIconSize(iconHeight)
}

function iconGrid(option: WizardLayoutOption) {
  const layout = option.layout
  if (layout?.cols != null && layout?.rows != null) {
    return { cols: layout.cols, rows: layout.rows }
  }
  return {
    cols: Math.max(option.iconCols || 1, 1),
    rows: Math.max(option.iconRows || 1, 1),
  }
}

function lineColor(active: boolean) {
  return active ? COLOR_PRIMARY : COLOR_MUTED
}

/** リフィル比 w:h のマスを収めるグリッド寸法（px） */
function computeGridSize(
  maxW: number,
  maxH: number,
  cols: number,
  rows: number,
  refillW: number,
  refillH: number,
) {
  const aspect = refillW / refillH
  let slotW = maxW / cols
  let slotH = slotW / aspect
  if (slotH * rows > maxH) {
    slotH = maxH / rows
    slotW = slotH * aspect
  }
  return {
    slotW,
    slotH,
    gridW: slotW * cols,
    gridH: slotH * rows,
  }
}

/**
 * Step2 配置示意
 * 外枠＝太い角丸の実線 → 余白 → 点線のグリッド外周 → マス区切り（A4は実線、折りは点線）
 */
export default function LayoutGridIcon({
  option,
  refillW = 62,
  refillH = 105,
  active = false,
  compact = false,
}: LayoutGridIconProps): ReactElement {
  const iconHeight = compact ? LAYOUT_ICON_HEIGHT_COMPACT : LAYOUT_ICON_HEIGHT
  const { cols, rows } = iconGrid(option)
  const { width: paperW, height: paperH } = iconPixelSize(option, iconHeight)
  const isFold = option.kind === 'fold'
  const color = lineColor(active)

  const innerW = paperW - OUTER_STROKE * 2
  const innerH = paperH - OUTER_STROKE * 2
  const { slotW, slotH, gridW, gridH } = computeGridSize(
    innerW * GRID_INSET_RATIO,
    innerH * GRID_INSET_RATIO,
    cols,
    rows,
    refillW,
    refillH,
  )
  const gridX = (paperW - gridW) / 2
  const gridY = (paperH - gridH) / 2

  const dividerStroke = isFold ? GRID_STROKE : INNER_STROKE
  const dividerDash = isFold ? GRID_DASH : undefined

  const innerLines: ReactElement[] = []
  for (let col = 1; col < cols; col += 1) {
    const x = gridX + col * slotW
    innerLines.push(
      <line
        key={`v-${col}`}
        x1={x}
        y1={gridY}
        x2={x}
        y2={gridY + gridH}
        stroke={color}
        strokeWidth={dividerStroke}
        strokeDasharray={dividerDash}
      />,
    )
  }
  for (let row = 1; row < rows; row += 1) {
    const y = gridY + row * slotH
    innerLines.push(
      <line
        key={`h-${row}`}
        x1={gridX}
        y1={y}
        x2={gridX + gridW}
        y2={y}
        stroke={color}
        strokeWidth={dividerStroke}
        strokeDasharray={dividerDash}
      />,
    )
  }

  const outerInset = OUTER_STROKE / 2

  return (
    <GridSvg width={paperW} height={paperH} viewBox={`0 0 ${paperW} ${paperH}`} aria-hidden>
      <rect
        x={outerInset}
        y={outerInset}
        width={paperW - OUTER_STROKE}
        height={paperH - OUTER_STROKE}
        rx={OUTER_RADIUS}
        ry={OUTER_RADIUS}
        fill={COLOR_SURFACE}
        stroke={color}
        strokeWidth={OUTER_STROKE}
      />
      <rect
        x={gridX}
        y={gridY}
        width={gridW}
        height={gridH}
        fill="none"
        stroke={color}
        strokeWidth={GRID_STROKE}
        strokeDasharray={GRID_DASH}
      />
      {innerLines}
    </GridSvg>
  )
}
