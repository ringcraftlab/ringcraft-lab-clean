import { styled } from '@mui/material/styles'
import type { HoleSide } from './step4/Step4SettingsBlock'
import { FOLD_GUIDE_TICK_MM } from '../utils/layout'
import type { PrintTypePreviewLayout } from '../utils/printTypePreviewLayout'

const Tick = styled('div')({
  position: 'absolute',
  width: 0,
  boxSizing: 'border-box',
  pointerEvents: 'none',
  zIndex: 6,
})

export interface FoldGuideTicksOverlayProps {
  layout: Extract<PrintTypePreviewLayout, { kind: 'fold' }>
  show: boolean
  lineColor: string
  holeSide: HoleSide
}

/**
 * 折り位置の上下に短い破線（HTML・%配置。個別画像プレビュー用）
 */
export default function FoldGuideTicksOverlay({
  layout,
  show,
  lineColor,
  holeSide,
}: FoldGuideTicksOverlayProps) {
  if (!show) return null

  const { paperW, paperH, refillH, fold } = layout
  const { marginX, marginY, bookCount, foldCount, panelW, holeZoneMm } = fold
  if (foldCount < 2) return null

  const tickHmm = FOLD_GUIDE_TICK_MM
  const tickTopPct = (tickHmm / paperH) * 100
  const panelBaseX = holeSide === 'right' ? marginX : marginX + holeZoneMm

  const ticks: { key: string; leftPct: number; topPct: number; heightPct: number }[] = []

  for (let bookIndex = 0; bookIndex < bookCount; bookIndex += 1) {
    const stripTop = marginY + bookIndex * refillH
    const stripTopPct = (stripTop / paperH) * 100
    const stripHeightPct = (refillH / paperH) * 100

    for (let fi = 0; fi < foldCount - 1; fi += 1) {
      const creaseX = panelBaseX + (fi + 1) * panelW
      const leftPct = (creaseX / paperW) * 100
      ticks.push({
        key: `fold-guide-${bookIndex}-${fi}-top`,
        leftPct,
        topPct: stripTopPct,
        heightPct: tickTopPct,
      })
      ticks.push({
        key: `fold-guide-${bookIndex}-${fi}-bottom`,
        leftPct,
        topPct: stripTopPct + stripHeightPct - tickTopPct,
        heightPct: tickTopPct,
      })
    }
  }

  return (
    <>
      {ticks.map((tick) => (
        <Tick
          key={tick.key}
          data-fold-guide="true"
          aria-hidden
          style={{
            left: `${tick.leftPct}%`,
            top: `${tick.topPct}%`,
            height: `${tick.heightPct}%`,
            borderLeft: `0.5px dashed ${lineColor}`,
          }}
        />
      ))}
    </>
  )
}
