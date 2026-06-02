import CloseIcon from '@mui/icons-material/Close'
import CropIcon from '@mui/icons-material/Crop'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import FitScreenIcon from '@mui/icons-material/FitScreen'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { ReactNode } from 'react'
import AppButton from '../AppButton'

export type Step4SlotFitMode = 'cover' | 'contain' | 'fill'

const FIT_OPTIONS: { id: Step4SlotFitMode; label: string; icon: ReactNode }[] = [
  { id: 'cover', label: 'トリミング', icon: <CropIcon fontSize="small" /> },
  { id: 'contain', label: '全体表示', icon: <FitScreenIcon fontSize="small" /> },
  { id: 'fill', label: '引き延ばし', icon: <OpenInFullIcon fontSize="small" /> },
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

// デスクトップ: 右端Drawer。幅280px固定、paddingはpaper側に持たせない
const DesktopEditDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    width: '280px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface)',
    borderLeft: '1px solid var(--color-border)',
    overflowX: 'hidden',
  },
})

// モバイル: 下からDrawer
const MobileEditDrawer = styled(Drawer)({
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '16px 16px 0 0',
    maxHeight: '70vh',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
})

// Drawer内のコンテンツ全体
const DrawerPanel = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  gap: '12px',
  boxSizing: 'border-box',
  width: '100%',
})

const PanelHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
})

const PanelTitle = styled('h2')({
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

// プレビュー: 幅100%・高さは画像比率に従って自然に決まる
const PreviewFrame = styled(Box)({
  position: 'relative',
  width: '100%',
  flexShrink: 0,
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-border)',
  backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
  overflow: 'hidden',
  // 最小・最大高さで極端なサイズを防ぐ
  minHeight: '160px',
  maxHeight: '340px',
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

// 4つのフィットボタン（トリミング・全体表示・引き延ばし・回転）横並び
const FitButtonRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: '6px',
  width: '100%',
})

const FitOptionButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>(({ active }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  flex: 1,
  minWidth: 0,
  margin: 0,
  padding: '10px 2px',
  borderRadius: '6px',
  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  color: active ? 'var(--color-primary)' : 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.72rem',
  fontWeight: active ? 600 : 500,
  lineHeight: 1.3,
  cursor: 'pointer',
  '&:hover': {
    borderColor: 'var(--color-primary)',
  },
}))

const ActionButtonRow = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: '8px',
  width: '100%',
})

const ReplaceButton = styled(AppButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  flex: 1,
  fontSize: '0.8rem',
  padding: '8px',
  minHeight: 'unset',
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-primary)',
  border: '2px solid var(--color-primary)',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))',
  },
})

const DeleteButton = styled(AppButton)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  flex: 1,
  fontSize: '0.8rem',
  padding: '8px',
  minHeight: 'unset',
  backgroundColor: 'color-mix(in srgb, #c62828 12%, var(--color-surface))',
  color: 'color-mix(in srgb, #c62828 75%, var(--color-text-h))',
  border: '2px solid color-mix(in srgb, #c62828 55%, var(--color-border))',
  '&:hover': {
    filter: 'none',
    backgroundColor: 'color-mix(in srgb, #c62828 20%, var(--color-surface))',
    color: 'color-mix(in srgb, #c62828 85%, var(--color-text-h))',
  },
})

const HintRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: 'var(--color-muted)',
  fontSize: '0.75rem',
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
      <PanelHeader>
        <PanelTitle id="step4-edit-modal-title">{title}</PanelTitle>
        <CloseButton type="button" aria-label="閉じる" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </CloseButton>
      </PanelHeader>

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
            {option.icon}
            <span>{option.label}</span>
          </FitOptionButton>
        ))}
        <FitOptionButton type="button" active={false} onClick={onRotate}>
          <RotateRightIcon fontSize="small" />
          <span>回転</span>
        </FitOptionButton>
      </FitButtonRow>

      <ActionButtonRow>
        <ReplaceButton type="button" onClick={onReplace}>
          <SwapHorizIcon fontSize="small" />
          差し替え
        </ReplaceButton>
        <DeleteButton type="button" onClick={onDelete}>
          <DeleteOutlineIcon fontSize="small" />
          削除
        </DeleteButton>
      </ActionButtonRow>

      <HintRow>
        <LightbulbOutlinedIcon sx={{ fontSize: '0.85rem' }} />
        ドラッグで位置を調整できます
      </HintRow>
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
      ModalProps={{
        hideBackdrop: true,
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableScrollLock: true,
        keepMounted: true,
        style: { pointerEvents: 'none' },
      }}
      slotProps={{
        paper: { style: { pointerEvents: 'auto' } },
      }}
      aria-labelledby="step4-edit-modal-title"
    >
      {panel}
    </DesktopEditDrawer>
  )
}
