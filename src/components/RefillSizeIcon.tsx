import { styled } from '@mui/material/styles'
import { type ReactElement } from 'react'
import { SIZES } from '../config/sizes'

const HOLE_ZONE_MM = 6.5
const HOLE_RADIUS_MM = 2.4

const STROKE_OUTLINE = 1.8
const STROKE_GUIDE = 1.2
const STROKE_HOLE = 1.6

const M5_SQUARE_ICON_SIDE = 64
const M5_SQUARE_ICON_SIDE_COMPACT = 48

const COLOR_PRIMARY = 'var(--color-primary)'
const COLOR_MUTED = 'var(--color-muted)'
const COLOR_SURFACE = 'var(--color-surface)'

/** 表示ピクセル（形の差を強調・M5スクエアは完全正方形） */
const ICON_DISPLAY = {
  microfive: { width: 32, height: 64 },
  m5square: { width: M5_SQUARE_ICON_SIDE, height: M5_SQUARE_ICON_SIDE },
  mini6: { width: 39, height: 66 },
  bible: { width: 44, height: 76 },
} as const

const ICON_DISPLAY_COMPACT = {
  microfive: { width: 24, height: 48 },
  m5square: { width: M5_SQUARE_ICON_SIDE_COMPACT, height: M5_SQUARE_ICON_SIDE_COMPACT },
  mini6: { width: 30, height: 50 },
  bible: { width: 34, height: 58 },
} as const

type RefillSizeIconId = keyof typeof ICON_DISPLAY

const IconSvg = styled('svg')({
  display: 'block',
  flexShrink: 0,
})

export interface RefillSizeIconProps {
  sizeId: RefillSizeIconId
  active?: boolean
  compact?: boolean
}

/**
 * 縦長リフィル＋左列の穴（M5スクエアは完全正方形）
 */
export default function RefillSizeIcon({
  sizeId,
  active = false,
  compact = false,
}: RefillSizeIconProps): ReactElement | null {
  const size = SIZES.find((entry) => entry.id === sizeId)
  const display = (compact ? ICON_DISPLAY_COMPACT : ICON_DISPLAY)[sizeId]
  if (!size?.w || !size?.h || !size.holePosY?.length || !display) return null

  const isSquare = sizeId === 'm5square'
  const squareSide = compact ? M5_SQUARE_ICON_SIDE_COMPACT : M5_SQUARE_ICON_SIDE
  const pixelW = isSquare ? squareSide : display.width
  const pixelH = isSquare ? squareSide : display.height
  const viewW = size.w
  const viewH = size.h
  const stroke = active ? COLOR_PRIMARY : COLOR_MUTED
  const fill = COLOR_SURFACE
  const holeStroke = active ? COLOR_PRIMARY : COLOR_MUTED

  const holeCx = HOLE_ZONE_MM * 0.42

  return (
    <IconSvg
      width={pixelW}
      height={pixelH}
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <rect
        x={0.8}
        y={0.8}
        width={size.w - 1.6}
        height={size.h - 1.6}
        rx={isSquare ? 3.5 : 2.5}
        fill={fill}
        stroke={stroke}
        strokeWidth={STROKE_OUTLINE}
      />
      <line
        x1={HOLE_ZONE_MM}
        y1={1}
        x2={HOLE_ZONE_MM}
        y2={size.h - 1}
        stroke={stroke}
        strokeWidth={STROKE_GUIDE}
        strokeDasharray="2.5 2"
        opacity={0.5}
      />
      {size.holePosY.map((y, i) => (
        <circle
          key={`${y}-${i}`}
          cx={holeCx}
          cy={y}
          r={HOLE_RADIUS_MM}
          fill={fill}
          stroke={holeStroke}
          strokeWidth={STROKE_HOLE}
        />
      ))}
    </IconSvg>
  )
}
