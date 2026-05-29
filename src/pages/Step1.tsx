import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SIZES, SIZE_PICKER_LINES } from '../config/sizes'
import AppButton from '../components/AppButton'

/** Step1 で表示するプリセット（sizes.ts の定義順とは別に UI 用） */
const STEP1_PRESET_IDS = ['microfive', 'm5square', 'mini6', 'bible'] as const

type Step1PresetId = (typeof STEP1_PRESET_IDS)[number]
type SelectedSizeId = Step1PresetId | 'custom'

interface PresetCardView {
  id: Step1PresetId
  title: string
  subtitle: string
  dims: string
}

function buildPresetCards(): PresetCardView[] {
  return STEP1_PRESET_IDS.map((id) => {
    const size = SIZES.find((entry) => entry.id === id)
    const lines = SIZE_PICKER_LINES[id]
    if (!size || !lines || size.w == null || size.h == null) {
      throw new Error(`Missing size definition for Step1 preset: ${id}`)
    }

    const title = id === 'm5square' ? size.name : lines[0]
    const subtitle = id === 'm5square' ? '' : lines[1]

    return {
      id,
      title,
      subtitle,
      dims: `${size.w}×${size.h}mm`,
    }
  })
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

const HeaderInner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: '0 24px',
})

const BackLink = styled(Link)({
  color: 'var(--color-muted)',
  textDecoration: 'none',
  fontWeight: 500,
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
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '18px',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
})

const Container = styled('div')({
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
  marginBottom: '28px',
})

const SizeGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '16px',
  marginBottom: '20px',
})

const SizeCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  cursor: 'pointer',
  borderRadius: 'var(--radius-card)',
  border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: selected ? 'var(--color-bg)' : 'var(--color-surface)',
  boxShadow: 'none',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const SizeCardBody = styled(Box)({
  padding: '20px 16px',
  textAlign: 'center',
})

const SizeCardTitle = styled('p')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1.05rem',
  lineHeight: 1.4,
})

const SizeCardSubtitle = styled('p')({
  margin: '6px 0 0',
  color: 'var(--color-muted)',
  fontSize: '0.85rem',
  lineHeight: 1.5,
  minHeight: '1.25em',
})

const SizeCardDims = styled('p')({
  margin: '10px 0 0',
  color: 'var(--color-text)',
  fontWeight: 500,
  fontSize: '0.9rem',
})

const CustomCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ selected }) => ({
  cursor: 'pointer',
  borderRadius: 'var(--radius-card)',
  border: `2px dashed ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: selected ? 'var(--color-bg)' : 'var(--color-surface)',
  boxShadow: 'none',
  marginBottom: '40px',
}))

const CustomCardBody = styled(Box)({
  padding: '20px 24px',
})

const CustomCardLabel = styled('p')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontWeight: 600,
  fontSize: '1rem',
})

const CustomFields = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 160px))',
  gap: '16px',
  marginTop: '16px',
})

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

const Actions = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
})

function parsePositiveMm(value: string): number | null {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export default function Step1() {
  const presetCards = useMemo(() => buildPresetCards(), [])

  const [selectedId, setSelectedId] = useState<SelectedSizeId | null>(null)
  const [customExpanded, setCustomExpanded] = useState(false)
  const [customWidth, setCustomWidth] = useState('')
  const [customHeight, setCustomHeight] = useState('')

  const customValid =
    parsePositiveMm(customWidth) !== null && parsePositiveMm(customHeight) !== null

  const hasSelection =
    selectedId !== null && (selectedId !== 'custom' || customValid)

  const selectPreset = (id: Step1PresetId) => {
    setSelectedId(id)
    setCustomExpanded(false)
  }

  const openCustom = () => {
    setSelectedId('custom')
    setCustomExpanded(true)
  }

  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackLink to="/tool">← リフィル作成に戻る</BackLink>
        </HeaderInner>
        <HeaderTitle>🔖 リフィル作成</HeaderTitle>
      </Header>

      <Container>
        <StepBadge>Step1</StepBadge>
        <PageHeading>あなたの手帳のサイズは？</PageHeading>

        <SizeGrid>
          {presetCards.map((size) => (
            <SizeCard
              key={size.id}
              selected={selectedId === size.id}
              onClick={() => selectPreset(size.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  selectPreset(size.id)
                }
              }}
            >
              <SizeCardBody>
                <SizeCardTitle>{size.title}</SizeCardTitle>
                {size.subtitle ? (
                  <SizeCardSubtitle>{size.subtitle}</SizeCardSubtitle>
                ) : (
                  <SizeCardSubtitle aria-hidden="true">&nbsp;</SizeCardSubtitle>
                )}
                <SizeCardDims>{size.dims}</SizeCardDims>
              </SizeCardBody>
            </SizeCard>
          ))}
        </SizeGrid>

        <CustomCard
          selected={selectedId === 'custom'}
          onClick={() => openCustom()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openCustom()
            }
          }}
        >
          <CustomCardBody>
            <CustomCardLabel>カスタムサイズ（mmで入力）</CustomCardLabel>
            {customExpanded ? (
              <CustomFields
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
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
              </CustomFields>
            ) : null}
          </CustomCardBody>
        </CustomCard>

        <Actions>
          <AppButton type="button" disabled={!hasSelection}>
            次へ：作り方を選ぶ
          </AppButton>
        </Actions>
      </Container>
    </Page>
  )
}
