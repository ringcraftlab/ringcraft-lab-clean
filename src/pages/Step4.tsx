import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PrintIcon from '@mui/icons-material/Print'
import TuneIcon from '@mui/icons-material/Tune'
import Box from '@mui/material/Box'
import MuiToggleButton from '@mui/material/ToggleButton'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppButton from '../components/AppButton'
import StepBar from '../components/StepBar'
import PrintTypePreview from '../components/PrintTypePreview'
import Step4EditModal, { type Step4SlotFitMode } from '../components/step4/Step4EditModal'
import Step4ImagesSidePanel, { type ImageAreaMode } from '../components/step4/Step4ImagesSidePanel'
import Step4SettingsBlock, {
  DEFAULT_BORDER_COLOR,
  type HoleSide,
} from '../components/step4/Step4SettingsBlock'
import {
  buildSlotRects,
  previewVariantFor,
  useStep4Capture,
  type GuideImageFit,
} from '../components/step4/useStep4Capture'
import { getHolePositions, SIZE_PICKER_LINES, SIZES, type SizeDefinition } from '../config/sizes'
import { calcLayout, isFoldLayoutMode, paperOrientationForLayout } from '../utils/layout'
import {
  buildPrintTypePreviewLayout,
  type PrintTypePreviewLayout,
  type PrintTypePreviewLayoutParams,
} from '../utils/printTypePreviewLayout'

type Step4LocationState = {
  sizeId?: string
  customW?: number
  customH?: number
  layoutMode?: string
  printType?: string
}

const GUIDE_IMAGE_FIT_OPTIONS: { id: GuideImageFit; label: string }[] = [
  { id: 'cover', label: 'トリミング' },
  { id: 'contain', label: '全体表示' },
  { id: 'fill', label: '引き延ばし' },
]

const PRINT_TYPE_HEADINGS: Record<string, string> = {
  frame: 'リフィル枠を印刷',
  background: '背景画像を印刷',
  images: '個別画像を挿入',
}

const HOLE_ZONE_MM = 6.5
const IMAGE_START_MM = 6.7

const Page = styled('div')({
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
})

const Header = styled('header')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: '56px',
  backgroundColor: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
})

const HeaderInner = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '0 24px',
})

const BackButton = styled('button')({
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '1rem',
  flexShrink: 0,
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

const HeaderTitle = styled('h1')({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '18px',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
})

const Container = styled(Box)({
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '40px 24px 56px',
})

const SingleColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '560px',
  margin: '0 auto',
})

const TwoColumnLayout = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'gridTemplateColumns',
})<{ gridTemplateColumns?: string }>(({ gridTemplateColumns }) => ({
  display: 'grid',
  gridTemplateColumns: gridTemplateColumns ?? '280px minmax(0, 1fr)',
  gap: '24px',
  alignItems: 'start',
}))

const ImagesPaperFrame = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'aspectRatio',
})<{ aspectRatio: string }>(({ aspectRatio }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio,
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  overflow: 'hidden',
}))

const ImagesPreviewOverlayLayer = styled(Box)({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  lineHeight: 0,
  pointerEvents: 'none',
  '& svg': {
    display: 'block',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
})

const SlotButton = styled('button', {
  shouldForwardProp: (prop) =>
    prop !== 'hasImage' &&
    prop !== 'isActive' &&
    prop !== 'slotLeft' &&
    prop !== 'slotTop' &&
    prop !== 'slotWidth' &&
    prop !== 'slotHeight',
})<{
  hasImage?: boolean
  isActive?: boolean
  slotLeft: number
  slotTop: number
  slotWidth: number
  slotHeight: number
}>(({ hasImage, isActive, slotLeft, slotTop, slotWidth, slotHeight }) => ({
  position: 'absolute',
  left: `${slotLeft}%`,
  top: `${slotTop}%`,
  width: `${slotWidth}%`,
  height: `${slotHeight}%`,
  margin: 0,
  padding: 0,
  border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: hasImage ? '#ffffff' : '#fdf5f3',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const SlotBadge = styled('span')({
  position: 'absolute',
  top: '4px',
  right: '4px',
  zIndex: 10,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '18px',
  height: '18px',
  padding: '0 4px',
  borderRadius: '4px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-surface)',
  fontSize: '0.65rem',
  fontWeight: 700,
  lineHeight: 1,
  pointerEvents: 'none',
})

const SlotImage = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fitMode' && prop !== 'rotation',
})<{ fitMode: GuideImageFit; rotation: number }>(({ fitMode, rotation }) => ({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: fitMode,
  transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
  transformOrigin: 'center center',
}))

const SlotHoleZone = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'holeSide' && prop !== 'zoneWidthPct' && prop !== 'layerZIndex',
})<{
  holeSide: HoleSide
  zoneWidthPct: number
  layerZIndex: number
}>(({ holeSide, zoneWidthPct, layerZIndex }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  ...(holeSide === 'left' ? { left: 0 } : { right: 0 }),
  width: `${zoneWidthPct}%`,
  backgroundColor: '#ffffff',
  zIndex: layerZIndex,
  pointerEvents: 'none',
}))

const SlotHoleCircle = styled('div', {
  shouldForwardProp: (prop) => prop !== 'topPct',
})<{ topPct: number }>(({ topPct }) => ({
  position: 'absolute',
  borderRadius: '50%',
  border: '1px solid var(--color-border)',
  width: '8px',
  height: '8px',
  left: '50%',
  transform: 'translateX(-50%)',
  top: `${topPct}%`,
  boxSizing: 'border-box',
  backgroundColor: 'transparent',
  pointerEvents: 'none',
}))

const SlotImageLayer = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'avoidsHole' &&
    prop !== 'holeSide' &&
    prop !== 'insetStartPct' &&
    prop !== 'widthPct',
})<{
  avoidsHole: boolean
  holeSide: HoleSide
  insetStartPct: number
  widthPct: number
}>(({ avoidsHole, holeSide, insetStartPct, widthPct }) => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(avoidsHole
    ? holeSide === 'left'
      ? { left: `${insetStartPct}%`, width: `${widthPct}%` }
      : { right: `${insetStartPct}%`, width: `${widthPct}%` }
    : { left: 0, right: 0, width: '100%' }),
  zIndex: avoidsHole ? 1 : 3,
}))

const SlotPlus = styled('span')({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--color-primary)',
  fontSize: '1.75rem',
  fontWeight: 300,
  lineHeight: 1,
  pointerEvents: 'none',
})

const MainColumn = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'reserveEditPanelSpace',
})<{ reserveEditPanelSpace?: boolean }>(({ reserveEditPanelSpace }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  boxSizing: 'border-box',
  ...(reserveEditPanelSpace ? { paddingRight: '316px' } : {}),
}))

const StepBadge = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  maxWidth: '100%',
  padding: '4px 14px',
  borderRadius: 'var(--radius-btn)',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-surface)',
  fontWeight: 600,
  fontSize: '0.8rem',
})

const Step4PageHeader = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  gap: '8px',
  marginBottom: '24px',
})

const Step4HeaderTitleRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
})

const Step4HeaderSeparator = styled('span')({
  color: 'var(--color-muted)',
  fontSize: '1rem',
  fontWeight: 400,
  lineHeight: 1,
})

const Step4HeaderIconWrap = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
})

const Step4HeaderTitle = styled('h2')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1.25rem',
  lineHeight: 1.4,
})

const Step4HeaderSubtext = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
})

const LayoutCountLine = styled('p')({
  margin: '0 0 24px',
  width: '100%',
  textAlign: 'center',
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  fontWeight: 600,
  lineHeight: 1.5,
})

const ImagesEditModeBanner = styled('p')({
  margin: '0 0 12px',
  width: '100%',
  padding: '8px 12px',
  borderRadius: 'var(--radius-btn)',
  backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, var(--color-surface))',
  border: '1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-border))',
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1.5,
  textAlign: 'center',
  boxSizing: 'border-box',
})

const PreviewWrap = styled(Box)({
  width: '100%',
  maxWidth: 'min(700px, 100%)',
  margin: '0 auto 28px',
  lineHeight: 0,
})

const HiddenFileInput = styled('input')({
  display: 'none',
})

const BackgroundSideColumn = styled(Box)({
  width: '280px',
  flexShrink: 0,
  padding: '0 24px 24px',
  boxSizing: 'border-box',
})

const BackgroundImagePanel = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
})

const BackgroundPickButton = styled(AppButton)({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
})

const BackgroundPreviewHint = styled('p')({
  margin: '0 0 12px',
  width: '100%',
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  textAlign: 'center',
})

const BackgroundOptionsSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '12px',
  width: '100%',
  marginBottom: '24px',
})

const BackgroundOptionsPanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
})

const BackgroundImageActions = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '10px',
})

const PreviewLayerStack = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'aspectRatio',
})<{ aspectRatio: string }>(({ aspectRatio }) => ({
  position: 'relative',
  width: '100%',
  aspectRatio,
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border)',
  overflow: 'hidden',
}))

const PreviewBackgroundLayer = styled(Box)({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 0,
})

const PreviewOverlayLayer = styled(Box)({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  lineHeight: 0,
  '& svg': {
    display: 'block',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
})

const GuideImage = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fitMode' && prop !== 'rotation',
})<{ fitMode: GuideImageFit; rotation: number }>(({ fitMode, rotation }) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: fitMode,
  transform: `rotate(${rotation}deg)`,
  transformOrigin: 'center center',
}))

const BackgroundFitRow = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

const BackgroundFitLabel = styled('span')({
  color: 'var(--color-muted)',
  fontSize: '0.85rem',
  fontWeight: 500,
})

const BackgroundFitControls = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  justifyContent: 'center',
})

const GuideImageFitToggleGroup = styled(MuiToggleButtonGroup)({
  flexWrap: 'wrap',
  justifyContent: 'center',
  '& .MuiToggleButtonGroup-grouped': {
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.85rem',
    fontWeight: 500,
    textTransform: 'none',
    '&:not(:first-of-type)': {
      borderColor: 'var(--color-border)',
      marginLeft: '-1px',
    },
    '&.Mui-selected': {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-surface)',
      borderColor: 'var(--color-primary)',
      '&:hover': {
        backgroundColor: 'var(--color-primary)',
      },
    },
    '&:hover': {
      borderColor: 'var(--color-primary)',
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
    },
  },
})

const GuideImageFitToggle = styled(MuiToggleButton)({})

const MutedAppButton = styled(AppButton)({
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-muted)',
  border: '1px solid var(--color-border)',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))',
    color: 'var(--color-text-h)',
  },
})

const PreviewFallback = styled('p')({
  margin: 0,
  padding: '24px 16px',
  textAlign: 'center',
  color: 'var(--color-muted)',
  fontSize: '0.9rem',
  lineHeight: 1.6,
  backgroundColor: 'var(--color-surface)',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border)',
})

const ActionRow = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '12px',
  width: '100%',
})

const OutlineAppButton = styled(AppButton)({
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-primary)',
  border: '2px solid var(--color-primary)',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
  },
})

const BackgroundOptionsToggleButton = styled(OutlineAppButton)({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
})

const ActionButtonLabel = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
})

function resolveRefillDimensions(state: Step4LocationState | null): {
  refillW: number
  refillH: number
} {
  if (state?.sizeId === 'custom' && state.customW != null && state.customH != null) {
    return { refillW: state.customW, refillH: state.customH }
  }

  const size = SIZES.find((entry) => entry.id === state?.sizeId)
  if (size?.w != null && size?.h != null) {
    return { refillW: size.w, refillH: size.h }
  }

  const fallback = SIZES.find((entry) => entry.id === 'microfive')
  return {
    refillW: fallback?.w ?? 62,
    refillH: fallback?.h ?? 105,
  }
}

function resolveSizePreset(sizeId?: string): SizeDefinition | undefined {
  if (sizeId === 'custom') {
    return { id: 'custom' } as SizeDefinition
  }
  return SIZES.find((entry) => entry.id === sizeId)
}

function getSizeDisplayName(sizeId?: string): string {
  if (sizeId && SIZE_PICKER_LINES[sizeId]?.[0]) {
    return SIZE_PICKER_LINES[sizeId][0]
  }
  const preset = resolveSizePreset(sizeId)
  return preset?.shortName ?? preset?.name ?? 'リフィル'
}

function getSheetMarginSuffix(
  layoutMode: string | undefined,
  refillW: number,
  refillH: number,
): string {
  if (!layoutMode || isFoldLayoutMode(layoutMode)) return ''
  const portrait = calcLayout(refillW, refillH, 'portrait')
  const landscape = calcLayout(refillW, refillH, 'landscape')
  if (portrait.total <= 0 || landscape.total <= 0) return ''

  const portraitIsTight = portrait.total > landscape.total
  const landscapeIsTight = landscape.total >= portrait.total

  if (layoutMode === 'portrait') {
    return portraitIsTight ? '（余白少なめ）' : '（余白多め）'
  }
  if (layoutMode === 'landscape') {
    return landscapeIsTight ? '（余白少なめ）' : '（余白多め）'
  }
  return ''
}

function buildStep4LayoutSubtext(
  sizeId: string | undefined,
  layoutMode: string | undefined,
  previewLayout: PrintTypePreviewLayout | null,
  refillW: number,
  refillH: number,
): string | null {
  if (!previewLayout) return null

  const sizeLabel = getSizeDisplayName(sizeId)

  if (previewLayout.kind === 'fold') {
    const foldTitle =
      layoutMode === 'fold4' ? '4つ折り' : layoutMode === 'fold3' ? '3つ折り' : '折り'
    return `${sizeLabel}・${foldTitle}・A4横・${previewLayout.fold.total}面`
  }

  const marginSuffix = getSheetMarginSuffix(layoutMode, refillW, refillH)
  return `${sizeLabel}・A4に${previewLayout.total}枚${marginSuffix}`
}

function buildStep4LayoutCountLine(
  sizeId: string | undefined,
  previewLayout: PrintTypePreviewLayout | null,
): string | null {
  if (!previewLayout) return null

  const sizeLabel = getSizeDisplayName(sizeId)

  if (previewLayout.kind === 'fold') {
    return `${sizeLabel} / ${previewLayout.fold.foldCount}面×${previewLayout.fold.bookCount}冊 / ${previewLayout.fold.total}面`
  }

  return `${sizeLabel} / ${previewLayout.cols}列×${previewLayout.rows}行 / ${previewLayout.total}枚`
}

function Step4PageHeaderBlock({
  title,
  subtext,
}: {
  title: string
  subtext: string | null
}) {
  return (
    <Step4PageHeader>
      <Step4HeaderTitleRow>
        <StepBadge>Step4</StepBadge>
        <Step4HeaderSeparator aria-hidden>|</Step4HeaderSeparator>
        <Step4HeaderIconWrap aria-hidden>
          <AppHeaderBrandIcon />
        </Step4HeaderIconWrap>
        <Step4HeaderSeparator aria-hidden>|</Step4HeaderSeparator>
        <Step4HeaderTitle>{title}</Step4HeaderTitle>
      </Step4HeaderTitleRow>
      {subtext ? <Step4HeaderSubtext>{subtext}</Step4HeaderSubtext> : null}
    </Step4PageHeader>
  )
}

function getSlotCount(layout: PrintTypePreviewLayout): number {
  if (layout.kind === 'fold') {
    return layout.fold.bookCount * layout.fold.foldCount
  }
  return layout.cols * layout.rows
}

function placeImagesInEmptySlots(
  prev: Record<number, string>,
  urls: string[],
  total: number,
): Record<number, string> {
  const next = { ...prev }
  let urlIndex = 0
  for (let slot = 0; slot < total && urlIndex < urls.length; slot += 1) {
    if (!next[slot]) {
      next[slot] = urls[urlIndex]
      urlIndex += 1
    }
  }
  return next
}

type SlotAreaMetrics = {
  avoidsHole: boolean
  showHoleZoneInSlot: boolean
  holeZoneWidthPct: number
  imageInsetPct: number
  imageWidthPct: number
}

function getSlotAreaMetrics(
  layout: PrintTypePreviewLayout,
  imageAreaMode: ImageAreaMode,
): SlotAreaMetrics {
  const avoidsHole = imageAreaMode === 'avoid'

  if (layout.kind === 'fold') {
    const cellW = layout.fold.panelW
    const insetMm = avoidsHole ? Math.max(0, IMAGE_START_MM - HOLE_ZONE_MM) : 0
    return {
      avoidsHole,
      showHoleZoneInSlot: false,
      holeZoneWidthPct: (HOLE_ZONE_MM / cellW) * 100,
      imageInsetPct: (insetMm / cellW) * 100,
      imageWidthPct: ((cellW - insetMm) / cellW) * 100,
    }
  }

  const cellW = layout.refillW
  const holeZoneWidthPct = (HOLE_ZONE_MM / cellW) * 100
  const imageInsetPct = avoidsHole ? (IMAGE_START_MM / cellW) * 100 : 0
  const imageWidthPct = avoidsHole ? ((cellW - IMAGE_START_MM) / cellW) * 100 : 100

  return {
    avoidsHole,
    showHoleZoneInSlot: true,
    holeZoneWidthPct,
    imageInsetPct,
    imageWidthPct,
  }
}

interface ImagesSlotPreviewProps {
  layout: PrintTypePreviewLayout
  images: Record<number, string>
  imageFitModes: Record<number, GuideImageFit>
  imageRotations: Record<number, number>
  activeSlot: number | null
  onSlotClick: (index: number) => void
  layoutParams: PrintTypePreviewLayoutParams
  showHoleGuide: boolean
  imageAreaMode: ImageAreaMode
}

function ImagesSlotPreview({
  layout,
  images,
  imageFitModes,
  imageRotations,
  activeSlot,
  onSlotClick,
  layoutParams,
  showHoleGuide,
  imageAreaMode,
}: ImagesSlotPreviewProps) {
  const aspectRatio = `${layout.paperW} / ${layout.paperH}`
  const slotRects = useMemo(() => buildSlotRects(layout), [layout])
  const holeSide = layoutParams.holeSide ?? 'left'
  const slotAreaMetrics = useMemo(
    () => getSlotAreaMetrics(layout, imageAreaMode),
    [layout, imageAreaMode],
  )
  const holePosY = useMemo(() => {
    const sizePreset =
      layoutParams.sizeId === 'custom'
        ? SIZES.find((s) => s.id === 'custom')
        : SIZES.find((s) => s.id === layoutParams.sizeId)
    return getHolePositions(sizePreset ?? undefined)
  }, [layoutParams.sizeId])
  const refillH = layout.refillH

  return (
    <ImagesPaperFrame aspectRatio={aspectRatio} data-paper-frame>
      {slotRects.map((rect) => {
        const src = images[rect.index]
        const hasImage = Boolean(src)
        const isActive = activeSlot === rect.index

        return (
          <SlotButton
            key={rect.index}
            type="button"
            data-slot-button
            hasImage={hasImage}
            isActive={isActive}
            slotLeft={rect.left}
            slotTop={rect.top}
            slotWidth={rect.width}
            slotHeight={rect.height}
            aria-label={hasImage ? `${rect.index + 1}番の写真` : `${rect.index + 1}番に写真を追加`}
            onClick={() => onSlotClick(rect.index)}
          >
            <SlotBadge aria-hidden>{rect.index + 1}</SlotBadge>
            {slotAreaMetrics.showHoleZoneInSlot ? (
              <SlotHoleZone
                holeSide={holeSide}
                zoneWidthPct={slotAreaMetrics.holeZoneWidthPct}
                layerZIndex={slotAreaMetrics.avoidsHole ? 2 : 1}
              >
                {showHoleGuide
                  ? holePosY.map((posY, holeIndex) => (
                      <SlotHoleCircle
                        key={holeIndex}
                        topPct={(posY / refillH) * 100}
                      />
                    ))
                  : null}
              </SlotHoleZone>
            ) : null}
            <SlotImageLayer
              avoidsHole={slotAreaMetrics.avoidsHole}
              holeSide={holeSide}
              insetStartPct={slotAreaMetrics.imageInsetPct}
              widthPct={slotAreaMetrics.imageWidthPct}
            >
              {hasImage ? (
                <SlotImage
                  src={src}
                  alt=""
                  fitMode={imageFitModes[rect.index] ?? 'cover'}
                  rotation={imageRotations[rect.index] ?? 0}
                  data-fit-mode={imageFitModes[rect.index] ?? 'cover'}
                  data-rotation={String(imageRotations[rect.index] ?? 0)}
                />
              ) : (
                <SlotPlus data-print="false">+</SlotPlus>
              )}
            </SlotImageLayer>
          </SlotButton>
        )
      })}
      {showHoleGuide ? (
        <ImagesPreviewOverlayLayer data-overlay-layer>
          <PrintTypePreview
            variant="frame"
            layoutParams={{ ...layoutParams, showHoleGuide: false }}
            emphasized
          />
        </ImagesPreviewOverlayLayer>
      ) : null}
    </ImagesPaperFrame>
  )
}

export default function Step4() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? null) as Step4LocationState | null

  const printType = routeState?.printType ?? 'frame'
  const isImagesMode = printType === 'images'
  const isBackgroundMode = printType === 'background'
  const pageHeading = PRINT_TYPE_HEADINGS[printType] ?? PRINT_TYPE_HEADINGS.frame

  const guideImageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const filePickSlotRef = useRef<number | null>(null)
  const fileInputMultiRef = useRef<HTMLInputElement>(null)
  const fileInputFillRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [guideImage, setGuideImage] = useState('')
  const [guideImageFit, setGuideImageFit] = useState<GuideImageFit>('contain')
  const [guideImageRotation, setGuideImageRotation] = useState(0)
  const [images, setImages] = useState<Record<number, string>>({})
  const [imageFitModes, setImageFitModes] = useState<Record<number, GuideImageFit>>({})
  const [imageRotations, setImageRotations] = useState<Record<number, number>>({})
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  useEffect(() => {
    if (!isImagesMode) return
    const hasImages = Object.keys(images).length > 0
    if (hasImages && activeSlot === null) {
      setActiveSlot(0)
    }
    if (!hasImages) {
      setActiveSlot(null)
    }
  }, [images, isImagesMode])

  const { refillW, refillH } = useMemo(
    () => resolveRefillDimensions(routeState),
    [routeState],
  )

  const [showHoleGuide, setShowHoleGuide] = useState(true)
  const [holeSide, setHoleSide] = useState<HoleSide>('left')
  const [imageAreaMode, setImageAreaMode] = useState<ImageAreaMode>('avoid')
  const [backgroundOptionsOpen, setBackgroundOptionsOpen] = useState(false)

  const layoutParams = useMemo(
    () => ({
      refillW,
      refillH,
      layoutMode: routeState?.layoutMode,
      sizeId: routeState?.sizeId,
      showHoleGuide,
      holeSide,
    }),
    [refillW, refillH, routeState, showHoleGuide, holeSide],
  )

  const previewLayout = useMemo(
    () => buildPrintTypePreviewLayout(layoutParams),
    [layoutParams],
  )

  const layoutSubtext = useMemo(
    () =>
      buildStep4LayoutSubtext(
        routeState?.sizeId,
        routeState?.layoutMode,
        previewLayout,
        refillW,
        refillH,
      ),
    [routeState?.sizeId, routeState?.layoutMode, previewLayout, refillW, refillH],
  )

  const layoutCountLine = useMemo(
    () => buildStep4LayoutCountLine(routeState?.sizeId, previewLayout),
    [routeState?.sizeId, previewLayout],
  )

  const paperMetrics = useMemo(() => {
    if (previewLayout) {
      return { pageWmm: previewLayout.paperW, pageHmm: previewLayout.paperH }
    }
    const orient = paperOrientationForLayout(layoutParams.layoutMode ?? 'portrait')
    return orient === 'landscape'
      ? { pageWmm: 297, pageHmm: 210 }
      : { pageWmm: 210, pageHmm: 297 }
  }, [previewLayout, layoutParams.layoutMode])

  const holePositions = useMemo(
    () => getHolePositions(resolveSizePreset(routeState?.sizeId)),
    [routeState?.sizeId],
  )

  const [borderColor, setBorderColor] = useState<string>(DEFAULT_BORDER_COLOR)

  const { handleSavePdf, handlePrint } = useStep4Capture({
    paperMetrics,
    previewLayout,
    printType,
    layoutParams,
    images,
    imageFitModes,
    guideImage,
    guideImageFit,
    guideImageRotation,
    showHoleGuide,
    isImagesMode,
    isBackgroundMode,
  })

  const handleGuideImageInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result
      if (typeof result === 'string') {
        setGuideImage(result)
        setGuideImageRotation(0)
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }, [])

  const removeBackgroundImage = useCallback(() => {
    setGuideImage('')
    setGuideImageRotation(0)
    setBackgroundOptionsOpen(false)
  }, [])

  const toggleBackgroundOptions = useCallback(() => {
    setBackgroundOptionsOpen((open) => !open)
  }, [])

  const isMobile = useMediaQuery('(max-width: 768px)')

  const imageEditTarget = useMemo(() => {
    if (!isImagesMode || activeSlot === null) return null
    return { kind: 'slot' as const, index: activeSlot }
  }, [isImagesMode, activeSlot])

  const reserveEditPanelSpace = imageEditTarget !== null && !isMobile

  const resetAreaEditFocus = useCallback(() => {
    setActiveSlot(null)
  }, [])

  const handleSlotClick = useCallback(
    (index: number) => {
      if (images[index]) {
        setActiveSlot(null)
        setActiveSlot(index)
        return
      }
      filePickSlotRef.current = index
      fileInputRef.current?.click()
    },
    [images],
  )

  const handleFileInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const slot = filePickSlotRef.current ?? activeSlot
    filePickSlotRef.current = null
    if (!file || slot === null) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result
      if (typeof result !== 'string') return
      setImages((prev) => ({ ...prev, [slot]: result }))
      setImageRotations((prev) => ({ ...prev, [slot]: 0 }))
      setActiveSlot(slot)
    }
    reader.readAsDataURL(file)
  }, [activeSlot])

  const handleEditSetFit = useCallback(
    (mode: Step4SlotFitMode) => {
      if (imageEditTarget === null) return
      setImageFitModes((prev) => ({ ...prev, [imageEditTarget.index]: mode }))
    },
    [imageEditTarget],
  )

  const handleEditRotate = useCallback(() => {
    if (imageEditTarget === null) return
    const slot = imageEditTarget.index
    setImageRotations((prev) => ({
      ...prev,
      [slot]: ((prev[slot] ?? 0) + 90) % 360,
    }))
  }, [imageEditTarget])

  const handleEditReplace = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleEditDelete = useCallback(() => {
    if (imageEditTarget === null) return
    const slot = imageEditTarget.index
    setImages((prev) => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
    setImageFitModes((prev) => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
    setImageRotations((prev) => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
    resetAreaEditFocus()
  }, [imageEditTarget, resetAreaEditFocus])

  const handleMultiInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? [])
      event.target.value = ''
      if (!files.length || !previewLayout) return

      const total = getSlotCount(previewLayout)
      const readers = files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (loadEvent) => {
              const result = loadEvent.target?.result
              if (typeof result === 'string') resolve(result)
              else reject(new Error('read failed'))
            }
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(file)
          }),
      )

      void Promise.all(readers).then((urls) => {
        setImages((prev) => placeImagesInEmptySlots(prev, urls, total))
      })
    },
    [previewLayout],
  )

  const handleFillInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || !previewLayout || previewLayout.kind !== 'sheet') return

      const total = previewLayout.cols * previewLayout.rows
      if (total <= 0) return

      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result
        if (typeof result !== 'string') return
        const nextImages: Record<number, string> = {}
        for (let slot = 0; slot < total; slot += 1) {
          nextImages[slot] = result
        }
        setImages(nextImages)
      }
      reader.readAsDataURL(file)
    },
    [previewLayout],
  )

  const handleFillAllImages = useCallback(() => {
    const firstImage = images[0]
    if (!firstImage) return
    const sheetLayout = previewLayout?.kind === 'sheet' ? previewLayout : null
    const total = (sheetLayout?.cols ?? 0) * (sheetLayout?.rows ?? 0)
    const newImages: Record<number, string> = {}
    for (let i = 0; i < total; i++) {
      newImages[i] = firstImage
    }
    setImages(newImages)
  }, [images, previewLayout])

  const handleClearAllImages = useCallback(() => {
    setImages({})
    setImageFitModes({})
    setImageRotations({})
    resetAreaEditFocus()
  }, [resetAreaEditFocus])

  const goBackToStep3 = () => {
    navigate('/tool/step3', {
      state: {
        sizeId: routeState?.sizeId,
        customW: routeState?.customW,
        customH: routeState?.customH,
        layoutMode: routeState?.layoutMode,
      },
    })
  }

  const previewAspectRatio =
    previewLayout != null
      ? `${previewLayout.paperW} / ${previewLayout.paperH}`
      : '210 / 297'

  const printTypePreview = previewLayout ? (
    <PrintTypePreview
      variant={
        isBackgroundMode && !guideImage ? 'background' : previewVariantFor(printType)
      }
      layoutParams={layoutParams}
      emphasized
    />
  ) : (
    <PreviewFallback>このサイズ・レイアウトではプレビューを表示できません。</PreviewFallback>
  )

  const previewContent =
    isBackgroundMode && guideImage ? (
      <PreviewLayerStack aspectRatio={previewAspectRatio}>
        <PreviewBackgroundLayer>
          <GuideImage
            src={guideImage}
            alt="選択した背景画像"
            fitMode={guideImageFit}
            rotation={guideImageRotation}
          />
        </PreviewBackgroundLayer>
        {previewLayout ? (
          <PreviewOverlayLayer>
            <PrintTypePreview variant="frame" layoutParams={layoutParams} emphasized />
          </PreviewOverlayLayer>
        ) : null}
      </PreviewLayerStack>
    ) : isImagesMode && previewLayout ? (
      <ImagesSlotPreview
        layout={previewLayout}
        images={images}
        imageFitModes={imageFitModes}
        imageRotations={imageRotations}
        activeSlot={activeSlot}
        onSlotClick={handleSlotClick}
        layoutParams={layoutParams}
        showHoleGuide={showHoleGuide}
        imageAreaMode={imageAreaMode}
      />
    ) : isImagesMode ? (
      <PreviewFallback>このサイズ・レイアウトではプレビューを表示できません。</PreviewFallback>
    ) : (
      printTypePreview
    )

  const backgroundLeftColumn = isBackgroundMode ? (
    <BackgroundSideColumn aria-label="背景画像の操作">
      <BackgroundImagePanel>
        <HiddenFileInput
          ref={guideImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleGuideImageInput}
        />
        <BackgroundPickButton type="button" onClick={() => guideImageInputRef.current?.click()}>
          背景画像を選ぶ
        </BackgroundPickButton>
      </BackgroundImagePanel>
    </BackgroundSideColumn>
  ) : null

  const backgroundDisplayOptions =
    isBackgroundMode && guideImage ? (
      <BackgroundOptionsSection>
        <BackgroundOptionsToggleButton
          type="button"
          aria-expanded={backgroundOptionsOpen}
          onClick={toggleBackgroundOptions}
        >
          <ActionButtonLabel>
            <TuneIcon fontSize="small" aria-hidden />
            表示オプション
          </ActionButtonLabel>
        </BackgroundOptionsToggleButton>
        {backgroundOptionsOpen ? (
          <BackgroundOptionsPanel>
            <BackgroundFitRow>
              <BackgroundFitLabel>表示方法</BackgroundFitLabel>
              <BackgroundFitControls>
                <GuideImageFitToggleGroup
                  exclusive
                  value={guideImageFit}
                  onChange={(_event, value: GuideImageFit | null) => {
                    if (value !== null) setGuideImageFit(value)
                  }}
                  aria-label="表示方法"
                >
                  {GUIDE_IMAGE_FIT_OPTIONS.map((option) => (
                    <GuideImageFitToggle key={option.id} value={option.id}>
                      {option.label}
                    </GuideImageFitToggle>
                  ))}
                </GuideImageFitToggleGroup>
              </BackgroundFitControls>
            </BackgroundFitRow>
            <BackgroundImageActions>
              <AppButton
                type="button"
                onClick={() => setGuideImageRotation((prev) => (prev + 90) % 360)}
              >
                90°回転{guideImageRotation > 0 ? `（${guideImageRotation}°）` : ''}
              </AppButton>
              <MutedAppButton type="button" onClick={removeBackgroundImage}>
                画像を削除
              </MutedAppButton>
            </BackgroundImageActions>
          </BackgroundOptionsPanel>
        ) : null}
      </BackgroundOptionsSection>
    ) : null

  const actionBlock = (
    <ActionRow>
      <OutlineAppButton type="button" onClick={() => void handleSavePdf()}>
        <ActionButtonLabel>
          <FileDownloadIcon fontSize="small" aria-hidden />
          PDF保存
        </ActionButtonLabel>
      </OutlineAppButton>
      <AppButton type="button" onClick={() => void handlePrint()}>
        <ActionButtonLabel>
          <PrintIcon fontSize="small" aria-hidden />
          印刷する
        </ActionButtonLabel>
      </AppButton>
    </ActionRow>
  )

  const rightColumnContent = (
    <>
      {isBackgroundMode && !guideImage ? (
        <BackgroundPreviewHint>背景を選ぶとここに表示されます</BackgroundPreviewHint>
      ) : null}
      {imageEditTarget !== null ? (
        <ImagesEditModeBanner>
          個別編集モード：{imageEditTarget.index + 1}枚目を編集中
        </ImagesEditModeBanner>
      ) : null}
      <PreviewWrap ref={previewRef} data-hole-count={holePositions.length}>
        {previewContent}
      </PreviewWrap>
      {backgroundDisplayOptions}
      <Step4SettingsBlock
        showHoleGuide={showHoleGuide}
        onShowHoleGuideChange={setShowHoleGuide}
        holeSide={holeSide}
        onHoleSideChange={setHoleSide}
        borderColor={borderColor}
        onBorderColorChange={setBorderColor}
      />
      {layoutCountLine ? <LayoutCountLine>{layoutCountLine}</LayoutCountLine> : null}
      {actionBlock}
    </>
  )

  const mainBlock = (
    <>
      <Step4PageHeaderBlock title={pageHeading} subtext={layoutSubtext} />
      {rightColumnContent}
    </>
  )

  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackButton type="button" onClick={goBackToStep3}>
            ← Step3に戻る
          </BackButton>
        </HeaderInner>
        <HeaderTitle>
          <AppHeaderBrandIcon />
          リフィル作成
        </HeaderTitle>
      </Header>

      <Container>
        <StepBar currentStep={4} />
        {isImagesMode ? (
          <>
            <Step4PageHeaderBlock title={pageHeading} subtext={layoutSubtext} />
            <TwoColumnLayout gridTemplateColumns="240px minmax(0, 1fr)">
              <Step4ImagesSidePanel
                images={images}
                fileInputRef={fileInputRef}
                fileInputMultiRef={fileInputMultiRef}
                fileInputFillRef={fileInputFillRef}
                imageAreaMode={imageAreaMode}
                onImageAreaModeChange={setImageAreaMode}
                onClearAllImages={handleClearAllImages}
                onFillAllImages={handleFillAllImages}
                onFileInput={handleFileInput}
                onMultiInput={handleMultiInput}
                onFillInput={handleFillInput}
              />
              <MainColumn reserveEditPanelSpace={reserveEditPanelSpace}>
                {rightColumnContent}
              </MainColumn>
            </TwoColumnLayout>
          </>
        ) : isBackgroundMode ? (
          <>
            <Step4PageHeaderBlock title={pageHeading} subtext={layoutSubtext} />
            <TwoColumnLayout>
              {backgroundLeftColumn}
              <MainColumn>{rightColumnContent}</MainColumn>
            </TwoColumnLayout>
          </>
        ) : (
          <SingleColumn>{mainBlock}</SingleColumn>
        )}
      </Container>

      {isImagesMode ? (
        <Step4EditModal
          open={imageEditTarget !== null}
          slotIndex={imageEditTarget?.index ?? null}
          imageSrc={
            imageEditTarget !== null ? images[imageEditTarget.index] ?? null : null
          }
          fitMode={
            imageEditTarget !== null
              ? imageFitModes[imageEditTarget.index] ?? 'cover'
              : 'cover'
          }
          rotation={
            imageEditTarget !== null ? imageRotations[imageEditTarget.index] ?? 0 : 0
          }
          onClose={resetAreaEditFocus}
          onSetFit={handleEditSetFit}
          onRotate={handleEditRotate}
          onReplace={handleEditReplace}
          onDelete={handleEditDelete}
        />
      ) : null}
    </Page>
  )
}
