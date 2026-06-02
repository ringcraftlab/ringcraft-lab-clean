import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { Fragment } from 'react'

export type StepBarStep = 1 | 2 | 3 | 4

const STEPS: { step: StepBarStep; label: string }[] = [
  { step: 1, label: '写真を追加' },
  { step: 2, label: 'レイアウトを選ぶ' },
  { step: 3, label: '印刷タイプを選ぶ' },
  { step: 4, label: '画像を配置・編集' },
]

type StepState = 'completed' | 'active' | 'upcoming'

export interface StepBarProps {
  currentStep: StepBarStep
}

const Bar = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  width: '100%',
  marginBottom: '24px',
})

const StepItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  flex: '1 1 0',
  minWidth: 0,
})

const StepNumber = styled('span', {
  shouldForwardProp: (prop) => prop !== 'state',
})<{ state: StepState }>(({ state }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: `2px solid ${state === 'active' ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor:
    state === 'active'
      ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
      : 'var(--color-surface)',
  color:
    state === 'active'
      ? 'var(--color-primary)'
      : state === 'completed'
        ? 'var(--color-muted)'
        : 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  fontWeight: state === 'active' ? 700 : 500,
  lineHeight: 1,
  opacity: state === 'completed' ? 0.5 : 1,
  flexShrink: 0,
}))

const StepLabel = styled('span', {
  shouldForwardProp: (prop) => prop !== 'state',
})<{ state: StepState }>(({ state }) => ({
  color:
    state === 'active'
      ? 'var(--color-primary)'
      : state === 'completed'
        ? 'var(--color-muted)'
        : 'var(--color-text)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.6875rem',
  fontWeight: state === 'active' ? 700 : 500,
  lineHeight: 1.35,
  textAlign: 'center',
  opacity: state === 'completed' ? 0.5 : 1,
  width: '100%',
}))

const StepConnector = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  flex: '0 1 20px',
  minWidth: '12px',
  maxWidth: '32px',
  marginTop: '13px',
  padding: '0 2px',
  color: 'var(--color-border)',
  '&::before': {
    content: '""',
    flex: 1,
    height: 0,
    borderTop: '1px dashed var(--color-border)',
  },
  '&::after': {
    content: '"›"',
    flexShrink: 0,
    marginLeft: '2px',
    fontSize: '0.875rem',
    lineHeight: 1,
    color: 'var(--color-muted)',
    opacity: 0.7,
  },
})

function getStepState(step: StepBarStep, currentStep: StepBarStep): StepState {
  if (step < currentStep) return 'completed'
  if (step === currentStep) return 'active'
  return 'upcoming'
}

export default function StepBar({ currentStep }: StepBarProps) {
  return (
    <Bar aria-label="進行ステップ">
      {STEPS.map((item, index) => {
        const state = getStepState(item.step, currentStep)
        return (
          <Fragment key={item.step}>
            <StepItem aria-current={state === 'active' ? 'step' : undefined}>
              <StepNumber state={state}>{item.step}</StepNumber>
              <StepLabel state={state}>{item.label}</StepLabel>
            </StepItem>
            {index < STEPS.length - 1 ? <StepConnector aria-hidden /> : null}
          </Fragment>
        )
      })}
    </Bar>
  )
}
