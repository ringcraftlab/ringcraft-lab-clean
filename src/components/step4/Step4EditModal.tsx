import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import AppButton from '../AppButton'

export type Step4SlotFitMode = 'cover' | 'contain' | 'fill'

const FIT_OPTIONS: { id: Step4SlotFitMode; label: string }[] = [
  { id: 'cover', label: 'トリミング' },
  { id: 'contain', label: '全体表示' },
  { id: 'fill', label: '引き延ばし' },
]

export interface Step4EditModalProps {
  open: boolean
  slotIndex: number | null
  imageSrc: string | null
  fitMode: string
  rotation?: number
  previewW: number
  previewH: number
  onClose: () => void
  onSetFit: (mode: Step4SlotFitMode) => void
  onRotate: () => void
  onReplace: () => void
  onDelete: () => void
}

function calcPreviewSize(previewW: number, previewH: number) {
  const safeW = Math.max(previewW, 1)
  const safeH = Math.max(previewH, 1)
  const capW = 300
  const capH = 220
  const ratio = safeW / safeH
  let w = capW
  let h = w / ratio
  if (h > capH) {
    h = capH
    w = h * ratio
  }
  if (w > capW) {
    w = capW
    h = w / ratio
  }
  return { width: Math.round(w), height: Math.round(h) }
}

const DesktopEditDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '280px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border)',
  },
})

const MobileEditDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px 16px 0 0',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
})

const DrawerPanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
})

const HeaderRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

const Title = styled('h2')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '1rem',
  fontWeight: 700,
  lineHeight: 1.4,
})

const CloseButton = styled(IconButton)({
  flexShrink: 0,
  color: 'var(--color-muted)',
  '&:hover': {
    color: 'var(--color-text-h)',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
  },
})

const PreviewFrame = styled(Box)({
  position: 'relative',
  overflow: 'hidden',
  margin: '0 auto',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
})

const PreviewImage = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fitMode' && prop !== 'rotation',
})<{ fitMode: Step4SlotFitMode; rotation: number }>(({ fitMode, rotation }) => ({
  width: '100%',
  height: '100%',
  objectFit: fitMode,
  transform: `rotate(${rotation}deg)`,
  transformOrigin: 'center center',
}))

const ReplaceButton = styled(AppButton)({
  width: '100%',
  minHeight: '36px',
  fontSize: '0.8125rem',
  fontWeight: 600,
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text-h)',
  border: '1px solid var(--color-border)',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))',
  },
})

const FitRow = styled(Box)({
  display: 'flex',
  gap: '6px',
})

const FitButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  flex: 1,
  minHeight: '36px',
  padding: '0 4px',
  borderRadius: '8px',
  border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
  background: active
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  fontWeight: active ? 600 : 500,
  cursor: 'pointer',
}))

const RotateButton = styled('button')({
  width: '100%',
  minHeight: '38px',
  padding: '0 10px',
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))',
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
})

const DeleteButton = styled('button')({
  width: '100%',
  minHeight: '40px',
  padding: '0 12px',
  borderRadius: '8px',
  border: '1px solid #fecdca',
  background: '#fff',
  color: '#b42318',
  fontFamily: 'var(--font-body)',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
})

function isSlotFitMode(value: string): value is Step4SlotFitMode {
  return value === 'cover' || value === 'contain' || value === 'fill'
}

export default function Step4EditModal({
  open,
  slotIndex,
  imageSrc,
  fitMode,
  rotation = 0,
  previewW,
  previewH,
  onClose,
  onSetFit,
  onRotate,
  onReplace,
  onDelete,
}: Step4EditModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const activeFit: Step4SlotFitMode = isSlotFitMode(fitMode) ? fitMode : 'cover'
  const title = slotIndex !== null ? `${slotIndex + 1}枚目を編集` : '編集'
  const { width, height } = calcPreviewSize(previewW, previewH)
  const hasImage = Boolean(imageSrc)

  const panel = (
    <DrawerPanel>
      <HeaderRow>
        <Title id="step4-edit-modal-title">{title}</Title>
        <CloseButton type="button" aria-label="閉じる" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </CloseButton>
      </HeaderRow>

      <PreviewFrame style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}>
        {hasImage ? (
          <PreviewImage src={imageSrc as string} alt="" fitMode={activeFit} rotation={rotation} />
        ) : null}
      </PreviewFrame>

      {hasImage ? (
        <ReplaceButton type="button" onClick={onReplace}>
          画像を差し替え
        </ReplaceButton>
      ) : null}

      <FitRow>
        {FIT_OPTIONS.map((option) => (
          <FitButton
            key={option.id}
            type="button"
            active={activeFit === option.id}
            onClick={() => onSetFit(option.id)}
          >
            {option.label}
          </FitButton>
        ))}
      </FitRow>

      <RotateButton type="button" onClick={onRotate}>
        ↻ 90度回転（{rotation}°）
      </RotateButton>

      {hasImage ? (
        <DeleteButton type="button" onClick={onDelete}>
          削除
        </DeleteButton>
      ) : null}
    </DrawerPanel>
  )

  if (isMobile) {
    return (
      <MobileEditDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        slotProps={{ paper: { style: { padding: '16px' } } }}
        aria-labelledby="step4-edit-modal-title"
      >
        {panel}
      </MobileEditDrawer>
    )
  }

  return (
    <DesktopEditDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop
      ModalProps={{
        disableScrollLock: true,
        style: { pointerEvents: 'none' },
      }}
      PaperProps={{
        sx: {
          height: 'fit-content',
          top: '80px',
          pointerEvents: 'auto',
          padding: '16px',
        },
      }}
      aria-labelledby="step4-edit-modal-title"
    >
      {panel}
    </DesktopEditDrawer>
  )
}
