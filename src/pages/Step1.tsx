import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import AppButton from '../components/AppButton'
import StepBar from '../components/StepBar'
import RefillSizeIcon from '../components/RefillSizeIcon'
import { HOLE_STANDARDS, SIZES } from '../config/sizes'

const STEP1_PRESET_IDS = ['microfive', 'm5square', 'mini6', 'bible'] as const

type Step1PresetId = (typeof STEP1_PRESET_IDS)[number]
type SelectedSizeId = Step1PresetId | 'custom'

const PRESET_SUBTITLES: Record<Step1PresetId, string> = {
  microfive: 'Micro5 / ミニ5',
  m5square: 'スクエア',
  mini6: 'ミニ6 / ポケットサイズ',
  bible: '聖書サイズ',
}

const SizeGrid = styled(Box)({})

const SizeCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  cursor: 'pointer',
  borderRadius: 'var(--radius-card)',
  border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: selected
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  padding: '20px 12px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const IconWrap = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '76px',
})

const SizeCardTitle = styled('p')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.4,
  textAlign: 'center',
})

const SizeCardSubtitle = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontSize: '0.8rem',
  lineHeight: 1.4,
  textAlign: 'center',
  minHeight: '1.2em',
})

const SizeCardDims = styled('p')({
  margin: 0,
  color: 'var(--color-text)',
  fontWeight: 500,
  fontSize: '0.85rem',
  textAlign: 'center',
})

const CustomCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  cursor: 'pointer',
  borderRadius: 'var(--radius-card)',
  border: `2px dashed ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: selected
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  padding: '20px 24px',
  marginBottom: '40px',
}))

const CustomCardLabel = styled('p')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontWeight: 600,
  fontSize: '1rem',
})

const CustomPanel = styled(Box)({
  marginTop: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
})

const CustomFieldsRow = styled(Box)({})

const HoleStandardSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

const HoleStandardLabel = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontSize: '0.85rem',
  fontWeight: 500,
})

const HoleStandardPills = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
})

const HoleStandardPill = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  color: active ? 'var(--color-text-h)' : 'var(--color-text)',
  borderRadius: 'var(--radius-btn)',
  padding: '6px 14px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const MmField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'var(--font-body)',
    backgroundColor: 'var(--color-surface)',
    '& fieldset': {
      borderColor: 'var(--color-border)',
    },
    '&:hover fieldset': {
      borderColor: 'var(--color-primary)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--color-primary)',
    },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'var(--font-body)',
    color: 'var(--color-muted)',
    '&.Mui-focused': {
      color: 'var(--color-primary)',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'var(--color-text-h)',
  },
})

const Actions = styled(Box)({})

function parsePositiveMm(value: string): number | null {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

function holeStandardLabel(standardId: string): string {
  const size = SIZES.find((entry) => entry.id === standardId)
  if (!size) return standardId
  return size.shortName ?? size.name
}

export default function Step1() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<SelectedSizeId | null>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')
  const [customHoleStandard, setCustomHoleStandard] = useState<string>('microfive')

  const customValid =
    parsePositiveMm(customWidth) !== null && parsePositiveMm(customHeight) !== null

  const hasSelection =
    selectedId !== null &&
    (selectedId !== 'custom' || customValid)

  const selectPreset = (id: Step1PresetId) => {
    setSelectedId(id)
    setCustomOpen(false)
  }

  const toggleCustom = () => {
    setSelectedId('custom')
    setCustomOpen((open) => !open)
  }

  const goToStep2 = () => {
    if (!hasSelection || selectedId === null) return

    if (selectedId === 'custom') {
      const customW = parsePositiveMm(customWidth)
      const customH = parsePositiveMm(customHeight)
      if (customW === null || customH === null) return

      navigate('/tool/step2', {
        state: {
          sizeId: 'custom',
          customW,
          customH,
          customHoleStandard,
        },
      })
      return
    }

    navigate('/tool/step2', {
      state: { sizeId: selectedId, customW: undefined, customH: undefined },
    })
  }

  return (
    <AppLayout
      header={{ backTo: '/tool', backLabel: '← リフィル作成に戻る' }}
      containerVariant="wizard"
    >
        <StepBar currentStep={1} />
        <span className="wizard-step-badge">Step1</span>
        <h2 className="wizard-heading">あなたの手帳のサイズは？</h2>

        <SizeGrid className="wizard-size-grid">
          {STEP1_PRESET_IDS.map((id) => {
            const size = SIZES.find((entry) => entry.id === id)
            if (!size || size.w == null || size.h == null) return null

            const title = size.name
            const subtitle = PRESET_SUBTITLES[id]
            const isActive = selectedId === id

            return (
              <SizeCard
                key={id}
                selected={isActive}
                onClick={() => selectPreset(id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    selectPreset(id)
                  }
                }}
              >
                <IconWrap>
                  <RefillSizeIcon sizeId={id} active={isActive} />
                </IconWrap>
                <SizeCardTitle>{title}</SizeCardTitle>
                <SizeCardSubtitle>{subtitle}</SizeCardSubtitle>
                <SizeCardDims>
                  {size.w}×{size.h}mm
                </SizeCardDims>
              </SizeCard>
            )
          })}
        </SizeGrid>

        <CustomCard
          selected={selectedId === 'custom'}
          onClick={() => toggleCustom()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              toggleCustom()
            }
          }}
        >
          <CustomCardLabel>カスタムサイズ（mmで入力）</CustomCardLabel>
          {customOpen ? (
            <CustomPanel
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <CustomFieldsRow className="wizard-custom-fields-row">
                <MmField
                  label="幅（mm）"
                  type="number"
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  value={customWidth}
                  onChange={(event) => {
                    setSelectedId('custom')
                    setCustomWidth(event.target.value)
                  }}
                  size="small"
                />
                <MmField
                  label="高さ（mm）"
                  type="number"
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  value={customHeight}
                  onChange={(event) => {
                    setSelectedId('custom')
                    setCustomHeight(event.target.value)
                  }}
                  size="small"
                />
              </CustomFieldsRow>
              <HoleStandardSection>
                <HoleStandardLabel>穴の規格</HoleStandardLabel>
                <HoleStandardPills>
                  {HOLE_STANDARDS.map((standard) => (
                    <HoleStandardPill
                      key={standard.id}
                      type="button"
                      active={customHoleStandard === standard.id}
                      onClick={() => {
                        setSelectedId('custom')
                        setCustomHoleStandard(standard.id)
                      }}
                    >
                      {holeStandardLabel(standard.id)}
                    </HoleStandardPill>
                  ))}
                </HoleStandardPills>
              </HoleStandardSection>
            </CustomPanel>
          ) : null}
        </CustomCard>

        <Actions className="wizard-actions">
          <AppButton type="button" disabled={!hasSelection} onClick={goToStep2}>
            次へ：作り方を選ぶ
          </AppButton>
        </Actions>
    </AppLayout>
  )
}
