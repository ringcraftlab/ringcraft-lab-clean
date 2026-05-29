import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { AppHeaderBrandIcon } from '../components/AppHeaderBrandIcon'
import AppButton from '../components/AppButton'
import LayoutGridIcon from '../components/LayoutGridIcon'
import { buildWizardLayoutOptions, type WizardLayoutOption } from '../utils/refillSetupOptions'

const DEMO_REFILL_W = 62
const DEMO_REFILL_H = 105
const LAYOUT_OPTIONS = buildWizardLayoutOptions(DEMO_REFILL_W, DEMO_REFILL_H)
const DEFAULT_SELECTED_INDEX = 0

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
  margin: '0 0 12px',
  fontFamily: 'var(--font-heading)',
})

const PageSubtext = styled('p')({
  color: 'var(--color-muted)',
  fontSize: '0.95rem',
  lineHeight: 1.6,
  margin: '0 0 28px',
})

const LayoutGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
  marginBottom: '40px',
})

const LayoutCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'disabled',
})<{ selected?: boolean; disabled?: boolean }>(({ selected, disabled }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '20px 16px',
  borderRadius: 'var(--radius-card)',
  border: `2px solid ${
    disabled ? 'var(--color-border)' : selected ? 'var(--color-primary)' : 'var(--color-border)'
  }`,
  backgroundColor: disabled
    ? 'var(--color-surface)'
    : selected
      ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
      : 'var(--color-surface)',
  opacity: disabled ? 0.55 : 1,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'border-color 0.2s ease, background-color 0.2s ease, opacity 0.2s ease',
  ...(!disabled && {
    '&:hover': {
      borderColor: 'var(--color-primary)',
    },
  }),
}))

const IconWrap = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '72px',
})

const LayoutCardTitle = styled('p', {
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ disabled }) => ({
  margin: 0,
  color: disabled ? 'var(--color-muted)' : 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1rem',
  lineHeight: 1.4,
  textAlign: 'center',
}))

const LayoutCardDetail = styled('p', {
  shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ disabled }) => ({
  margin: 0,
  color: disabled ? 'var(--color-muted)' : 'var(--color-text)',
  fontSize: '0.85rem',
  lineHeight: 1.5,
  textAlign: 'center',
}))

const Actions = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
})

function isOptionDisabled(option: WizardLayoutOption): boolean {
  return option.kind === 'fold' && !option.supported
}

export default function Step2() {
  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackButton type="button">← Step1に戻る</BackButton>
        </HeaderInner>
        <HeaderTitle>
          <AppHeaderBrandIcon />
          リフィル作成
        </HeaderTitle>
      </Header>

      <Container>
        <StepBadge>Step2</StepBadge>
        <PageHeading>作り方は？</PageHeading>
        <PageSubtext>M5（62×105mm）向けのレイアウトです。</PageSubtext>

        <LayoutGrid>
          {LAYOUT_OPTIONS.map((option, index) => {
            const disabled = isOptionDisabled(option)
            const selected = !disabled && index === DEFAULT_SELECTED_INDEX

            return (
              <LayoutCard key={option.id} selected={selected} disabled={disabled}>
                <IconWrap>
                  <LayoutGridIcon
                    option={option}
                    refillW={DEMO_REFILL_W}
                    refillH={DEMO_REFILL_H}
                    active={selected}
                  />
                </IconWrap>
                <LayoutCardTitle disabled={disabled}>{option.title}</LayoutCardTitle>
                <LayoutCardDetail disabled={disabled}>{option.detail}</LayoutCardDetail>
              </LayoutCard>
            )
          })}
        </LayoutGrid>

        <Actions>
          <AppButton type="button">次へ：印刷タイプを選ぶ</AppButton>
        </Actions>
      </Container>
    </Page>
  )
}
