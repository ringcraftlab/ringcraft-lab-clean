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

const HeaderInner = styled('div', {
  shouldForwardProp: (prop) => prop !== 'noBack',
})<{ noBack?: boolean }>(({ noBack }) => ({
  display: 'grid',
  gridTemplateColumns: noBack ? '1fr auto' : 'auto 1fr auto',
  alignItems: 'center',
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '0 24px',
  gap: '12px',
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    gridTemplateColumns: noBack ? '1fr auto' : 'auto minmax(0, 1fr)',
    paddingLeft: '16px',
    paddingRight: '16px',
    gap: '8px',
  },
}))

const BackLink = styled(Link)({
  gridColumn: '1',
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontWeight: 500,
  fontSize: '1rem',
  textDecoration: 'none',
  flexShrink: 0,
  justifySelf: 'start',
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

const Title = styled('h1', {
  shouldForwardProp: (prop) => prop !== 'noBack',
})<{ noBack?: boolean }>(({ noBack }) => ({
  gridColumn: noBack ? '1' : '2',
  margin: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minWidth: 0,
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '18px',
  lineHeight: 1.4,
  '@media (max-width: 900px)': {
    justifyContent: noBack ? 'flex-start' : 'flex-start',
    fontSize: '16px',
  },
}))

const TitleText = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const Trailing = styled('div', {
  shouldForwardProp: (prop) => prop !== 'noBack',
})<{ noBack?: boolean }>(({ noBack }) => ({
  gridColumn: noBack ? '2' : '3',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexShrink: 0,
}))

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
  const noBack = !showBack

  return (
    <HeaderBar className="wizard-header app-header">
      <HeaderInner className="wizard-header__inner app-header__inner" noBack={noBack}>
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
        <Title className="wizard-header__title app-header__title" noBack={noBack}>
          <AppHeaderBrandIcon />
          <TitleText className="app-header__title-text">{title}</TitleText>
        </Title>
        {trailing ? (
          <Trailing className="app-header__trailing" noBack={noBack}>
            {trailing}
          </Trailing>
        ) : null}
      </HeaderInner>
    </HeaderBar>
  )
}
