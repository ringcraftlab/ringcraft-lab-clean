import { styled } from '@mui/material/styles'
import { type ReactElement } from 'react'
import BrandMark from './BrandMark'

const IconWrap = styled('span')({
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: 0,
  color: 'var(--color-primary)',
})

export function AppHeaderBrandIcon(): ReactElement {
  return (
    <IconWrap aria-hidden>
      <BrandMark size={18} />
    </IconWrap>
  )
}
