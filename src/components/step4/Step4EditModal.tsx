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
  onClose: () => void
  onSetFit: (mode: Step4SlotFitMode) => void
  onRotate: () => void
  onReplace: () => void
  onDelete: () => void
}

const DrawerPanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '20px',
  boxSizing: 'border-box',
  backgroundColor: 'var(--color-surface)',
})

const DesktopEditDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '340px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border)',
  },
})

const MobileEditDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    height: 'auto',
    maxHeight: '90vh',
    borderRadius: '16px 16px 0 0',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface)',
  },
})

const DrawerHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  marginBottom: '16px',
})

const DrawerTitle = styled('h2')({
  margin: 0,
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '1.0625rem',
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
  width: '100%',
  aspectRatio: '1',
  marginBottom: '16px',
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
  overflow: 'hidden',
})

const PreviewImage = styled('img', {
  shouldForwardProp: (prop) => prop !== 'fitMode' && prop !== 'rotation',
})<{ fitMode: Step4SlotFitMode; rotation: number }>(({ fitMode, rotation }) => ({
  display: 'block',
  width: '100%',
  height: '100%',
  objectFit: fitMode,
  transform: `rotate(${rotation}deg)`,
  transformOrigin: 'center center',
}))

const FitButtonRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '8px',
  marginBottom: '12px',
})

const FitOptionButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  margin: 0,
  padding: '8px 4px',
  borderRadius: '6px',
  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  color: active ? 'var(--color-primary)' : 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.75rem',
  fontWeight: active ? 600 : 500,
  lineHeight: 1.3,
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const ActionButtonRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '10px',
})

const ReplaceButton = styled(AppButton)({
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-primary)',
  border: '2px solid var(--color-primary)',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
  },
})

const DeleteButton = styled(AppButton)({
  backgroundColor: 'color-mix(in srgb, #c62828 12%, var(--color-surface))',
  color: 'color-mix(in srgb, #c62828 75%, var(--color-text-h))',
  border: '2px solid color-mix(in srgb, #c62828 55%, var(--color-border))',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, #c62828 20%, var(--color-surface))',
    color: 'color-mix(in srgb, #c62828 85%, var(--color-text-h))',
  },
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
  onClose,
  onSetFit,
  onRotate,
  onReplace,
  onDelete,
}: Step4EditModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const activeFit: Step4SlotFitMode = isSlotFitMode(fitMode) ? fitMode : 'cover'
  const title = slotIndex !== null ? `${slotIndex + 1}枚目を編集` : '編集'

  const panel = (
    <DrawerPanel>
      <DrawerHeader>
        <DrawerTitle id="step4-edit-modal-title">{title}</DrawerTitle>
        <CloseButton type="button" aria-label="閉じる" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </CloseButton>
      </DrawerHeader>

      <PreviewFrame>
        {imageSrc ? (
          <PreviewImage src={imageSrc} alt="" fitMode={activeFit} rotation={rotation} />
        ) : null}
      </PreviewFrame>

      <FitButtonRow>
        {FIT_OPTIONS.map((option) => (
          <FitOptionButton
            key={option.id}
            type="button"
            active={activeFit === option.id}
            onClick={() => onSetFit(option.id)}
          >
            {option.label}
          </FitOptionButton>
        ))}
        <FitOptionButton type="button" active={false} onClick={onRotate}>
          回転
        </FitOptionButton>
      </FitButtonRow>

      <ActionButtonRow>
        <ReplaceButton type="button" onClick={onReplace}>
          差し替え
        </ReplaceButton>
        <DeleteButton type="button" onClick={onDelete}>
          削除
        </DeleteButton>
      </ActionButtonRow>
    </DrawerPanel>
  )

  if (isMobile) {
    return (
      <MobileEditDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
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
      ModalProps={{ keepMounted: true, disableScrollLock: true }}
      aria-labelledby="step4-edit-modal-title"
    >
      {panel}
    </DesktopEditDrawer>
  )
}
