import Box from '@mui/material/Box'
import MuiToggleButton from '@mui/material/ToggleButton'
import MuiToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'
import { useCallback, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppButton from '../components/AppButton'
import PrintTypePreview, { type PrintTypePreviewVariant } from '../components/PrintTypePreview'
import { getHolePositions, SIZES, type SizeDefinition } from '../config/sizes'
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

type HoleSide = 'left' | 'right'
type GuideImageFit = 'contain' | 'cover' | 'fill'

const GUIDE_IMAGE_FIT_OPTIONS: { id: GuideImageFit; label: string }[] = [
  { id: 'cover', label: 'トリミング' },
  { id: 'contain', label: '全体表示' },
  { id: 'fill', label: '引き延ばし' },
]

const BORDER_COLOR_PRESETS = [
  { id: 'gray', label: 'グレー', hex: '#b0a89e' },
  { id: 'pink', label: 'ピンク', hex: '#e8a0a0' },
  { id: 'light-pink', label: '薄ピンク', hex: '#f0c0c0' },
  { id: 'green', label: 'グリーン', hex: '#8fbfb0' },
  { id: 'blue', label: 'ブルー', hex: '#6080a8' },
  { id: 'purple', label: 'パープル', hex: '#9080b0' },
  { id: 'black', label: 'ブラック', hex: '#000000' },
] as const

const PRINT_TYPE_HEADINGS: Record<string, string> = {
  frame: 'リフィル枠を印刷',
  background: '背景画像を印刷',
  images: '個別画像を挿入',
}

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

const SideColumn = styled(Box)({
  width: '280px',
  flexShrink: 0,
  minHeight: '120px',
  padding: '24px',
  boxSizing: 'border-box',
})

const ImagesSidePanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  gap: '16px',
  width: '100%',
  minWidth: 0,
})

const ImagesPickButton = styled(AppButton)({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
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
    opacity: 0.6,
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
  backgroundColor: hasImage
    ? 'var(--color-surface)'
    : 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))',
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

const PreviewWrap = styled(Box)({
  width: '100%',
  marginBottom: '28px',
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

const SettingsPanel = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '32px',
})

const SettingsRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'muted',
})<{ muted?: boolean }>(({ muted }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  opacity: muted ? 0.55 : 1,
}))

const SettingsLabel = styled('span')({
  color: 'var(--color-text-h)',
  fontWeight: 600,
  fontSize: '0.9rem',
  flexShrink: 0,
})

const SettingsControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
})

const SettingsToggleButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'disabled',
})<{ active?: boolean; disabled?: boolean }>(({ active, disabled }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  height: '28px',
  padding: '0 12px',
  borderRadius: '6px',
  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  fontWeight: active ? 600 : 500,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.45 : 1,
  '&:hover': disabled
    ? undefined
    : {
        borderColor: 'var(--color-primary)',
      },
}))

const ColorSwatchRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
})

const ColorSwatch = styled('button', {
  shouldForwardProp: (prop) => prop !== 'swatchColor' && prop !== 'selected',
})<{ swatchColor: string; selected?: boolean }>(({ swatchColor, selected }) => ({
  width: '28px',
  height: '28px',
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  backgroundColor: swatchColor,
  cursor: 'pointer',
  boxShadow: selected
    ? '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary)'
    : '0 0 0 1px var(--color-border)',
  '&:hover': {
    boxShadow: '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary)',
  },
}))

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

function previewVariantFor(printType: string): PrintTypePreviewVariant {
  if (printType === 'background' || printType === 'images') return printType
  return 'frame'
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

type SlotRectPercent = {
  index: number
  left: number
  top: number
  width: number
  height: number
}

function buildSlotRects(layout: PrintTypePreviewLayout): SlotRectPercent[] {
  const { paperW, paperH, refillW, refillH } = layout
  const slots: SlotRectPercent[] = []

  if (layout.kind === 'fold') {
    const { marginX, marginY, bookCount, foldCount, panelW, holeZoneMm } = layout.fold
    for (let row = 0; row < bookCount; row += 1) {
      for (let col = 0; col < foldCount; col += 1) {
        const index = row * foldCount + col
        const x = marginX + holeZoneMm + col * panelW
        const y = marginY + row * refillH
        slots.push({
          index,
          left: (x / paperW) * 100,
          top: (y / paperH) * 100,
          width: (panelW / paperW) * 100,
          height: (refillH / paperH) * 100,
        })
      }
    }
    return slots
  }

  const { cols, rows, marginX, marginY } = layout
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col
      const x = marginX + col * refillW
      const y = marginY + row * refillH
      slots.push({
        index,
        left: (x / paperW) * 100,
        top: (y / paperH) * 100,
        width: (refillW / paperW) * 100,
        height: (refillH / paperH) * 100,
      })
    }
  }
  return slots
}

interface ImagesSlotPreviewProps {
  layout: PrintTypePreviewLayout
  images: Record<number, string>
  activeSlot: number | null
  onSlotClick: (index: number) => void
  layoutParams: PrintTypePreviewLayoutParams
  showHoleGuide: boolean
}

function ImagesSlotPreview({
  layout,
  images,
  activeSlot,
  onSlotClick,
  layoutParams,
  showHoleGuide,
}: ImagesSlotPreviewProps) {
  const aspectRatio = `${layout.paperW} / ${layout.paperH}`
  const slotRects = useMemo(() => buildSlotRects(layout), [layout])

  return (
    <ImagesPaperFrame aspectRatio={aspectRatio}>
      {slotRects.map((rect) => {
        const src = images[rect.index]
        const hasImage = Boolean(src)
        const isActive = activeSlot === rect.index

        return (
          <SlotButton
            key={rect.index}
            type="button"
            hasImage={hasImage}
            isActive={isActive}
            slotLeft={rect.left}
            slotTop={rect.top}
            slotWidth={rect.width}
            slotHeight={rect.height}
            aria-label={hasImage ? `${rect.index + 1}番の写真` : `${rect.index + 1}番に写真を追加`}
            onClick={() => onSlotClick(rect.index)}
          >
            {hasImage ? <SlotImage src={src} alt="" /> : <SlotPlus>+</SlotPlus>}
          </SlotButton>
        )
      })}
      {showHoleGuide ? (
        <ImagesPreviewOverlayLayer>
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
  const [guideImage, setGuideImage] = useState('')
  const [guideImageFit, setGuideImageFit] = useState<GuideImageFit>('contain')
  const [guideImageRotation, setGuideImageRotation] = useState(0)
  const [images, setImages] = useState<Record<number, string>>({})
  const [activeSlot, setActiveSlot] = useState<number | null>(null)

  const { refillW, refillH } = useMemo(
    () => resolveRefillDimensions(routeState),
    [routeState],
  )

  const [showHoleGuide, setShowHoleGuide] = useState(true)
  const [holeSide, setHoleSide] = useState<HoleSide>('left')

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

  const holePositions = useMemo(
    () => getHolePositions(resolveSizePreset(routeState?.sizeId)),
    [routeState?.sizeId],
  )

  const [borderColor, setBorderColor] = useState<string>(BORDER_COLOR_PRESETS[6].hex)

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
        activeSlot={activeSlot}
        onSlotClick={handleSlotClick}
        layoutParams={layoutParams}
        showHoleGuide={showHoleGuide}
      />
    ) : isImagesMode ? (
      <PreviewFallback>このサイズ・レイアウトではプレビューを表示できません。</PreviewFallback>
    ) : (
      printTypePreview
    )

  const imagesSideColumn = isImagesMode ? (
    <SideColumn aria-label="操作エリア">
      <ImagesSidePanel>
        <ImagesPickButton type="button" onClick={() => fileInputMultiRef.current?.click()}>
          写真を選ぶ
        </ImagesPickButton>
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
        />
        <HiddenFileInput
          ref={fileInputMultiRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleMultiInput}
        />
      </ImagesSidePanel>
    </SideColumn>
  ) : null

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

  const settingsBlock = (
    <SettingsPanel>
      <SettingsRow>
        <SettingsLabel>穴あけガイド</SettingsLabel>
        <SettingsControls>
          <SettingsToggleButton type="button" active={showHoleGuide} onClick={() => setShowHoleGuide(true)}>
            ON
          </SettingsToggleButton>
          <SettingsToggleButton
            type="button"
            active={!showHoleGuide}
            onClick={() => setShowHoleGuide(false)}
          >
            OFF
          </SettingsToggleButton>
        </SettingsControls>
      </SettingsRow>
      <SettingsRow muted={!showHoleGuide}>
        <SettingsLabel>穴の位置</SettingsLabel>
        <SettingsControls>
          <SettingsToggleButton
            type="button"
            active={holeSide === 'left'}
            disabled={!showHoleGuide}
            onClick={() => setHoleSide('left')}
          >
            左
          </SettingsToggleButton>
          <SettingsToggleButton
            type="button"
            active={holeSide === 'right'}
            disabled={!showHoleGuide}
            onClick={() => setHoleSide('right')}
          >
            右
          </SettingsToggleButton>
        </SettingsControls>
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>線の色</SettingsLabel>
        <SettingsControls>
          <ColorSwatchRow>
            {BORDER_COLOR_PRESETS.map((preset) => (
            <ColorSwatch
              key={preset.id}
              type="button"
              swatchColor={preset.hex}
              selected={borderColor === preset.hex}
              title={preset.label}
              aria-label={preset.label}
              aria-pressed={borderColor === preset.hex}
              onClick={() => setBorderColor(preset.hex)}
            />
            ))}
          </ColorSwatchRow>
        </SettingsControls>
      </SettingsRow>
    </SettingsPanel>
  )

  const actionBlock = (
    <ActionRow>
      <OutlineAppButton type="button">PDF保存</OutlineAppButton>
      <AppButton type="button">印刷する</AppButton>
    </ActionRow>
  )

  const mainContent = (
    <>
      {backgroundImagePicker}
      <PreviewWrap data-hole-count={holePositions.length}>{previewContent}</PreviewWrap>
      {backgroundImageControls}
      {settingsBlock}
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
            <StepBadgeRow align="start">
              <StepBadge>Step4</StepBadge>
            </StepBadgeRow>
            <PageHeading>{pageHeading}</PageHeading>
            <TwoColumnLayout>
              {imagesSideColumn}
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
