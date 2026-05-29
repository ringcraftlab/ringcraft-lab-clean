import { type ReactElement } from 'react'
import { heroM5LandscapeLayout, type HeroM5LandscapeLayout } from './homeHeroDiagramUtils'

const MUTED = '#9c7d5e'
const BORDER = '#c9b8a4'
const BORDER_STRONG = '#a07850'
const HOLE = '#c8bfb3'
const PAPER = '#faf8f5'
const CELL_BG = '#fff'
const HOLE_ZONE_BG = '#faf8f5'

interface RefillCellProps {
  x: number
  y: number
  w: number
  h: number
  holePosY: number[]
  holeZoneMm: number
}

function RefillCell({ x, y, w, h, holePosY, holeZoneMm }: RefillCellProps): ReactElement {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={CELL_BG} stroke={BORDER} strokeWidth="0.35" />
      <rect
        x={x}
        y={y}
        width={holeZoneMm}
        height={h}
        fill={HOLE_ZONE_BG}
        stroke={BORDER}
        strokeWidth="0.25"
      />
      {holePosY.map((posY, i) => (
        <circle
          key={i}
          cx={x + holeZoneMm / 2}
          cy={y + posY}
          r="1.15"
          fill="none"
          stroke={HOLE}
          strokeWidth="0.45"
        />
      ))}
    </g>
  )
}

interface LayoutSvgProps {
  layout: HeroM5LandscapeLayout
}

function A4SheetSvg({ layout }: LayoutSvgProps): ReactElement {
  const { paperW, paperH, refillW, refillH, cols, rows, marginX, marginY, holePosY, holeZoneMm } =
    layout
  const cells: ReactElement[] = []
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push(
        <RefillCell
          key={`${row}-${col}`}
          x={marginX + col * refillW}
          y={marginY + row * refillH}
          w={refillW}
          h={refillH}
          holePosY={holePosY}
          holeZoneMm={holeZoneMm}
        />,
      )
    }
  }

  const cutLines: ReactElement[] = []
  for (let c = 1; c < cols; c += 1) {
    const x = marginX + c * refillW
    cutLines.push(
      <line
        key={`v-${c}`}
        x1={x}
        y1={marginY}
        x2={x}
        y2={marginY + rows * refillH}
        stroke={BORDER_STRONG}
        strokeWidth="0.5"
        strokeDasharray="3 2.5"
        opacity="0.85"
      />,
    )
  }
  for (let r = 1; r < rows; r += 1) {
    const y = marginY + r * refillH
    cutLines.push(
      <line
        key={`h-${r}`}
        x1={marginX}
        y1={y}
        x2={marginX + cols * refillW}
        y2={y}
        stroke={BORDER_STRONG}
        strokeWidth="0.5"
        strokeDasharray="3 2.5"
        opacity="0.85"
      />,
    )
  }

  return (
    <svg
      viewBox={`0 0 ${paperW} ${paperH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="home-hero-process__a4-svg"
    >
      <rect width={paperW} height={paperH} fill={PAPER} rx="1.5" />
      <rect
        width={paperW}
        height={paperH}
        fill="none"
        stroke={BORDER}
        strokeWidth="0.6"
        rx="1.5"
      />
      {cells}
      {cutLines}
    </svg>
  )
}

function CutRefillSvg({ layout }: LayoutSvgProps): ReactElement {
  const { refillW, refillH, holePosY, holeZoneMm } = layout
  const pad = 14
  const vbW = refillW + pad * 2
  const vbH = refillH + pad * 2 + 18

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className="home-hero-process__cut-svg"
    >
      <ellipse cx={vbW / 2} cy={vbH / 2 - 4} rx={vbW * 0.52} ry={vbH * 0.48} fill="#f5ede0" opacity="0.9" />
      <g transform={`translate(${pad}, ${pad})`}>
        <RefillCell x={0} y={0} w={refillW} h={refillH} holePosY={holePosY} holeZoneMm={holeZoneMm} />
      </g>
      <text
        x={pad + refillW / 2}
        y={pad + refillH + 26}
        textAnchor="middle"
        fontSize="7"
        fill={MUTED}
        fontFamily="system-ui, sans-serif"
      >
        {refillW} mm
      </text>
      <text
        x={8}
        y={pad + refillH / 2}
        textAnchor="middle"
        fontSize="7"
        fill={MUTED}
        fontFamily="system-ui, sans-serif"
        transform={`rotate(-90, 8, ${pad + refillH / 2})`}
      >
        {refillH} mm
      </text>
      <line
        x1={pad}
        y1={pad + refillH + 10}
        x2={pad + refillW}
        y2={pad + refillH + 10}
        stroke={BORDER_STRONG}
        strokeWidth="0.45"
      />
      <line
        x1={pad - 6}
        y1={pad}
        x2={pad - 6}
        y2={pad + refillH}
        stroke={BORDER_STRONG}
        strokeWidth="0.45"
      />
    </svg>
  )
}

function FlowArrow(): ReactElement {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M4 14h22m0 0l-7-7m7 7l-7 7"
        fill="none"
        stroke={BORDER_STRONG}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * A4印刷 → 切り取り → 完成サイズ（M5・4×2・穴数は設定どおり）
 */
export default function HomeHeroProcessDiagram(): ReactElement {
  const layout = heroM5LandscapeLayout()

  return (
    <div className="home-hero-process" aria-label="A4に印刷して切り取るとリフィル1枚分のサイズになる図解">
      <div className="home-hero-process__stage">
        <div className="home-hero-process__block">
          <p className="home-hero-process__caption">A4に印刷されるイメージ</p>
          <div className="home-hero-process__sheet-wrap">
            <A4SheetSvg layout={layout} />
          </div>
          <p className="home-hero-process__note">例：M5・A4横・{layout.total}枚（{layout.cols}×{layout.rows}）</p>
        </div>
        <div className="home-hero-process__arrow-wrap">
          <FlowArrow />
        </div>
        <div className="home-hero-process__block home-hero-process__block--result">
          <p className="home-hero-process__caption home-hero-process__caption--cut">
            切り取ると
            <br />
            このサイズになります
          </p>
          <CutRefillSvg layout={layout} />
        </div>
      </div>
      <p className="home-hero-process__flow-note">どのサイズでもこの流れです</p>
    </div>
  )
}
