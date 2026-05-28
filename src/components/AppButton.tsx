import Button, { type ButtonProps } from '@mui/material/Button'
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)({
  backgroundColor: 'var(--color-primary)',
  color: '#ffffff',
  borderRadius: 'var(--radius-btn)',
  fontFamily: 'var(--font-body)',
  textTransform: 'none',
  '&:hover': {
    filter: 'brightness(0.92)',
    backgroundColor: 'var(--color-primary)',
  },
})

export default function AppButton(props: ButtonProps) {
  return <StyledButton disableElevation {...props} />
}
