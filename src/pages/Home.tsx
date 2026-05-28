import { Link, useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import BookIcon from '@mui/icons-material/Book'
import CreateIcon from '@mui/icons-material/Create'
import StoreIcon from '@mui/icons-material/Store'
import AppButton from '../components/AppButton'

const Page = styled('div')({
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
})

const Container = styled('div')({
  width: '100%',
  maxWidth: 'var(--max-width)',
  margin: '0 auto',
  padding: '0 24px',
})

const Header = styled('header')({
  borderBottom: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
})

const HeaderInner = styled(Container)({
  minHeight: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

const Brand = styled('a')({
  textDecoration: 'none',
  color: 'var(--color-text-h)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 700,
  fontSize: '20px',
})

const LogoMark = styled(BookIcon)({
  width: '28px',
  height: '28px',
  color: 'var(--color-primary)',
})

const Nav = styled('nav')({
  display: 'flex',
  gap: '16px',
})

const NavLink = styled('a')({
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

const Hero = styled('section')({
  padding: '72px 0 56px',
})

const HeroTitle = styled('h1')({
  color: 'var(--color-text-h)',
  fontWeight: 700,
  lineHeight: 1.3,
  marginBottom: '16px',
})

const HeroText = styled('p')({
  color: 'var(--color-muted)',
  lineHeight: 1.8,
  marginBottom: '28px',
})

const CardSection = styled('section')({
  paddingBottom: '72px',
})

const CardGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '16px',
  alignItems: 'stretch',
})

const CardLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  height: '100%',
})

const Card = styled('article')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px',
  gap: '12px',
})

const CardComingSoon = styled(Card)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
})

const CardTitle = styled('h3')({
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1.17rem',
})

const CardIcon = styled('span')({
  color: 'var(--color-primary)',
  display: 'inline-flex',
  alignItems: 'center',
})

const CardDescription = styled('p')({
  color: 'var(--color-muted)',
  lineHeight: 1.7,
})

const CardAction = styled('span')({
  marginTop: 'auto',
  alignSelf: 'flex-end',
  color: 'var(--color-primary)',
  fontWeight: 500,
})

const Badge = styled('span')({
  marginTop: '10px',
  display: 'inline-flex',
  padding: '4px 10px',
  borderRadius: 'var(--radius-btn)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-muted)',
  fontWeight: 500,
  fontSize: '13px',
})

const Footer = styled('footer')({
  borderTop: '1px solid var(--color-border)',
  backgroundColor: 'var(--color-surface)',
})

const FooterInner = styled(Container)({
  minHeight: '88px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '20px',
  flexWrap: 'wrap',
  paddingTop: '20px',
  paddingBottom: '20px',
})

const FooterLinks = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
})

const FooterLink = styled('a')({
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

const IconLink = styled('a')({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  '&:hover': {
    color: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
  },
})

export default function Home() {
  const navigate = useNavigate()

  return (
    <Page>
      <Header>
        <HeaderInner>
          <Brand href="/">
            <LogoMark aria-hidden="true" />
            RingCraft Lab
          </Brand>
          <Nav aria-label="global navigation">
            <NavLink href="/">ホーム</NavLink>
            <NavLink href="/news">お知らせ</NavLink>
          </Nav>
        </HeaderInner>
      </Header>

      <Container>
        <Hero>
          <HeroTitle>小さな手帳と、お気に入りの文具を。</HeroTitle>
          <HeroText>
            M5手帳をもっと楽しく。リフィル作成や文具情報をまとめたポータルサイトです。
          </HeroText>
          <AppButton onClick={() => navigate('/tool')}>リフィルを作る →</AppButton>
        </Hero>

        <CardSection>
          <CardGrid>
            <CardLink to="/tool" aria-label="リフィルを作る">
              <Card>
                <CardIcon aria-hidden="true">
                  <BookIcon />
                </CardIcon>
                <CardTitle>リフィルを作る</CardTitle>
                <CardDescription>
                  システム手帳のリフィルを自分好みに作成できます。
                </CardDescription>
                <CardAction>→</CardAction>
              </Card>
            </CardLink>
            <CardComingSoon>
              <CardIcon aria-hidden="true">
                <CreateIcon />
              </CardIcon>
              <CardTitle>ペン検索</CardTitle>
              <CardDescription>
                小さなペンを集めて、図鑑のようにご紹介する予定です。
              </CardDescription>
              <Badge>準備中</Badge>
            </CardComingSoon>
            <CardComingSoon>
              <CardIcon aria-hidden="true">
                <StoreIcon />
              </CardIcon>
              <CardTitle>文具店検索</CardTitle>
              <CardDescription>全国の文具店情報を掲載する予定です。</CardDescription>
              <Badge>準備中</Badge>
            </CardComingSoon>
          </CardGrid>
        </CardSection>
      </Container>

      <Footer>
        <FooterInner>
          <Brand href="/">
            <LogoMark aria-hidden="true" />
            RingCraft Lab
          </Brand>
          <FooterLinks>
            <FooterLink href="/news">お知らせ</FooterLink>
            <FooterLink href="/contact">お問い合わせ</FooterLink>
            <IconLink href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.901 1.153h3.68l-8.038 9.188L24 22.847h-7.406l-5.8-7.584-6.639 7.584H.47l8.597-9.826L0 1.154h7.594l5.243 6.932z" />
              </svg>
            </IconLink>
            <IconLink href="https://note.com" target="_blank" rel="noreferrer" aria-label="Note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </IconLink>
          </FooterLinks>
        </FooterInner>
      </Footer>
    </Page>
  )
}
