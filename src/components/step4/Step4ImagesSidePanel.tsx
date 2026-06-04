import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { type ChangeEvent, type RefObject } from 'react'
import AppButton from '../AppButton'
import type { FoldImageMode } from '../../utils/foldImagePlacement'

export type ImageAreaMode = 'avoid' | 'full'

const ImagesSidePanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'flex-start',
  gap: '24px',
  width: '100%',
  minWidth: 0,
})

const ImagesSideSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '12px',
  width: '100%',
})

const ImagesSideSectionTitle = styled('h3')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  fontWeight: 700,
  lineHeight: 1.4,
})

const ImagesSideSectionHint = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  lineHeight: 1.55,
})

const FoldModeGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
  width: '100%',
})

const FoldModeCard = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  width: '100%',
  margin: 0,
  minHeight: '78px',
  padding: '12px 14px',
  borderRadius: 'var(--radius-card)',
  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))'
    : 'var(--color-surface)',
  textAlign: 'left',
  cursor: 'pointer',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const FoldModeCardTitle = styled('span')({
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1.35,
})

const FoldModeCardDesc = styled('span')({
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  lineHeight: 1.45,
})

const ImagesSideActionBlock = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '6px',
  width: '100%',
})

const ImagesSideActionSubtext = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  textAlign: 'center',
})

const ImagesPickButton = styled(AppButton)({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
})

const OutlineAppButton = styled(AppButton)({
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-primary)',
  border: '2px solid var(--color-primary)',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
  },
})

const ImagesFillAllButton = styled(OutlineAppButton)({
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
})

const ImagesClearAllButton = styled('button')({
  margin: 0,
  padding: 0,
  border: 'none',
  background: 'none',
  color: 'color-mix(in srgb, var(--color-primary) 65%, var(--color-text-h))',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  textDecoration: 'underline',
  cursor: 'pointer',
  alignSelf: 'center',
  '&:hover': {
    color: 'var(--color-text-h)',
  },
})

const ImagesPlacementCard = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  width: '100%',
  margin: 0,
  padding: '12px 14px',
  borderRadius: 'var(--radius-card)',
  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))'
    : 'var(--color-surface)',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const ImagesPlacementCardHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
})

const ImagesPlacementCardIcon = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'var(--color-primary)',
})

const ImagesPlacementCardTitle = styled('span')({
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 600,
  lineHeight: 1.4,
})

const ImagesPlacementCardDesc = styled('span')({
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  lineHeight: 1.5,
})

const PlacementCardCheckIcon = styled(CheckCircleIcon)({
  position: 'absolute',
  right: '8px',
  top: '8px',
  color: 'var(--color-primary)',
  fontSize: '1.2rem',
})

const HiddenFileInput = styled('input')({
  display: 'none',
})

export interface Step4ImagesSidePanelProps {
  images?: Record<number, string>
  isFoldLayout?: boolean
  foldCount?: number
  foldImageMode?: FoldImageMode
  onFoldImageModeChange?: (mode: FoldImageMode) => void
  fileInputRef: RefObject<HTMLInputElement | null>
  fileInputMultiRef: RefObject<HTMLInputElement | null>
  fileInputFillRef: RefObject<HTMLInputElement | null>
  fileInputPanoramaRef?: RefObject<HTMLInputElement | null>
  imageAreaMode: ImageAreaMode
  onImageAreaModeChange: (mode: ImageAreaMode) => void
  onClearAllImages: () => void
  onFillAllImages: () => void
  onFileInput: (event: ChangeEvent<HTMLInputElement>) => void
  onMultiInput: (event: ChangeEvent<HTMLInputElement>) => void
  onFillInput: (event: ChangeEvent<HTMLInputElement>) => void
  onPanoramaInput?: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function Step4ImagesSidePanel({
  images = {},
  isFoldLayout = false,
  foldCount = 3,
  foldImageMode = 'panels',
  onFoldImageModeChange,
  fileInputRef,
  fileInputMultiRef,
  fileInputFillRef,
  fileInputPanoramaRef,
  imageAreaMode,
  onImageAreaModeChange,
  onClearAllImages,
  onFillAllImages,
  onFileInput,
  onMultiInput,
  onFillInput,
  onPanoramaInput,
}: Step4ImagesSidePanelProps) {
  const hasImages = Object.keys(images).length > 0
  const isPanoramaMode = isFoldLayout && foldImageMode === 'panorama'

  return (
    <Box className="step4-side-column" aria-label="操作エリア">
      <ImagesSidePanel>
        <ImagesSideSection>
          <ImagesSideSectionTitle>① 写真を追加</ImagesSideSectionTitle>
          <ImagesSideActionBlock>
            <ImagesPickButton type="button" onClick={() => fileInputMultiRef.current?.click()}>
              写真を選ぶ
            </ImagesPickButton>
            <ImagesSideActionSubtext>
              {isPanoramaMode
                ? '空いている帯に順に配置（面ごとに切り替わります）'
                : '枠ごとに別々の写真を配置'}
            </ImagesSideActionSubtext>
          </ImagesSideActionBlock>
          {hasImages && !isPanoramaMode ? (
            <>
              <ImagesSideActionBlock>
                <ImagesFillAllButton type="button" onClick={onFillAllImages}>
                  1枚を全枠に使う
                </ImagesFillAllButton>
                <ImagesSideActionSubtext>全枠に同じ写真を配置したい時</ImagesSideActionSubtext>
              </ImagesSideActionBlock>
              <ImagesClearAllButton type="button" onClick={onClearAllImages}>
                一括削除
              </ImagesClearAllButton>
            </>
          ) : hasImages || isPanoramaMode ? (
            <ImagesClearAllButton type="button" onClick={onClearAllImages}>
              一括削除
            </ImagesClearAllButton>
          ) : null}
        </ImagesSideSection>

        {isFoldLayout && onFoldImageModeChange ? (
          <ImagesSideSection>
            <ImagesSideSectionTitle>② 折り画像の入れ方</ImagesSideSectionTitle>
            <ImagesSideSectionHint>
              面ごとに画像を入れるか、{foldCount}面を1枚の横長画像として使うかを選びます。
            </ImagesSideSectionHint>
            <FoldModeGrid role="radiogroup" aria-label="折り画像の入れ方">
              {(
                [
                  { id: 'panels' as const, title: '面ごと', desc: '各面に別々の画像' },
                  {
                    id: 'panorama' as const,
                    title: 'パノラマ',
                    desc: `${foldCount}面を1枚で横長配置`,
                  },
                ] as const
              ).map((option) => {
                const active = foldImageMode === option.id
                return (
                  <FoldModeCard
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    active={active}
                    onClick={() => onFoldImageModeChange(option.id)}
                  >
                    {active ? <PlacementCardCheckIcon aria-hidden /> : null}
                    <FoldModeCardTitle>{option.title}</FoldModeCardTitle>
                    <FoldModeCardDesc>{option.desc}</FoldModeCardDesc>
                  </FoldModeCard>
                )
              })}
            </FoldModeGrid>
          </ImagesSideSection>
        ) : null}

        <ImagesSideSection>
          <ImagesSideSectionTitle>
            {isFoldLayout ? '③ 配置を選ぶ' : '② 配置を選ぶ'}
          </ImagesSideSectionTitle>
          <ImagesPlacementCard
            type="button"
            active={imageAreaMode === 'avoid'}
            aria-pressed={imageAreaMode === 'avoid'}
            onClick={() => onImageAreaModeChange('avoid')}
          >
            {imageAreaMode === 'avoid' ? <PlacementCardCheckIcon aria-hidden /> : null}
            <ImagesPlacementCardHeader>
              <ImagesPlacementCardIcon aria-hidden>
                <FilterCenterFocusIcon fontSize="small" />
              </ImagesPlacementCardIcon>
              <ImagesPlacementCardTitle>リングを避ける</ImagesPlacementCardTitle>
            </ImagesPlacementCardHeader>
            <ImagesPlacementCardDesc>リング穴に画像をかけない</ImagesPlacementCardDesc>
          </ImagesPlacementCard>
          <ImagesPlacementCard
            type="button"
            active={imageAreaMode === 'full'}
            aria-pressed={imageAreaMode === 'full'}
            onClick={() => onImageAreaModeChange('full')}
          >
            {imageAreaMode === 'full' ? <PlacementCardCheckIcon aria-hidden /> : null}
            <ImagesPlacementCardHeader>
              <ImagesPlacementCardIcon aria-hidden>
                <FullscreenIcon fontSize="small" />
              </ImagesPlacementCardIcon>
              <ImagesPlacementCardTitle>全面</ImagesPlacementCardTitle>
            </ImagesPlacementCardHeader>
            <ImagesPlacementCardDesc>枠いっぱいに配置（穴にかかる）</ImagesPlacementCardDesc>
          </ImagesPlacementCard>
        </ImagesSideSection>

        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileInput}
        />
        <HiddenFileInput
          ref={fileInputMultiRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onMultiInput}
        />
        <HiddenFileInput
          ref={fileInputFillRef}
          type="file"
          accept="image/*"
          onChange={onFillInput}
        />
        {fileInputPanoramaRef && onPanoramaInput ? (
          <HiddenFileInput
            ref={fileInputPanoramaRef}
            type="file"
            accept="image/*"
            onChange={onPanoramaInput}
          />
        ) : null}
      </ImagesSidePanel>
    </Box>
  )
}
