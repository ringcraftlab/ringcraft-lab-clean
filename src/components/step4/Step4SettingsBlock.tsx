import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

export type HoleSide = 'left' | 'right'

const BORDER_COLOR_PRESETS = [
  { id: 'gray', label: 'グレー', hex: '#b0a89e' },
  { id: 'pink', label: 'ピンク', hex: '#e8a0a0' },
  { id: 'light-pink', label: '薄ピンク', hex: '#f0c0c0' },
  { id: 'green', label: 'グリーン', hex: '#8fbfb0' },
  { id: 'blue', label: 'ブルー', hex: '#6080a8' },
  { id: 'purple', label: 'パープル', hex: '#9080b0' },
  { id: 'black', label: 'ブラック', hex: '#000000' },
] as const

export const DEFAULT_BORDER_COLOR = BORDER_COLOR_PRESETS[6].hex

const SettingsPanel = styled(Box)({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  alignItems: 'flex-end',
  gap: '20px',
  marginBottom: '32px',
  overflowX: 'auto',
})

const SettingsGroup = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'muted',
})<{ muted?: boolean }>(({ muted }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
  flex: '0 0 auto',
  opacity: muted ? 0.55 : 1,
}))

const SettingsLabel = styled('span')({
  color: 'var(--color-text-h)',
  fontWeight: 600,
  fontSize: '0.9rem',
  flexShrink: 0,
})

const SettingsControls = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
})

const SettingsToggleButton = styled('button', {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'disabled',
})<{ active?: boolean; disabled?: boolean }>(({ active, disabled }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '44px',
  height: '28px',
  padding: '0 12px',
  borderRadius: '6px',
  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  backgroundColor: active
    ? 'color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))'
    : 'var(--color-surface)',
  color: 'var(--color-text-h)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  fontWeight: active ? 600 : 500,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.45 : 1,
  '&:hover': disabled
    ? undefined
    : {
        borderColor: 'var(--color-primary)',
      },
}))

const ColorSwatchRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
})

const ColorSwatch = styled('button', {
  shouldForwardProp: (prop) => prop !== 'swatchColor' && prop !== 'selected',
})<{ swatchColor: string; selected?: boolean }>(({ swatchColor, selected }) => ({
  width: '28px',
  height: '28px',
  padding: 0,
  border: 'none',
  borderRadius: '50%',
  backgroundColor: swatchColor,
  cursor: 'pointer',
  boxShadow: selected
    ? '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary)'
    : '0 0 0 1px var(--color-border)',
  '&:hover': {
    boxShadow: '0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary)',
  },
}))

export interface Step4SettingsBlockProps {
  showHoleGuide: boolean
  onShowHoleGuideChange: (value: boolean) => void
  holeSide: HoleSide
  onHoleSideChange: (side: HoleSide) => void
  borderColor: string
  onBorderColorChange: (color: string) => void
}

export default function Step4SettingsBlock({
  showHoleGuide,
  onShowHoleGuideChange,
  holeSide,
  onHoleSideChange,
  borderColor,
  onBorderColorChange,
}: Step4SettingsBlockProps) {
  return (
    <SettingsPanel>
      <SettingsGroup>
        <SettingsLabel>穴あけガイド</SettingsLabel>
        <SettingsControls>
          <SettingsToggleButton
            type="button"
            active={showHoleGuide}
            onClick={() => onShowHoleGuideChange(true)}
          >
            ON
          </SettingsToggleButton>
          <SettingsToggleButton
            type="button"
            active={!showHoleGuide}
            onClick={() => onShowHoleGuideChange(false)}
          >
            OFF
          </SettingsToggleButton>
        </SettingsControls>
      </SettingsGroup>
      <SettingsGroup muted={!showHoleGuide}>
        <SettingsLabel>穴の位置</SettingsLabel>
        <SettingsControls>
          <SettingsToggleButton
            type="button"
            active={holeSide === 'left'}
            disabled={!showHoleGuide}
            onClick={() => onHoleSideChange('left')}
          >
            左
          </SettingsToggleButton>
          <SettingsToggleButton
            type="button"
            active={holeSide === 'right'}
            disabled={!showHoleGuide}
            onClick={() => onHoleSideChange('right')}
          >
            右
          </SettingsToggleButton>
        </SettingsControls>
      </SettingsGroup>
      <SettingsGroup>
        <SettingsLabel>線の色</SettingsLabel>
        <SettingsControls>
          <ColorSwatchRow>
            {BORDER_COLOR_PRESETS.map((preset) => (
              <ColorSwatch
                key={preset.id}
                type="button"
                swatchColor={preset.hex}
                selected={borderColor === preset.hex}
                title={preset.label}
                aria-label={preset.label}
                aria-pressed={borderColor === preset.hex}
                onClick={() => onBorderColorChange(preset.hex)}
              />
            ))}
          </ColorSwatchRow>
        </SettingsControls>
      </SettingsGroup>
    </SettingsPanel>
  )
}
