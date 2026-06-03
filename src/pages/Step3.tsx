import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import AppButton from '../components/AppButton'
import StepBar from '../components/StepBar'
import PrintTypePreview, { type PrintTypePreviewVariant } from '../components/PrintTypePreview'
import { SIZES } from '../config/sizes'
import { PRINT_TYPES } from '../utils/refillSetupOptions'

type Step3LocationState = {
  sizeId?: string
  customW?: number
  customH?: number
  customHoleStandard?: string
  layoutMode?: string
}

const PrintTypeGrid = styled(Box)({})

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

const Actions = styled(Box)({})

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
      customHoleStandard: routeState?.customHoleStandard,
    }),
    [refillW, refillH, routeState],
  )

  const [selectedPrintTypeId, setSelectedPrintTypeId] = useState<string>(
    PRINT_TYPES[0]?.id ?? 'frame',
  )

  const hasLayout = Boolean(routeState?.layoutMode)

  const goToStep4 = () => {
    if (!hasLayout || !selectedPrintTypeId) return

    navigate('/tool/step4', {
      state: {
        sizeId: routeState?.sizeId,
        customW: routeState?.customW,
        customH: routeState?.customH,
        customHoleStandard: routeState?.customHoleStandard,
        layoutMode: routeState?.layoutMode,
        printType: selectedPrintTypeId,
      },
    })
  }

  return (
    <AppLayout
      header={{
        backTo: '/tool/step2',
        backLabel: '← Step2に戻る',
        backState: {
          sizeId: routeState?.sizeId,
          customW: routeState?.customW,
          customH: routeState?.customH,
          customHoleStandard: routeState?.customHoleStandard,
        },
      }}
      containerVariant="wizard"
    >
        <StepBar currentStep={3} />
        <span className="wizard-step-badge">Step3</span>
        <h2 className="wizard-heading">印刷タイプは？</h2>

        <PrintTypeGrid className="wizard-print-type-grid">
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

        <Actions className="wizard-actions">
          <AppButton
            type="button"
            disabled={!hasLayout || !selectedPrintTypeId}
            onClick={goToStep4}
          >
            プレビューへ
          </AppButton>
        </Actions>
    </AppLayout>
  )
}
