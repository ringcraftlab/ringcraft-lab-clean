import { Link, useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import MenuBookIcon from '@mui/icons-material/MenuBook'
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
  position: 'relative',
  minHeight: '72px',
  display: 'flex',
  alignItems: 'center',
})

const BackLink = styled(Link)({
  color: 'var(--color-text)',
  textDecoration: 'none',
  fontWeight: 500,
  '&:hover': {
    color: 'var(--color-primary)',
  },
})

const ServiceTitle = styled('h1')({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '20px',
  lineHeight: 1.4,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
})

const TitleIcon = styled(MenuBookIcon)({
  color: 'var(--color-primary)',
  fontSize: '24px',
})

const Hero = styled('section')({
  padding: '56px 0 48px',
})

const HeroHeading = styled('h2')({
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1.75rem',
  lineHeight: 1.35,
  marginBottom: '12px',
})

const HeroSub = styled('p')({
  color: 'var(--color-text-h)',
  fontWeight: 500,
  fontSize: '1.125rem',
  lineHeight: 1.6,
  marginBottom: '16px',
})

const HeroDescription = styled('p')({
  color: 'var(--color-muted)',
  lineHeight: 1.8,
  marginBottom: '28px',
})

const StepSection = styled('section')({
  paddingBottom: '72px',
})

const StepGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '16px',
})

const StepCard = styled('article')({
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  padding: '20px',
})

const StepLabel = styled('p')({
  color: 'var(--color-primary)',
  fontWeight: 700,
  fontSize: '14px',
  marginBottom: '8px',
})

const StepTitle = styled('h3')({
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '1.05rem',
  lineHeight: 1.5,
})

export default function Tool() {
  const navigate = useNavigate()

  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackLink to="/">← ホームに戻る</BackLink>
          <ServiceTitle>
            <TitleIcon aria-hidden="true" />
            リフィル作成
          </ServiceTitle>
        </HeaderInner>
      </Header>

      <Container>
        <Hero>
          <HeroHeading>システム手帳のリフィルを、もっと簡単に。</HeroHeading>
          <HeroSub>写真やメモを、そのまま手帳に。</HeroSub>
          <HeroDescription>
            並べて印刷するだけで、リフィルとして使えます。M5 / M5スクエア / M6 /
            バイブル対応
          </HeroDescription>
          <AppButton onClick={() => navigate('/tool/step1')}>
            リフィルを作ってみる →
          </AppButton>
        </Hero>

        <StepSection>
          <StepGrid>
            <StepCard>
              <StepLabel>Step1</StepLabel>
              <StepTitle>サイズを選ぶ</StepTitle>
            </StepCard>
            <StepCard>
              <StepLabel>Step2</StepLabel>
              <StepTitle>作り方を選ぶ</StepTitle>
            </StepCard>
            <StepCard>
              <StepLabel>Step3</StepLabel>
              <StepTitle>印刷タイプを選ぶ</StepTitle>
            </StepCard>
          </StepGrid>
        </StepSection>
      </Container>
    </Page>
  )
}
