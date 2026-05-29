import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { type ReactElement } from 'react'
import { heroM5LandscapeLayout, type HeroM5LandscapeLayout } from './homeHeroDiagramUtils'

const COLOR_MUTED = 'var(--color-muted)'
const COLOR_BORDER = 'var(--color-border)'
const COLOR_PRIMARY = 'var(--color-primary)'
const COLOR_BG = 'var(--color-bg)'
const COLOR_SURFACE = 'var(--color-surface)'

const Root = styled(Box)({
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  padding: '28px 20px 24px',
})

const Stage = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  flexWrap: 'wrap',
})

const Block = styled(Box)({
  flex: '1 1 220px',
  maxWidth: '360px',
  textAlign: 'center',
})

const ResultBlock = styled(Block)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
})

const Caption = styled('p')({
  color: 'var(--color-text-h)',
  fontWeight: 600,
  fontSize: '0.9rem',
  lineHeight: 1.5,
  marginTop: 0,
  marginBottom: '12px',
})

const CutCaption = styled(Caption)({
  marginBottom: '8px',
})

const SheetWrap = styled(Box)({
  backgroundColor: 'var(--color-bg)',
  borderRadius: '8px',
  padding: '10px',
  width: '100%',
})

const Note = styled('p')({
  color: 'var(--color-muted)',
  fontSize: '0.8rem',
  marginTop: '10px',
  lineHeight: 1.5,
  marginBottom: 0,
})

const ArrowWrap = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 auto',
})

const FlowNote = styled('p')({
  textAlign: 'center',
  color: 'var(--color-muted)',
  marginTop: '24px',
  fontSize: '0.9rem',
  lineHeight: 1.6,
  marginBottom: 0,
})

const A4Svg = styled('svg')({
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  height: 'auto',
  minHeight: '140px',
  maxHeight: '220px',
})

const CutSvg = styled('svg')({
  display: 'block',
  width: '100%',
  maxWidth: '140px',
  height: 'auto',
  minHeight: '120px',
  margin: '0 auto',
})

const ArrowSvg = styled('svg')({
  flexShrink: 0,
  width: '36px',
  height: '28px',
})

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
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={COLOR_SURFACE}
        stroke={COLOR_BORDER}
        strokeWidth="0.35"
      />
      <rect
        x={x}
        y={y}
        width={holeZoneMm}
        height={h}
        fill={COLOR_BG}
        stroke={COLOR_BORDER}
        strokeWidth="0.25"
      />
      {holePosY.map((posY, i) => (
        <circle
          key={i}
          cx={x + holeZoneMm / 2}
          cy={y + posY}
          r="1.15"
          fill="none"
          stroke={COLOR_BORDER}
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
        stroke={COLOR_PRIMARY}
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
        stroke={COLOR_PRIMARY}
        strokeWidth="0.5"
        strokeDasharray="3 2.5"
        opacity="0.85"
      />,
    )
  }

  return (
    <A4Svg viewBox={`0 0 ${paperW} ${paperH}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <rect width={paperW} height={paperH} fill={COLOR_BG} rx="1.5" />
      <rect
        width={paperW}
        height={paperH}
        fill="none"
        stroke={COLOR_BORDER}
        strokeWidth="0.6"
        rx="1.5"
      />
      {cells}
      {cutLines}
    </A4Svg>
  )
}

function CutRefillSvg({ layout }: LayoutSvgProps): ReactElement {
  const { refillW, refillH, holePosY, holeZoneMm } = layout
  const pad = 14
  const vbW = refillW + pad * 2
  const vbH = refillH + pad * 2 + 18

  return (
    <CutSvg viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <ellipse
        cx={vbW / 2}
        cy={vbH / 2 - 4}
        rx={vbW * 0.52}
        ry={vbH * 0.48}
        fill={COLOR_BG}
        opacity="0.9"
      />
      <g transform={`translate(${pad}, ${pad})`}>
        <RefillCell x={0} y={0} w={refillW} h={refillH} holePosY={holePosY} holeZoneMm={holeZoneMm} />
      </g>
      <text
        x={pad + refillW / 2}
        y={pad + refillH + 26}
        textAnchor="middle"
        fontSize="7"
        fill={COLOR_MUTED}
        fontFamily="var(--font-body)"
      >
        {refillW} mm
      </text>
      <text
        x={8}
        y={pad + refillH / 2}
        textAnchor="middle"
        fontSize="7"
        fill={COLOR_MUTED}
        fontFamily="var(--font-body)"
        transform={`rotate(-90, 8, ${pad + refillH / 2})`}
      >
        {refillH} mm
      </text>
      <line
        x1={pad}
        y1={pad + refillH + 10}
        x2={pad + refillW}
        y2={pad + refillH + 10}
        stroke={COLOR_PRIMARY}
        strokeWidth="0.45"
      />
      <line
        x1={pad - 6}
        y1={pad}
        x2={pad - 6}
        y2={pad + refillH}
        stroke={COLOR_PRIMARY}
        strokeWidth="0.45"
      />
    </CutSvg>
  )
}

function FlowArrow(): ReactElement {
  return (
    <ArrowSvg viewBox="0 0 36 28" aria-hidden>
      <path
        d="M4 14h22m0 0l-7-7m7 7l-7 7"
        fill="none"
        stroke={COLOR_PRIMARY}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </ArrowSvg>
  )
}

/**
 * A4印刷 → 切り取り → 完成サイズ（M5・4×2・穴数は設定どおり）
 */
export default function HomeHeroProcessDiagram(): ReactElement {
  const layout = heroM5LandscapeLayout()

  return (
    <Root aria-label="A4に印刷して切り取るとリフィル1枚分のサイズになる図解">
      <Stage>
        <Block>
          <Caption>A4に印刷されるイメージ</Caption>
          <SheetWrap>
            <A4SheetSvg layout={layout} />
          </SheetWrap>
          <Note>
            例：M5・A4横・{layout.total}枚（{layout.cols}×{layout.rows}）
          </Note>
        </Block>
        <ArrowWrap>
          <FlowArrow />
        </ArrowWrap>
        <ResultBlock>
          <CutCaption>
            切り取ると
            <br />
            このサイズになります
          </CutCaption>
          <CutRefillSvg layout={layout} />
        </ResultBlock>
      </Stage>
      <FlowNote>どのサイズでもこの流れです</FlowNote>
    </Root>
  )
}
