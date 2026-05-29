import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`
const sampleImagesSrc = `${base}SampleNoHoll.png`

const Root = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
})

const Figure = styled(Box)({
  width: '100%',
  maxWidth: '720px',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  padding: '16px',
})

const SampleImage = styled('img')({
  display: 'block',
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
})

/** 作り方のイメージ（A4に8枚配置した印刷サンプル） */
export default function HomeHeroPrintImagery() {
  return (
    <Root aria-label="作り方のイメージ">
      <Figure>
        <SampleImage
          src={sampleImagesSrc}
          alt="A4用紙に8枚の写真をリフィル枠に配置した印刷イメージ"
          loading="eager"
          decoding="async"
        />
      </Figure>
    </Root>
  )
}
