import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`
const sampleImageSrc = `${base}SampleNoHoll.png`

const Root = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
})

const ImageFrame = styled(Box)({
  width: '100%',
  maxWidth: '720px',
  padding: '16px',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
})

const SampleImage = styled('img')({
  display: 'block',
  width: '100%',
  height: 'auto',
})

/** public/SampleNoHoll.png の印刷サンプル表示 */
export default function HomeHeroPrintImagery() {
  return (
    <Root aria-label="作り方のイメージ">
      <ImageFrame>
        <SampleImage
          src={sampleImageSrc}
          alt="A4用紙に8枚の写真をリフィル枠に配置した印刷イメージ"
        />
      </ImageFrame>
    </Root>
  )
}
