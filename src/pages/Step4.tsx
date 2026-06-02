import Box from '@mui/material/Box'
import MuiToggleButton from '@mui/material/ToggleButton'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppButton from '../components/AppButton'
import PrintTypePreview from '../components/PrintTypePreview'
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
import { getHolePositions, SIZES, type SizeDefinition } from '../config/sizes'
import { paperOrientationForLayout } from '../utils/layout'
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

const TwoColumnLayout = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '280px minmax(0, 1fr)',
  gap: '24px',
  alignItems: 'start',
})

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

const SlotImage = styled('img')({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

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
  backgroundColor: 'transparent',
  zIndex: layerZIndex,
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

const MainColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
})

const StepBadgeRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'align',
})<{ align?: 'start' | 'center' }>(({ align = 'center' }) => ({
  display: 'flex',
  justifyContent: align === 'start' ? 'flex-start' : 'center',
  width: '100%',
  marginBottom: '16px',
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

const PageHeading = styled('h2')({
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1.5rem',
  lineHeight: 1.4,
  margin: '0 0 24px',
  textAlign: 'center',
  width: '100%',
})

const ImagesModeHeader = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  gap: '16px',
  marginBottom: '24px',
})

const ImagesModeHeading = styled(PageHeading)({
  margin: 0,
  textAlign: 'left',
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
  marginBottom: '24px',
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
            {slotAreaMetrics.showHoleZoneInSlot ? (
              <SlotHoleZone
                holeSide={holeSide}
                zoneWidthPct={slotAreaMetrics.holeZoneWidthPct}
                layerZIndex={slotAreaMetrics.avoidsHole ? 2 : 1}
              />
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
                  data-fit-mode={imageFitModes[rect.index] ?? 'cover'}
                  data-rotation="0"
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
          <PrintTypePreview variant="frame" layoutParams={layoutParams} emphasized />
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
  const fileInputMultiRef = useRef<HTMLInputElement>(null)
  const fileInputFillRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [guideImage, setGuideImage] = useState('')
  const [guideImageFit, setGuideImageFit] = useState<GuideImageFit>('contain')
  const [guideImageRotation, setGuideImageRotation] = useState(0)
  const [images, setImages] = useState<Record<number, string>>({})
  const [imageFitModes] = useState<Record<number, GuideImageFit>>({})
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  const { refillW, refillH } = useMemo(
    () => resolveRefillDimensions(routeState),
    [routeState],
  )

  const [showHoleGuide, setShowHoleGuide] = useState(true)
  const [holeSide, setHoleSide] = useState<HoleSide>('left')
  const [imageAreaMode, setImageAreaMode] = useState<ImageAreaMode>('avoid')

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
  }, [])

  const handleSlotClick = useCallback((index: number) => {
    setActiveSlot(index)
    fileInputRef.current?.click()
  }, [])

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || activeSlot === null) return

      const reader = new FileReader()
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result
        if (typeof result !== 'string') return
        const slot = activeSlot
        setImages((prev) => ({ ...prev, [slot]: result }))
      }
      reader.readAsDataURL(file)
    },
    [activeSlot],
  )

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
  }, [])

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

  const backgroundImagePicker = isBackgroundMode ? (
    <BackgroundImagePanel>
      <HiddenFileInput
        ref={guideImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleGuideImageInput}
      />
      {!guideImage ? (
        <BackgroundImageActions>
          <AppButton type="button" onClick={() => guideImageInputRef.current?.click()}>
            背景画像を選ぶ
          </AppButton>
        </BackgroundImageActions>
      ) : null}
    </BackgroundImagePanel>
  ) : null

  const backgroundImageControls =
    isBackgroundMode && guideImage ? (
      <BackgroundImagePanel>
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
      </BackgroundImagePanel>
    ) : null

  const actionBlock = (
    <ActionRow>
      <OutlineAppButton type="button" onClick={() => void handleSavePdf()}>
        PDF保存
      </OutlineAppButton>
      <AppButton type="button" onClick={() => void handlePrint()}>
        印刷する
      </AppButton>
    </ActionRow>
  )

  const mainContent = (
    <>
      {backgroundImagePicker}
      <PreviewWrap ref={previewRef} data-hole-count={holePositions.length}>
        {previewContent}
      </PreviewWrap>
      {backgroundImageControls}
      <Step4SettingsBlock
        showHoleGuide={showHoleGuide}
        onShowHoleGuideChange={setShowHoleGuide}
        holeSide={holeSide}
        onHoleSideChange={setHoleSide}
        borderColor={borderColor}
        onBorderColorChange={setBorderColor}
      />
      {actionBlock}
    </>
  )

  const mainBlock = (
    <>
      <StepBadgeRow align={isImagesMode ? 'start' : 'center'}>
        <StepBadge>Step4</StepBadge>
      </StepBadgeRow>
      <PageHeading>{pageHeading}</PageHeading>
      {mainContent}
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
        {isImagesMode ? (
          <>
            <ImagesModeHeader>
              <StepBadge>Step4</StepBadge>
              <ImagesModeHeading>{pageHeading}</ImagesModeHeading>
            </ImagesModeHeader>
            <TwoColumnLayout>
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
              <MainColumn>{mainContent}</MainColumn>
            </TwoColumnLayout>
          </>
        ) : (
          <SingleColumn>{mainBlock}</SingleColumn>
        )}
      </Container>
    </Page>
  )
}
