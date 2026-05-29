import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'

const CtaLink = styled(Link)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-surface)',
  textDecoration: 'none',
  borderRadius: 'var(--radius-btn)',
  fontWeight: 600,
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  transition: 'filter 0.2s ease',
  '&:hover': {
    filter: 'brightness(0.92)',
  },
})

const CtaLabel = styled('span')({
  lineHeight: 1.4,
})

const CtaIcon = styled('span')({
  fontSize: '1.35rem',
  lineHeight: 1,
})

/** LP メインCTA（ヒーロー・中段で共通） */
export default function HomeFlowCta() {
  return (
    <CtaLink to="/tool">
      <CtaLabel>リフィルを作ってみる</CtaLabel>
      <CtaIcon aria-hidden>›</CtaIcon>
    </CtaLink>
  )
}
