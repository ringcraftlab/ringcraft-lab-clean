import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppButton from '../components/AppButton'
import PrintTypePreview, { type PrintTypePreviewVariant } from '../components/PrintTypePreview'
import { SIZES } from '../config/sizes'
import { PRINT_TYPES } from '../utils/refillSetupOptions'

type Step3LocationState = {
  sizeId?: string
  customW?: number
  customH?: number
  layoutMode?: string
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
  margin: '0 0 28px',
})

const PrintTypeGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '16px',
  marginBottom: '40px',
})

const PrintTypeCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '12px',
  padding: '16px 14px 18px',
  borderRadius: 'var(--radius-card)',
  border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: selected
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const PreviewWrap = styled(Box)({
  width: '100%',
  lineHeight: 0,
})

const PrintTypeTitle = styled('p')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.4,
  textAlign: 'center',
})

const PrintTypeShortDesc = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontSize: '0.85rem',
  lineHeight: 1.4,
  textAlign: 'center',
})

const PrintTypeDesc = styled('p')({
  margin: 0,
  color: 'var(--color-text)',
  fontSize: '0.8rem',
  lineHeight: 1.5,
  textAlign: 'center',
})

const Actions = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
})

function resolveRefillDimensions(state: Step3LocationState | null): {
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

function previewVariantFor(id: string): PrintTypePreviewVariant {
  if (id === 'background' || id === 'images') return id
  return 'frame'
}

export default function Step3() {
  const navigate = useNavigate()
  const location = useLocation()
  const routeState = (location.state ?? null) as Step3LocationState | null

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

  const [selectedPrintTypeId, setSelectedPrintTypeId] = useState<string>(
    PRINT_TYPES[0]?.id ?? 'frame',
  )

  const hasLayout = Boolean(routeState?.layoutMode)

  const goBackToStep2 = () => {
    navigate('/tool/step2', {
      state: {
        sizeId: routeState?.sizeId,
        customW: routeState?.customW,
        customH: routeState?.customH,
      },
    })
  }

  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackButton type="button" onClick={goBackToStep2}>
            ← Step2に戻る
          </BackButton>
        </HeaderInner>
        <HeaderTitle>
          <AppHeaderBrandIcon />
          リフィル作成
        </HeaderTitle>
      </Header>

      <Container>
        <StepBadge>Step3</StepBadge>
        <PageHeading>印刷タイプは？</PageHeading>

        <PrintTypeGrid>
          {PRINT_TYPES.map((printType) => {
            const selected = printType.id === selectedPrintTypeId

            return (
              <PrintTypeCard
                key={printType.id}
                selected={selected}
                onClick={() => setSelectedPrintTypeId(printType.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedPrintTypeId(printType.id)
                  }
                }}
              >
                <PreviewWrap>
                  <PrintTypePreview
                    variant={previewVariantFor(printType.previewVariant)}
                    layoutParams={layoutParams}
                    compact
                    emphasized={selected}
                  />
                </PreviewWrap>
                <PrintTypeTitle>{printType.title}</PrintTypeTitle>
                <PrintTypeShortDesc>{printType.shortDesc}</PrintTypeShortDesc>
                <PrintTypeDesc>{printType.desc}</PrintTypeDesc>
              </PrintTypeCard>
            )
          })}
        </PrintTypeGrid>

        <Actions>
          <AppButton type="button" disabled={!hasLayout || !selectedPrintTypeId}>
            プレビューへ
          </AppButton>
        </Actions>
      </Container>
    </Page>
  )
}
