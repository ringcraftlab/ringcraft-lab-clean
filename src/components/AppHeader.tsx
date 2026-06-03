import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import { AppHeaderBrandIcon } from './AppHeaderBrandIcon'

export interface AppHeaderProps {
  backTo: string
  /** Desktop / wide: full label e.g. 「← リフィル作成に戻る」 */
  backLabel: string
  title?: string
  backState?: object
  /** Home など戻る導線がないページでは false */
  showBack?: boolean
  /** 右端スロット（Home のグローバルナビなど） */
  trailing?: ReactNode
}

const HeaderBar = styled('header')({
  display: 'flex',
  alignItems: 'center',
  minHeight: '56px',
  backgroundColor: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
})

const HeaderInner = styled('div')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '0 24px',
  gap: '12px',
  boxSizing: 'border-box',
  minHeight: '56px',
  '@media (max-width: 900px)': {
    paddingLeft: '16px',
    paddingRight: '16px',
    gap: '8px',
  },
})

const BackLink = styled(Link)({
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '1rem',
  textDecoration: 'none',
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

const BackLabelFull = styled('span')({
  '@media (max-width: 900px)': {
    display: 'none',
  },
})

const BackLabelShort = styled('span')({
  display: 'none',
  '@media (max-width: 900px)': {
    display: 'inline',
  },
})

const Title = styled('h1')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minWidth: 0,
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '18px',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    fontSize: '14px',
  },
})

const TitleText = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
})

const Trailing = styled('div')({
  position: 'relative',
  zIndex: 1,
  marginLeft: 'auto',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
})

const Nav = styled('nav')({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
})

const NavLink = styled('a')({
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '1rem',
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

export function AppHeaderNav({
  links,
}: {
  links: { href: string; label: string }[]
}) {
  return (
    <Nav aria-label="global navigation">
      {links.map((link) => (
        <NavLink key={link.href} href={link.href}>
          {link.label}
        </NavLink>
      ))}
    </Nav>
  )
}

export default function AppHeader({
  backTo,
  backLabel,
  title = 'リフィル作成',
  backState,
  showBack = true,
  trailing,
}: AppHeaderProps) {
  return (
    <HeaderBar className="wizard-header app-header">
      <HeaderInner className="wizard-header__inner app-header__inner">
        {showBack ? (
          <BackLink
            to={backTo}
            state={backState}
            className="wizard-header__back app-header__back"
          >
            <BackLabelFull className="app-header__back-label app-header__back-label--full">
              {backLabel}
            </BackLabelFull>
            <BackLabelShort className="app-header__back-label app-header__back-label--short">
              ← 戻る
            </BackLabelShort>
          </BackLink>
        ) : null}
        <Title className="app-header__title">
          <AppHeaderBrandIcon />
          <TitleText className="app-header__title-text">{title}</TitleText>
        </Title>
        {trailing ? (
          <Trailing className="app-header__trailing">{trailing}</Trailing>
        ) : null}
      </HeaderInner>
    </HeaderBar>
  )
}
