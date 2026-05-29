import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppButton from '../components/AppButton'
import PrintTypePreview, { type PrintTypePreviewVariant } from '../components/PrintTypePreview'
import { getHolePositions, SIZES, type SizeDefinition } from '../config/sizes'
import { buildPrintTypePreviewLayout } from '../utils/printTypePreviewLayout'

type Step4LocationState = {
  sizeId?: string
  customW?: number
  customH?: number
  layoutMode?: string
  printType?: string
}

type HoleSide = 'left' | 'right'

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
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
  gap: '24px',
  alignItems: 'start',
})

const SideColumn = styled(Box)({
  minHeight: '120px',
})

const MainColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
})

const StepBadge = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 14px',
  borderRadius: 'var(--radius-btn)',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-surface)',
  fontWeight: 600,
  fontSize: '0.8rem',
  marginBottom: '16px',
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

const ToggleButton = styled('button', {
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

export default function Step4() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? null) as Step4LocationState | null

  const printType = routeState?.printType ?? 'frame'
  const isImagesMode = printType === 'images'
  const pageHeading = PRINT_TYPE_HEADINGS[printType] ?? PRINT_TYPE_HEADINGS.frame

  const { refillW, refillH } = useMemo(
    () => resolveRefillDimensions(routeState),
    [routeState],
  )

  const layoutParams = useMemo(
    () => ({
      refillW,
      refillH,
      layoutMode: routeState?.layoutMode,
      sizeId: routeState?.sizeId,
    }),
    [refillW, refillH, routeState],
  )

  const previewLayout = useMemo(
    () => buildPrintTypePreviewLayout(layoutParams),
    [layoutParams],
  )

  const holePositions = useMemo(
    () => getHolePositions(resolveSizePreset(routeState?.sizeId)),
    [routeState?.sizeId],
  )

  const [showHoleGuide, setShowHoleGuide] = useState(true)
  const [holeSide, setHoleSide] = useState<HoleSide>('left')
  const [borderColor, setBorderColor] = useState<string>(BORDER_COLOR_PRESETS[6].hex)

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

  const previewContent = previewLayout ? (
    <PrintTypePreview
      variant={previewVariantFor(printType)}
      layoutParams={layoutParams}
      emphasized
    />
  ) : (
    <PreviewFallback>このサイズ・レイアウトではプレビューを表示できません。</PreviewFallback>
  )

  const settingsBlock = (
    <SettingsPanel>
      <SettingsRow>
        <SettingsLabel>穴あけガイド</SettingsLabel>
        <SettingsControls>
          <ToggleButton type="button" active={showHoleGuide} onClick={() => setShowHoleGuide(true)}>
            ON
          </ToggleButton>
          <ToggleButton
            type="button"
            active={!showHoleGuide}
            onClick={() => setShowHoleGuide(false)}
          >
            OFF
          </ToggleButton>
        </SettingsControls>
      </SettingsRow>
      <SettingsRow muted={!showHoleGuide}>
        <SettingsLabel>穴の位置</SettingsLabel>
        <SettingsControls>
          <ToggleButton
            type="button"
            active={holeSide === 'left'}
            disabled={!showHoleGuide}
            onClick={() => setHoleSide('left')}
          >
            左
          </ToggleButton>
          <ToggleButton
            type="button"
            active={holeSide === 'right'}
            disabled={!showHoleGuide}
            onClick={() => setHoleSide('right')}
          >
            右
          </ToggleButton>
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

  const mainBlock = (
    <>
      <StepBadge>Step4</StepBadge>
      <PageHeading>{pageHeading}</PageHeading>
      <PreviewWrap data-hole-count={holePositions.length}>{previewContent}</PreviewWrap>
      {settingsBlock}
      {actionBlock}
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
          <TwoColumnLayout>
            <SideColumn aria-hidden />
            <MainColumn>{mainBlock}</MainColumn>
          </TwoColumnLayout>
        ) : (
          <SingleColumn>{mainBlock}</SingleColumn>
        )}
      </Container>
    </Page>
  )
}
