import { Link, useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import AppButton from '../components/AppButton'
import HomeFlowCta from '../components/HomeFlowCta'
import HomeHeroProcessDiagram from '../components/HomeHeroProcessDiagram'
import HomeHeroPrintImagery from '../components/HomeHeroPrintImagery'

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
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
  paddingTop: '20px',
  paddingBottom: '20px',
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
  color: 'var(--color-text-h)',
  fontWeight: 700,
  fontSize: '20px',
  lineHeight: 1.4,
})

const Hero = styled('section')({
  padding: '56px 0 40px',
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

const flowCtaStyles = {
  marginBottom: 0,
  '& .home-flow__cta': {
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
    transition: 'filter 0.2s ease',
    '&:hover': {
      filter: 'brightness(0.92)',
    },
  },
  '& .home-flow__cta-label': {
    lineHeight: 1.4,
  },
  '& .home-flow__cta-icon': {
    fontSize: '1.35rem',
    lineHeight: 1,
  },
}

const FlowCtaWrap = styled('div')({
  ...flowCtaStyles,
  position: 'relative',
  display: 'inline-block',
})

const FlowCtaWrapBottom = styled('div')({
  ...flowCtaStyles,
  marginBottom: '24px',
  position: 'relative',
  display: 'inline-block',
})

const FlowCtaOverlay = styled(AppButton)({
  position: 'absolute',
  inset: 0,
  minWidth: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  padding: 0,
})

const ProcessSection = styled('section')({
  marginBottom: '48px',
  '& .home-hero-process': {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    padding: '28px 20px 24px',
  },
  '& .home-hero-process__stage': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  '& .home-hero-process__block': {
    flex: '1 1 220px',
    maxWidth: '360px',
    textAlign: 'center',
  },
  '& .home-hero-process__block--result': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  '& .home-hero-process__caption': {
    color: 'var(--color-text-h)',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: '12px',
    lineHeight: 1.5,
  },
  '& .home-hero-process__caption--cut': {
    marginBottom: '8px',
  },
  '& .home-hero-process__sheet-wrap': {
    backgroundColor: 'var(--color-bg)',
    borderRadius: '8px',
    padding: '10px',
  },
  '& .home-hero-process__note': {
    color: 'var(--color-muted)',
    fontSize: '0.8rem',
    marginTop: '10px',
    lineHeight: 1.5,
  },
  '& .home-hero-process__arrow-wrap': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  },
  '& .home-hero-process__flow-note': {
    textAlign: 'center',
    color: 'var(--color-muted)',
    marginTop: '24px',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
})

const SamplesSection = styled('section')({
  marginBottom: '48px',
  '& .home-hero-samples': {
    display: 'flex',
    justifyContent: 'center',
  },
  '& .home-hero-samples__figure': {
    margin: 0,
    width: '100%',
    maxWidth: '720px',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    padding: '16px',
  },
  '& .home-hero-samples__figure img': {
    display: 'block',
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
  },
})

const BottomSection = styled('section')({
  paddingBottom: '72px',
})

export default function Tool() {
  const navigate = useNavigate()

  return (
    <Page>
      <Header>
        <HeaderInner>
          <BackLink to="/">← ホームに戻る</BackLink>
          <ServiceTitle>リフィル作成</ServiceTitle>
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
          <FlowCtaWrap>
            <HomeFlowCta />
            <FlowCtaOverlay
              type="button"
              onClick={() => navigate('/tool/step1')}
              aria-label="リフィル作成を始める"
            >
              リフィルを作ってみる
            </FlowCtaOverlay>
          </FlowCtaWrap>
        </Hero>

        <ProcessSection aria-label="印刷から切り取りまでの流れ">
          <HomeHeroProcessDiagram />
        </ProcessSection>

        <SamplesSection>
          <HomeHeroPrintImagery />
        </SamplesSection>

        <BottomSection>
          <FlowCtaWrapBottom>
            <HomeFlowCta />
            <FlowCtaOverlay
              type="button"
              onClick={() => navigate('/tool/step1')}
              aria-label="リフィル作成を始める"
            >
              リフィルを作ってみる
            </FlowCtaOverlay>
          </FlowCtaWrapBottom>
        </BottomSection>
      </Container>
    </Page>
  )
}
