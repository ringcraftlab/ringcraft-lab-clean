import FileDownloadIcon from '@mui/icons-material/FileDownload'
import PrintIcon from '@mui/icons-material/Print'
import TuneIcon from '@mui/icons-material/Tune'
import Box from '@mui/material/Box'
import MuiToggleButton from '@mui/material/ToggleButton'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppLayout from '../components/AppLayout'
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

type ImageEditTarget =
  | { kind: 'slot'; index: number }
  | { kind: 'panorama'; index: number }
import { getHolePositions, SIZE_PICKER_LINES, SIZES, type SizeDefinition } from '../config/sizes'
import {
  buildPanoramaStripRects,
  clearPanoramaState,
  getFoldPanoramaPreviewMm,
  type FoldImageMode,
} from '../utils/foldImagePlacement'
import {
  calcLayout,
  foldCountFromMode,
  isFoldLayoutMode,
  paperOrientationForLayout,
} from '../utils/layout'
import {
  buildPrintTypePreviewLayout,
  type PrintTypePreviewLayout,
  type PrintTypePreviewLayoutParams,
} from '../utils/printTypePreviewLayout'
import { refillSheetCellBorders } from '../utils/refillBorderColors'

type Step4LocationState = {
  sizeId?: string
  customW?: number
  customH?: number
  customHoleStandard?: string
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
  border: 'none',
  backgroundColor: hasImage ? '#ffffff' : '#fdf5f3',
  cursor: 'pointer',
  overflow: 'hidden',
  boxSizing: 'border-box',
  transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
  ...(isActive
    ? {
        boxShadow: 'inset 0 0 0 2px var(--color-primary)',
      }
    : {}),
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
  top: `${topPct}%`,
  transform: 'translate(-50%, -50%)',
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

const PanoramaStripButton = styled('button', {
  shouldForwardProp: (prop) =>
    prop !== 'hasImage' &&
    prop !== 'isActive' &&
    prop !== 'stripLeft' &&
    prop !== 'stripTop' &&
    prop !== 'stripWidth' &&
    prop !== 'stripHeight',
})<{
  hasImage?: boolean
  isActive?: boolean
  stripLeft: number
  stripTop: number
  stripWidth: number
  stripHeight: number
}>(({ hasImage, isActive, stripLeft, stripTop, stripWidth, stripHeight }) => ({
  position: 'absolute',
  left: `${stripLeft}%`,
  top: `${stripTop}%`,
  width: `${stripWidth}%`,
  height: `${stripHeight}%`,
  margin: 0,
  padding: 0,
  border: 'none',
  backgroundColor: hasImage ? '#ffffff' : '#fdf5f3',
  cursor: 'pointer',
  overflow: 'hidden',
  boxSizing: 'border-box',
  zIndex: 4,
  transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
  ...(isActive
    ? {
        boxShadow: 'inset 0 0 0 2px var(--color-primary)',
      }
    : {}),
}))

const PanoramaStripLabel = styled('span')({
  position: 'absolute',
  top: '4px',
  left: '4px',
  zIndex: 10,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 6px',
  height: '18px',
  borderRadius: '4px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-surface)',
  fontSize: '0.65rem',
  fontWeight: 700,
  lineHeight: 1,
  pointerEvents: 'none',
})

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
  fontSize: '1.5rem',
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

function applyImageToAllSlots(
  total: number,
  dataUrl: string,
  fitMode?: GuideImageFit,
  rotation?: number,
): {
  images: Record<number, string>
  imageFitModes: Record<number, GuideImageFit>
  imageRotations: Record<number, number>
} {
  const images: Record<number, string> = {}
  const imageFitModes: Record<number, GuideImageFit> = {}
  const imageRotations: Record<number, number> = {}
  const fit = fitMode ?? 'cover'
  const rot = rotation ?? 0
  for (let slot = 0; slot < total; slot += 1) {
    images[slot] = dataUrl
    imageFitModes[slot] = fit
    imageRotations[slot] = rot
  }
  return { images, imageFitModes, imageRotations }
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
  foldImageMode: FoldImageMode
  images: Record<number, string>
  imageFitModes: Record<number, GuideImageFit>
  imageRotations: Record<number, number>
  panoramaImages: Record<number, string>
  panoramaFitModes: Record<number, GuideImageFit>
  panoramaRotations: Record<number, number>
  activeSlot: number | null
  activePanoramaBook: number | null
  onSlotClick: (index: number) => void
  onPanoramaClick: (bookIndex: number) => void
  layoutParams: PrintTypePreviewLayoutParams
  showHoleGuide: boolean
  imageAreaMode: ImageAreaMode
  borderColor: string
  showBorder: boolean
}

function ImagesSlotPreview({
  layout,
  foldImageMode,
  images,
  imageFitModes,
  imageRotations,
  panoramaImages,
  panoramaFitModes,
  panoramaRotations,
  activeSlot,
  activePanoramaBook,
  onSlotClick,
  onPanoramaClick,
  layoutParams,
  showHoleGuide,
  imageAreaMode,
  borderColor,
  showBorder,
}: ImagesSlotPreviewProps) {
  const aspectRatio = `${layout.paperW} / ${layout.paperH}`
  const slotRects = useMemo(() => buildSlotRects(layout), [layout])
  const isFoldPanorama =
    layout.kind === 'fold' && foldImageMode === 'panorama'
  const panoramaStrips = useMemo(
    () =>
      isFoldPanorama
        ? buildPanoramaStripRects(layout, imageAreaMode, layoutParams.holeSide ?? 'left')
        : [],
    [isFoldPanorama, layout, imageAreaMode, layoutParams.holeSide],
  )
  const gridCols = layout.kind === 'sheet' ? layout.cols : layout.fold.foldCount
  const gridRows =
    layout.kind === 'sheet' ? layout.rows : layout.fold.bookCount
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
    return getHolePositions(sizePreset ?? undefined, layoutParams.customHoleStandard)
  }, [layoutParams.sizeId, layoutParams.customHoleStandard])
  const refillH = layout.refillH

  return (
    <ImagesPaperFrame aspectRatio={aspectRatio} data-paper-frame>
      {isFoldPanorama
        ? panoramaStrips.map((strip) => {
            const src = panoramaImages[strip.bookIndex]
            const hasImage = Boolean(src)
            const isActive = activePanoramaBook === strip.bookIndex
            return (
              <PanoramaStripButton
                key={`panorama-${strip.bookIndex}`}
                type="button"
                hasImage={hasImage}
                isActive={isActive}
                stripLeft={strip.left}
                stripTop={strip.top}
                stripWidth={strip.width}
                stripHeight={strip.height}
                aria-label={
                  hasImage
                    ? `${strip.bookIndex + 1}冊目のパノラマ画像`
                    : `${strip.bookIndex + 1}冊目にパノラマ画像を追加`
                }
                onClick={() => onPanoramaClick(strip.bookIndex)}
              >
                <PanoramaStripLabel aria-hidden>
                  帯{strip.bookIndex + 1}
                </PanoramaStripLabel>
                {hasImage ? (
                  <SlotImage
                    src={src}
                    alt=""
                    fitMode={panoramaFitModes[strip.bookIndex] ?? 'cover'}
                    rotation={panoramaRotations[strip.bookIndex] ?? 0}
                    data-fit-mode={panoramaFitModes[strip.bookIndex] ?? 'cover'}
                    data-rotation={String(panoramaRotations[strip.bookIndex] ?? 0)}
                  />
                ) : (
                  <SlotPlus data-print="false">+</SlotPlus>
                )}
              </PanoramaStripButton>
            )
          })
        : null}
      {slotRects.map((rect) => {
        const src = images[rect.index]
        const hasImage = Boolean(src)
        const isActive = !isFoldPanorama && activeSlot === rect.index
        const col = rect.index % gridCols
        const row = Math.floor(rect.index / gridCols)
        const bookIndex =
          layout.kind === 'fold' ? Math.floor(rect.index / gridCols) : row
        const cellBorders = refillSheetCellBorders(showBorder, borderColor, {
          col,
          row,
          cols: gridCols,
          rows: gridRows,
        })

        if (isFoldPanorama) {
          return (
            <SlotButton
              key={rect.index}
              type="button"
              data-slot-button
              hasImage={false}
              isActive={activePanoramaBook === bookIndex}
              slotLeft={rect.left}
              slotTop={rect.top}
              slotWidth={rect.width}
              slotHeight={rect.height}
              style={{
                ...cellBorders,
                backgroundColor: 'transparent',
                border: 'none',
                boxShadow: 'none',
                zIndex: 3,
                pointerEvents: 'none',
              }}
              tabIndex={-1}
              aria-hidden
            />
          )
        }

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
            style={cellBorders}
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
  const fileInputPanoramaRef = useRef<HTMLInputElement>(null)
  const filePickPanoramaRef = useRef<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [guideImage, setGuideImage] = useState('')
  const [guideImageFit, setGuideImageFit] = useState<GuideImageFit>('contain')
  const [guideImageRotation, setGuideImageRotation] = useState(0)
  const [images, setImages] = useState<Record<number, string>>({})
  const [imageFitModes, setImageFitModes] = useState<Record<number, GuideImageFit>>({})
  const [imageRotations, setImageRotations] = useState<Record<number, number>>({})
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  const { refillW, refillH } = useMemo(
    () => resolveRefillDimensions(routeState),
    [routeState],
  )

  const [showHoleGuide, setShowHoleGuide] = useState(true)
  const [holeSide, setHoleSide] = useState<HoleSide>('left')
  const [imageAreaMode, setImageAreaMode] = useState<ImageAreaMode>('avoid')
  const [backgroundOptionsOpen, setBackgroundOptionsOpen] = useState(false)
  const [borderColor, setBorderColor] = useState<string>(DEFAULT_BORDER_COLOR)
  const [uniformSheetImage, setUniformSheetImage] = useState(false)
  const [foldImageMode, setFoldImageMode] = useState<FoldImageMode>('panels')
  const [panoramaImages, setPanoramaImages] = useState<Record<number, string>>({})
  const [panoramaFitModes, setPanoramaFitModes] = useState<Record<number, GuideImageFit>>({})
  const [panoramaRotations, setPanoramaRotations] = useState<Record<number, number>>({})
  const [activePanoramaBook, setActivePanoramaBook] = useState<number | null>(null)

  const layoutMode = routeState?.layoutMode ?? ''
  const isFoldLayout = isFoldLayoutMode(layoutMode)
  const foldCount = foldCountFromMode(layoutMode) || 3
  const isFoldPanoramaMode = isFoldLayout && foldImageMode === 'panorama'

  useEffect(() => {
    if (!isImagesMode || isFoldPanoramaMode) return
    const hasImages = Object.keys(images).length > 0
    if (hasImages && activeSlot === null) {
      setActiveSlot(0)
    }
    if (!hasImages) {
      setActiveSlot(null)
    }
  }, [images, isImagesMode, isFoldPanoramaMode, activeSlot])

  useEffect(() => {
    if (!isImagesMode || !isFoldPanoramaMode) return
    const hasPanorama = Object.keys(panoramaImages).length > 0
    if (hasPanorama && activePanoramaBook === null) {
      setActivePanoramaBook(0)
    }
    if (!hasPanorama) {
      setActivePanoramaBook(null)
    }
  }, [panoramaImages, isImagesMode, isFoldPanoramaMode, activePanoramaBook])

  const layoutParams = useMemo(
    () => ({
      refillW,
      refillH,
      layoutMode: routeState?.layoutMode,
      sizeId: routeState?.sizeId,
      customHoleStandard: routeState?.customHoleStandard,
      showHoleGuide,
      holeSide,
      borderColor,
      showBorder: true,
    }),
    [refillW, refillH, routeState, showHoleGuide, holeSide, borderColor],
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
    () =>
      getHolePositions(
        resolveSizePreset(routeState?.sizeId),
        routeState?.customHoleStandard,
      ),
    [routeState?.sizeId, routeState?.customHoleStandard],
  )

  const { handleSavePdf, handlePrint } = useStep4Capture({
    paperMetrics,
    previewLayout,
    printType,
    layoutParams,
    images,
    imageFitModes,
    imageRotations,
    foldImageMode,
    panoramaImages,
    panoramaFitModes,
    panoramaRotations,
    imageAreaMode,
    holeSide,
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

  const imageEditTarget = useMemo((): ImageEditTarget | null => {
    if (!isImagesMode) return null
    if (isFoldPanoramaMode) {
      if (activePanoramaBook === null) return null
      return { kind: 'panorama', index: activePanoramaBook }
    }
    if (activeSlot === null) return null
    return { kind: 'slot', index: activeSlot }
  }, [isImagesMode, isFoldPanoramaMode, activeSlot, activePanoramaBook])

  const resetAreaEditFocus = useCallback(() => {
    setActiveSlot(null)
    setActivePanoramaBook(null)
  }, [])

  const resetPanoramaState = useCallback(() => {
    const cleared = clearPanoramaState()
    setPanoramaImages(cleared.panoramaImages)
    setPanoramaFitModes(cleared.panoramaFitModes)
    setPanoramaRotations(cleared.panoramaRotations)
  }, [])

  const switchToPanelsFromPanorama = useCallback(() => {
    setFoldImageMode('panels')
    resetPanoramaState()
  }, [resetPanoramaState])

  const handleSlotClick = useCallback(
    (index: number) => {
      if (images[index]) {
        setActiveSlot(index)
        return
      }
      filePickSlotRef.current = index
      fileInputRef.current?.click()
    },
    [images],
  )

  const handlePanoramaClick = useCallback(
    (bookIndex: number) => {
      if (panoramaImages[bookIndex]) {
        setActivePanoramaBook(bookIndex)
        return
      }
      filePickPanoramaRef.current = bookIndex
      fileInputPanoramaRef.current?.click()
    },
    [panoramaImages],
  )

  const handlePanoramaInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    const bookIndex = filePickPanoramaRef.current
    filePickPanoramaRef.current = null
    if (!file || bookIndex === null) return

    const reader = new FileReader()
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result
      if (typeof result !== 'string') return
      setPanoramaImages((prev) => ({ ...prev, [bookIndex]: result }))
      setPanoramaRotations((prev) => ({ ...prev, [bookIndex]: prev[bookIndex] ?? 0 }))
      setActivePanoramaBook(bookIndex)
    }
    reader.readAsDataURL(file)
  }, [])

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
      if (imageEditTarget === null || !previewLayout) return
      if (imageEditTarget.kind === 'panorama') {
        setPanoramaFitModes((prev) => ({ ...prev, [imageEditTarget.index]: mode }))
        return
      }
      if (uniformSheetImage) {
        const total = getSlotCount(previewLayout)
        const next: Record<number, GuideImageFit> = {}
        for (let slot = 0; slot < total; slot += 1) {
          next[slot] = mode
        }
        setImageFitModes(next)
        return
      }
      setImageFitModes((prev) => ({ ...prev, [imageEditTarget.index]: mode }))
    },
    [imageEditTarget, previewLayout, uniformSheetImage],
  )

  const handleEditRotate = useCallback(() => {
    if (imageEditTarget === null || !previewLayout) return
    if (imageEditTarget.kind === 'panorama') {
      const bookIndex = imageEditTarget.index
      setPanoramaRotations((prev) => ({
        ...prev,
        [bookIndex]: ((prev[bookIndex] ?? 0) + 90) % 360,
      }))
      return
    }
    const slot = imageEditTarget.index
    const nextRotation = ((imageRotations[slot] ?? 0) + 90) % 360
    if (uniformSheetImage) {
      const total = getSlotCount(previewLayout)
      const next: Record<number, number> = {}
      for (let i = 0; i < total; i += 1) {
        next[i] = nextRotation
      }
      setImageRotations(next)
      return
    }
    setImageRotations((prev) => ({
      ...prev,
      [slot]: nextRotation,
    }))
  }, [imageEditTarget, imageRotations, previewLayout, uniformSheetImage])

  const handleEditReplace = useCallback(() => {
    if (imageEditTarget?.kind === 'panorama') {
      filePickPanoramaRef.current = imageEditTarget.index
      fileInputPanoramaRef.current?.click()
      return
    }
    if (imageEditTarget?.kind === 'slot') {
      filePickSlotRef.current = imageEditTarget.index
    }
    fileInputRef.current?.click()
  }, [imageEditTarget])

  const handleEditDelete = useCallback(() => {
    if (imageEditTarget === null) return
    if (imageEditTarget.kind === 'panorama') {
      const bookIndex = imageEditTarget.index
      setPanoramaImages((prev) => {
        const next = { ...prev }
        delete next[bookIndex]
        return next
      })
      setPanoramaFitModes((prev) => {
        const next = { ...prev }
        delete next[bookIndex]
        return next
      })
      setPanoramaRotations((prev) => {
        const next = { ...prev }
        delete next[bookIndex]
        return next
      })
      resetAreaEditFocus()
      return
    }
    if (uniformSheetImage) {
      setImages({})
      setImageFitModes({})
      setImageRotations({})
      setUniformSheetImage(false)
      resetAreaEditFocus()
      return
    }
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
  }, [imageEditTarget, resetAreaEditFocus, uniformSheetImage])

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
        if (isFoldPanoramaMode) {
          switchToPanelsFromPanorama()
        }
        setImages((prev) => placeImagesInEmptySlots(prev, urls, total))
        setUniformSheetImage(false)
        setActiveSlot(0)
      })
    },
    [previewLayout, isFoldPanoramaMode, switchToPanelsFromPanorama],
  )

  const handleFillInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || !previewLayout) return

      const total = getSlotCount(previewLayout)
      if (total <= 0) return

      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result
        if (typeof result !== 'string') return
        if (isFoldPanoramaMode) {
          switchToPanelsFromPanorama()
        }
        const applied = applyImageToAllSlots(total, result)
        setImages(applied.images)
        setImageFitModes(applied.imageFitModes)
        setImageRotations(applied.imageRotations)
        setUniformSheetImage(true)
        setActiveSlot(0)
        setActivePanoramaBook(null)
      }
      reader.readAsDataURL(file)
    },
    [previewLayout, isFoldPanoramaMode, switchToPanelsFromPanorama],
  )

  const handleFillAllImages = useCallback(() => {
    fileInputFillRef.current?.click()
  }, [])

  const handleClearAllImages = useCallback(() => {
    setImages({})
    setImageFitModes({})
    setImageRotations({})
    setUniformSheetImage(false)
    resetPanoramaState()
    resetAreaEditFocus()
  }, [resetAreaEditFocus, resetPanoramaState])

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
        foldImageMode={foldImageMode}
        images={images}
        imageFitModes={imageFitModes}
        imageRotations={imageRotations}
        panoramaImages={panoramaImages}
        panoramaFitModes={panoramaFitModes}
        panoramaRotations={panoramaRotations}
        activeSlot={activeSlot}
        activePanoramaBook={activePanoramaBook}
        onSlotClick={handleSlotClick}
        onPanoramaClick={handlePanoramaClick}
        layoutParams={layoutParams}
        showHoleGuide={showHoleGuide}
        imageAreaMode={imageAreaMode}
        borderColor={borderColor}
        showBorder
      />
    ) : isImagesMode ? (
      <PreviewFallback>このサイズ・レイアウトではプレビューを表示できません。</PreviewFallback>
    ) : (
      printTypePreview
    )

  const backgroundLeftColumn = isBackgroundMode ? (
    <Box className="step4-side-column" aria-label="背景画像の操作">
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
    </Box>
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
    <ActionRow className="step4-action-row">
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
          {imageEditTarget.kind === 'panorama'
            ? `パノラマ編集：${imageEditTarget.index + 1}冊目の帯を編集中`
            : uniformSheetImage
              ? '全枠に同じ画像を配置中。編集は全エリアに反映されます'
              : `個別編集モード：${imageEditTarget.index + 1}枚目を編集中`}
        </ImagesEditModeBanner>
      ) : uniformSheetImage && Object.keys(images).length > 0 ? (
        <ImagesEditModeBanner>
          全枠に同じ画像を配置中。枠をタップして編集できます
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

  const editPanelOpen = imageEditTarget !== null

  return (
    <AppLayout
      header={{
        backTo: '/tool/step3',
        backLabel: '← Step3に戻る',
        backState: {
          sizeId: routeState?.sizeId,
          customW: routeState?.customW,
          customH: routeState?.customH,
          customHoleStandard: routeState?.customHoleStandard,
          layoutMode: routeState?.layoutMode,
        },
      }}
      containerVariant="step4"
      containerProps={{
        'data-edit-panel-open': editPanelOpen ? 'true' : undefined,
      }}
    >
        <StepBar currentStep={4} />
        {isImagesMode ? (
          <>
            <Step4PageHeaderBlock title={pageHeading} subtext={layoutSubtext} />
            <Box className="step4-two-column step4-two-column--images">
              <Step4ImagesSidePanel
                images={images}
                isFoldLayout={isFoldLayout}
                foldCount={foldCount}
                foldImageMode={foldImageMode}
                onFoldImageModeChange={setFoldImageMode}
                fileInputRef={fileInputRef}
                fileInputMultiRef={fileInputMultiRef}
                fileInputFillRef={fileInputFillRef}
                fileInputPanoramaRef={fileInputPanoramaRef}
                imageAreaMode={imageAreaMode}
                onImageAreaModeChange={setImageAreaMode}
                onClearAllImages={handleClearAllImages}
                onFillAllImages={handleFillAllImages}
                onFileInput={handleFileInput}
                onMultiInput={handleMultiInput}
                onFillInput={handleFillInput}
                onPanoramaInput={handlePanoramaInput}
              />
              <Box className="step4-main-column">{rightColumnContent}</Box>
            </Box>
          </>
        ) : isBackgroundMode ? (
          <>
            <Step4PageHeaderBlock title={pageHeading} subtext={layoutSubtext} />
            <Box className="step4-two-column">
              {backgroundLeftColumn}
              <Box className="step4-main-column">{rightColumnContent}</Box>
            </Box>
          </>
        ) : (
          <Box className="step4-single-column">{mainBlock}</Box>
        )}

      {isImagesMode ? (
        <Step4EditModal
          open={imageEditTarget !== null}
          slotIndex={
            imageEditTarget?.kind === 'slot' ? imageEditTarget.index : null
          }
          editTitle={
            imageEditTarget?.kind === 'panorama'
              ? `パノラマエリア${imageEditTarget.index + 1}を編集`
              : undefined
          }
          imageSrc={
            imageEditTarget?.kind === 'panorama'
              ? panoramaImages[imageEditTarget.index] ?? null
              : imageEditTarget?.kind === 'slot'
                ? images[imageEditTarget.index] ?? null
                : null
          }
          fitMode={
            imageEditTarget?.kind === 'panorama'
              ? panoramaFitModes[imageEditTarget.index] ?? 'cover'
              : imageEditTarget?.kind === 'slot'
                ? imageFitModes[imageEditTarget.index] ?? 'cover'
                : 'cover'
          }
          rotation={
            imageEditTarget?.kind === 'panorama'
              ? panoramaRotations[imageEditTarget.index] ?? 0
              : imageEditTarget?.kind === 'slot'
                ? imageRotations[imageEditTarget.index] ?? 0
                : 0
          }
          previewW={
            imageEditTarget?.kind === 'panorama' && previewLayout
              ? getFoldPanoramaPreviewMm(previewLayout, imageAreaMode)?.previewW ??
                previewLayout.refillW
              : previewLayout?.refillW ?? 53
          }
          previewH={
            imageEditTarget?.kind === 'panorama' && previewLayout
              ? getFoldPanoramaPreviewMm(previewLayout, imageAreaMode)?.previewH ??
                previewLayout.refillH
              : previewLayout?.refillH ?? 85
          }
          onClose={resetAreaEditFocus}
          onSetFit={handleEditSetFit}
          onRotate={handleEditRotate}
          onReplace={handleEditReplace}
          onDelete={handleEditDelete}
        />
      ) : null}
    </AppLayout>
  )
}
