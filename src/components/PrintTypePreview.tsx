import type { CSSProperties, ReactElement } from 'react'
import {
  buildPrintTypePreviewLayout,
  type PrintTypePreviewLayout,
  type PrintTypePreviewLayoutParams,
} from '../utils/printTypePreviewLayout'

/** リフィル枠・A4レイアウト線（サムネでも視認できる濃さ） */
const BORDER = '#9a7d62'
const BORDER_EMPH = '#5c4838'
const HOLE = '#8f7d6c'
const HOLE_EMPH = '#6d5e50'
const PAPER_OUTLINE = '#b5a08c'
const PAPER_OUTLINE_EMPH = '#6d5644'
/** 背景印刷プレビュー：ベージュ紙＋薄グレーのチェック／斜線で「全面背景」を表現 */
const BG_PAPER = '#f3ebe0'
const BG_PAPER_EMPH = '#efe6dc'
const BG_CHECK_A = '#ece7df'
const BG_CHECK_B = '#ddd8d0'
const BG_HATCH = '#c8c4bc'
const BG_GRID_LINE = '#ddd6cb'
const BG_GRID_LINE_EMPH = '#cfc6b8'
const BG_GUIDE_LINE = '#c4b5a0'
const BG_GUIDE_LINE_EMPH = '#b5a692'

export type PrintTypePreviewVariant = 'frame' | 'background' | 'images'

export interface PrintTypePreviewProps {
  variant: PrintTypePreviewVariant
  layoutParams: PrintTypePreviewLayoutParams
  compact?: boolean
  emphasized?: boolean
}

interface BackgroundTextureDefsProps {
  idPrefix: string
  emphasized: boolean
}

interface FoldGuideLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface BackgroundPaperFillProps {
  idPrefix: string
  paperW: number
  paperH: number
  emphasized: boolean
  foldGuide?: FoldGuideLine
}

interface PhotoPlaceholderProps {
  x: number
  y: number
  w: number
  h: number
  emphasized: boolean
}

interface SheetCellProps {
  x: number
  y: number
  w: number
  h: number
  holePosY: number[]
  holeZoneMm: number
  variant: PrintTypePreviewVariant
  showImage: boolean
  emphasized: boolean
  showHoleGuide: boolean
  holeSide: 'left' | 'right'
}

type SheetPreviewLayoutWithHoleGuide = Extract<PrintTypePreviewLayout, { kind: 'sheet' }> & {
  showHoleGuide: boolean
  holeSide: 'left' | 'right'
}

type FoldPreviewLayoutWithHoleGuide = Extract<PrintTypePreviewLayout, { kind: 'fold' }> & {
  showHoleGuide: boolean
  holeSide: 'left' | 'right'
}

type PreviewLayoutWithHoleGuide = SheetPreviewLayoutWithHoleGuide | FoldPreviewLayoutWithHoleGuide

interface SheetPreviewSvgProps {
  layout: SheetPreviewLayoutWithHoleGuide
  variant: PrintTypePreviewVariant
  emphasized: boolean
}

interface FoldPreviewSvgProps {
  layout: FoldPreviewLayoutWithHoleGuide
  variant: PrintTypePreviewVariant
  emphasized: boolean
}

function BackgroundTextureDefs({ idPrefix, emphasized }: BackgroundTextureDefsProps) {
  const checkId = `${idPrefix}-check`
  const hatchId = `${idPrefix}-hatch`
  const gridId = `${idPrefix}-grid`
  const checkStep = emphasized ? 2.6 : 2.3
  const hatchStep = emphasized ? 3.2 : 2.8
  const gridStep = 5

  return (
    <defs>
      <pattern id={checkId} width={checkStep} height={checkStep} patternUnits="userSpaceOnUse">
        <rect width={checkStep / 2} height={checkStep / 2} fill={BG_CHECK_A} />
        <rect x={checkStep / 2} y={0} width={checkStep / 2} height={checkStep / 2} fill={BG_CHECK_B} />
        <rect x={0} y={checkStep / 2} width={checkStep / 2} height={checkStep / 2} fill={BG_CHECK_B} />
        <rect x={checkStep / 2} y={checkStep / 2} width={checkStep / 2} height={checkStep / 2} fill={BG_CHECK_A} />
      </pattern>
      <pattern
        id={hatchId}
        width={hatchStep}
        height={hatchStep}
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={hatchStep}
          stroke={BG_HATCH}
          strokeWidth={emphasized ? '0.28' : '0.22'}
          opacity="0.55"
        />
      </pattern>
      <pattern id={gridId} width={gridStep} height={gridStep} patternUnits="userSpaceOnUse">
        <path
          d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
          fill="none"
          stroke={emphasized ? BG_GRID_LINE_EMPH : BG_GRID_LINE}
          strokeWidth={emphasized ? '0.28' : '0.2'}
        />
      </pattern>
    </defs>
  )
}

function BackgroundPaperFill({ idPrefix, paperW, paperH, emphasized, foldGuide }: BackgroundPaperFillProps) {
  const checkId = `${idPrefix}-check`
  const hatchId = `${idPrefix}-hatch`
  const gridId = `${idPrefix}-grid`

  return (
    <>
      <BackgroundTextureDefs idPrefix={idPrefix} emphasized={emphasized} />
      <rect width={paperW} height={paperH} fill={emphasized ? BG_PAPER_EMPH : BG_PAPER} />
      <rect width={paperW} height={paperH} fill={`url(#${checkId})`} opacity={emphasized ? '0.72' : '0.65'} />
      <rect width={paperW} height={paperH} fill={`url(#${hatchId})`} opacity={emphasized ? '0.38' : '0.32'} />
      <rect width={paperW} height={paperH} fill={`url(#${gridId})`} opacity={emphasized ? '0.45' : '0.38'} />
      {foldGuide ? (
        <line
          x1={foldGuide.x1}
          y1={foldGuide.y1}
          x2={foldGuide.x2}
          y2={foldGuide.y2}
          stroke={emphasized ? BG_GUIDE_LINE_EMPH : BG_GUIDE_LINE}
          strokeWidth={emphasized ? '0.3' : '0.22'}
          strokeDasharray="1.2 1.8"
          opacity="0.75"
        />
      ) : null}
    </>
  )
}

function PhotoPlaceholder({ x, y, w, h, emphasized }: PhotoPlaceholderProps) {
  const pad = emphasized ? 1.2 : 1
  const ix = x + pad
  const iy = y + pad
  const iw = w - pad * 2
  const ih = h - pad * 2
  return (
    <g>
      <rect x={ix} y={iy} width={iw} height={ih} fill={emphasized ? '#e5d0b8' : '#ebe0d0'} rx="0.6" />
      <circle
        cx={ix + iw * 0.32}
        cy={iy + ih * 0.34}
        r={Math.min(iw, ih) * (emphasized ? 0.14 : 0.1)}
        fill={emphasized ? '#fff8ef' : '#f5f0e8'}
        opacity="0.95"
      />
      <path
        d={`M ${ix} ${iy + ih} L ${ix + iw * 0.38} ${iy + ih * 0.58} L ${ix + iw * 0.62} ${iy + ih * 0.72} L ${ix + iw} ${iy + ih * 0.42} L ${ix + iw} ${iy + ih} Z`}
        fill={emphasized ? '#c4a078' : '#d4bc9c'}
        opacity={emphasized ? 0.55 : 0.4}
      />
    </g>
  )
}

function sheetBorderStroke(_variant: PrintTypePreviewVariant, emphasized: boolean) {
  return emphasized ? BORDER_EMPH : BORDER
}

function SheetCell({
  x,
  y,
  w,
  h,
  holePosY,
  holeZoneMm,
  variant,
  showImage,
  emphasized,
  showHoleGuide,
  holeSide,
}: SheetCellProps) {
  const isBackground = variant === 'background'
  const border = sheetBorderStroke(variant, emphasized)
  const holeStroke = emphasized ? HOLE_EMPH : HOLE
  const sw = emphasized ? 0.52 : 0.4
  const holeCx = holeSide === 'right' ? x + w - holeZoneMm / 2 : x + holeZoneMm / 2
  const contentX = holeSide === 'right' ? x + 0.5 : x + holeZoneMm + 0.5
  const contentW = w - holeZoneMm - 1

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={border} strokeWidth={sw} />
      {showHoleGuide
        ? holePosY.map((posY, i) => (
            <circle
              key={i}
              cx={holeCx}
              cy={y + posY}
              r={emphasized ? 1 : 0.85}
              fill="none"
              stroke={holeStroke}
              strokeWidth={emphasized ? 0.5 : 0.4}
            />
          ))
        : null}
      {!isBackground && showImage ? (
        <PhotoPlaceholder
          x={contentX}
          y={y + 1.5}
          w={contentW}
          h={h - 3}
          emphasized={emphasized}
        />
      ) : null}
    </g>
  )
}

function SheetPreviewSvg({ layout, variant, emphasized }: SheetPreviewSvgProps) {
  const {
    paperW,
    paperH,
    refillW,
    refillH,
    cols,
    rows,
    marginX,
    marginY,
    holePosY,
    holeZoneMm,
    showHoleGuide,
    holeSide,
  } = layout
  const bgPatternId = `print-type-bg-${layout.kind}-${cols}x${rows}`
  const cells: ReactElement[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = marginX + col * refillW
      const y = marginY + row * refillH
      const showImage =
        variant === 'images' &&
        ((row === 0 && col === 0) ||
          (row === 0 && col === 1) ||
          (row === 1 && col === 2) ||
          (row === 1 && col === 3))
      cells.push(
        <SheetCell
          key={`${row}-${col}`}
          x={x}
          y={y}
          w={refillW}
          h={refillH}
          holePosY={holePosY}
          holeZoneMm={holeZoneMm}
          variant={variant}
          showImage={showImage}
          emphasized={emphasized}
          showHoleGuide={showHoleGuide}
          holeSide={holeSide}
        />,
      )
    }
  }

  return (
    <svg viewBox={`0 0 ${paperW} ${paperH}`} width="100%" height="auto" aria-hidden>
      {variant === 'background' ? (
        <>
          <BackgroundPaperFill
            idPrefix={bgPatternId}
            paperW={paperW}
            paperH={paperH}
            emphasized={emphasized}
            foldGuide={{
              x1: marginX,
              y1: marginY + (refillH * rows) / 2,
              x2: marginX + cols * refillW,
              y2: marginY + (refillH * rows) / 2,
            }}
          />
          <rect
            width={paperW}
            height={paperH}
            fill="none"
            stroke={emphasized ? PAPER_OUTLINE_EMPH : PAPER_OUTLINE}
            strokeWidth={emphasized ? 0.35 : 0.28}
          />
        </>
      ) : (
        <rect
          width={paperW}
          height={paperH}
          fill="#faf8f5"
          stroke={emphasized ? PAPER_OUTLINE_EMPH : PAPER_OUTLINE}
          strokeWidth={emphasized ? 0.35 : 0.28}
        />
      )}
      {cells}
      {variant === 'background'
        ? Array.from({ length: rows * cols }, (_, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const x = marginX + col * refillW
            const y = marginY + row * refillH
            return (
              <rect
                key={`frame-${i}`}
                x={x}
                y={y}
                width={refillW}
                height={refillH}
                fill="none"
                stroke={sheetBorderStroke('background', emphasized)}
                strokeWidth={emphasized ? 0.5 : 0.42}
              />
            )
          })
        : null}
    </svg>
  )
}

function FoldPreviewSvg({ layout, variant, emphasized }: FoldPreviewSvgProps) {
  const { paperW, paperH, refillH, holePosY, holeZoneMm, fold, showHoleGuide, holeSide } = layout
  const { marginX, marginY, bookCount, foldCount, panelW } = fold
  const strips: ReactElement[] = []

  for (let row = 0; row < bookCount; row += 1) {
    const y = marginY + row * refillH
    const stripX = marginX
    const stripWidth = holeZoneMm + panelW * foldCount
    const holeZoneX =
      holeSide === 'right' ? stripX + panelW * foldCount : stripX
    const holeCx =
      holeSide === 'right'
        ? stripX + panelW * foldCount + holeZoneMm / 2
        : stripX + holeZoneMm / 2
    const panelBaseX = holeSide === 'right' ? stripX : stripX + holeZoneMm

    strips.push(
      <g key={`row-${row}`}>
        <rect
          x={stripX}
          y={y}
          width={stripWidth}
          height={refillH}
          fill={variant === 'background' ? 'none' : '#fff'}
          stroke={sheetBorderStroke(variant, emphasized)}
          strokeWidth={emphasized ? 0.5 : 0.38}
        />
        {variant !== 'background' ? (
          <rect
            x={holeZoneX}
            y={y}
            width={holeZoneMm}
            height={refillH}
            fill="#faf8f5"
            stroke={sheetBorderStroke(variant, emphasized)}
            strokeWidth={emphasized ? 0.36 : 0.28}
          />
        ) : null}
        {variant !== 'background' && showHoleGuide
          ? holePosY.map((posY, i) => (
              <circle
                key={i}
                cx={holeCx}
                cy={y + posY}
                r={emphasized ? 1 : 0.85}
                fill="none"
                stroke={emphasized ? HOLE_EMPH : HOLE}
                strokeWidth={emphasized ? 0.5 : 0.4}
              />
            ))
          : null}
        {Array.from({ length: foldCount }, (_, col) => {
          const x = panelBaseX + col * panelW
          const showImage = variant === 'images' && row === 0 && col === 1
          return (
            <g key={`panel-${row}-${col}`}>
              {col > 0 ? (
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={y + refillH}
                  stroke={sheetBorderStroke(variant, emphasized)}
                  strokeWidth={emphasized ? 0.4 : 0.3}
                  strokeDasharray="1.5 1.5"
                />
              ) : null}
              {showImage ? (
                <PhotoPlaceholder
                  x={x + 0.5}
                  y={y + 1.5}
                  w={panelW - 1}
                  h={refillH - 3}
                  emphasized={emphasized}
                />
              ) : null}
            </g>
          )
        })}
      </g>,
    )
  }

  const bgPatternId = `print-type-fold-bg-${bookCount}x${foldCount}`

  return (
    <svg viewBox={`0 0 ${paperW} ${paperH}`} width="100%" height="auto" aria-hidden>
      {variant === 'background' ? (
        <>
          <BackgroundPaperFill
            idPrefix={bgPatternId}
            paperW={paperW}
            paperH={paperH}
            emphasized={emphasized}
          />
          <rect
            width={paperW}
            height={paperH}
            fill="none"
            stroke={emphasized ? PAPER_OUTLINE_EMPH : PAPER_OUTLINE}
            strokeWidth={emphasized ? 0.35 : 0.28}
          />
        </>
      ) : (
        <rect
          width={paperW}
          height={paperH}
          fill="#faf8f5"
          stroke={emphasized ? PAPER_OUTLINE_EMPH : PAPER_OUTLINE}
          strokeWidth={emphasized ? 0.35 : 0.28}
        />
      )}
      {strips}
    </svg>
  )
}

const compactFallbackStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: '#827567',
  textAlign: 'center',
  lineHeight: 1.4,
  padding: 4,
}

/**
 * 印刷タイプのA4プレビュー（Step3）
 * compact 時はカード内サムネ
 */
export default function PrintTypePreview({
  variant,
  layoutParams,
  compact = false,
  emphasized = false,
}: PrintTypePreviewProps) {
  const vivid = emphasized || compact
  const baseLayout = buildPrintTypePreviewLayout(layoutParams)
  if (!baseLayout) {
    return compact ? (
      <span style={compactFallbackStyle}>—</span>
    ) : (
      <p style={{ ...compactFallbackStyle, fontSize: 13, padding: 8 }}>
        このサイズ・レイアウトではプレビューを表示できません。
      </p>
    )
  }

  const layout: PreviewLayoutWithHoleGuide = {
    ...baseLayout,
    showHoleGuide: layoutParams.showHoleGuide ?? true,
    holeSide: layoutParams.holeSide ?? 'left',
  }

  const svg =
    layout.kind === 'fold' ? (
      <FoldPreviewSvg layout={layout} variant={variant} emphasized={vivid} />
    ) : (
      <SheetPreviewSvg layout={layout} variant={variant} emphasized={vivid} />
    )

  if (compact) {
    return <div style={{ width: '100%', lineHeight: 0 }}>{svg}</div>
  }

  return svg
}
