import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import { AppHeaderBrandIcon } from './AppHeaderBrandIcon'

export const APP_HEADER_HEIGHT_PX = 56

export interface AppHeaderProps {
  backTo: string
  /** 戻るボタンの aria-label（例: 「リフィル作成に戻る」） */
  backLabel: string
  title?: string
  backState?: object
  /** Home など戻る導線がないページでは false */
  showBack?: boolean
  /** 右端スロット（Home のグローバルナビなど） */
  trailing?: ReactNode
}

const HeaderBar = styled('header')({
  position: 'sticky',
  top: 0,
  zIndex: 1100,
  flexShrink: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  minHeight: `${APP_HEADER_HEIGHT_PX}px`,
  backgroundColor: 'var(--color-surface)',
  borderBottom: '1px solid var(--color-border)',
  boxSizing: 'border-box',
})

const HeaderInner = styled('div', {
  shouldForwardProp: (prop) => prop !== 'centered',
})<{ centered: boolean }>(({ centered }) => ({
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '0 24px',
  boxSizing: 'border-box',
  minHeight: `${APP_HEADER_HEIGHT_PX}px`,
  alignItems: 'center',
  ...(centered
    ? {
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        columnGap: '12px',
      }
    : {
        display: 'flex',
        gap: '12px',
      }),
  '@media (max-width: 900px)': {
    paddingLeft: '16px',
    paddingRight: '16px',
    ...(centered ? { columnGap: '8px' } : { gap: '8px' }),
  },
}))

const HeaderLead = styled('div')({
  justifySelf: 'start',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  zIndex: 1,
})

const BackLink = styled(Link)({
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'pointer',
  color: 'var(--color-muted)',
  textDecoration: 'none',
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

const Title = styled('h1')({
  margin: 0,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  minWidth: 0,
  maxWidth: '100%',
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '18px',
  lineHeight: 1.4,
  boxSizing: 'border-box',
  '@media (max-width: 900px)': {
    fontSize: '14px',
  },
})

const TitleHome = styled(Title)({
  position: 'static',
  justifyContent: 'flex-start',
  flex: '1 1 auto',
})

const TitleCenter = styled(Title)({
  position: 'static',
  justifySelf: 'center',
  gridColumn: 2,
  pointerEvents: 'none',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
})

const TitleText = styled('span')({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
})

const Trailing = styled('div')({
  justifySelf: 'end',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '16px',
  zIndex: 1,
})

const TrailingHome = styled(Trailing)({
  marginLeft: 'auto',
})

const TrailSpacer = styled('div')({
  justifySelf: 'end',
  minWidth: 0,
  width: '1.5rem',
  height: '1.5rem',
  pointerEvents: 'none',
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
  if (!showBack) {
    return (
      <HeaderBar className="app-header">
        <HeaderInner centered={false}>
          <TitleHome className="app-header__title">
            <AppHeaderBrandIcon />
            <TitleText className="app-header__title-text">{title}</TitleText>
          </TitleHome>
          {trailing ? <TrailingHome>{trailing}</TrailingHome> : null}
        </HeaderInner>
      </HeaderBar>
    )
  }

  return (
    <HeaderBar className="app-header">
      <HeaderInner centered>
        <HeaderLead>
          <BackLink to={backTo} state={backState} aria-label={backLabel}>
            <ArrowBackIcon sx={{ fontSize: '1.5rem' }} />
          </BackLink>
        </HeaderLead>
        <TitleCenter>
          <AppHeaderBrandIcon />
          <TitleText className="app-header__title-text">{title}</TitleText>
        </TitleCenter>
        {trailing ? (
          <Trailing>{trailing}</Trailing>
        ) : (
          <TrailSpacer aria-hidden />
        )}
      </HeaderInner>
    </HeaderBar>
  )
}
