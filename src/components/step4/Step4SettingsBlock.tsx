import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import { styled } from '@mui/material/styles'
import {
  DEFAULT_REFILL_BORDER_COLOR,
  REFILL_BORDER_COLOR_PRESETS,
} from '../../utils/refillBorderColors'

export type HoleSide = 'left' | 'right'

export const DEFAULT_BORDER_COLOR = DEFAULT_REFILL_BORDER_COLOR

const BORDER_COLOR_PRESETS = REFILL_BORDER_COLOR_PRESETS

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
  flexShrink: 0,
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
  /** シート配置時は全枠の穴。折り時は帯の穴列 */
  holeSideAppliesToAllSlots?: boolean
  isFoldLayout?: boolean
  showFoldGuides?: boolean
  onShowFoldGuidesChange?: (value: boolean) => void
  showBorder: boolean
  onShowBorderChange: (value: boolean) => void
  borderColor: string
  onBorderColorChange: (color: string) => void
}

const FoldGuideHint = styled('p')({
  margin: 0,
  color: 'var(--color-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '0.8125rem',
  lineHeight: 1.55,
})

export default function Step4SettingsBlock({
  showHoleGuide,
  onShowHoleGuideChange,
  holeSide,
  onHoleSideChange,
  holeSideAppliesToAllSlots = false,
  isFoldLayout = false,
  showFoldGuides = true,
  onShowFoldGuidesChange,
  showBorder,
  onShowBorderChange,
  borderColor,
  onBorderColorChange,
}: Step4SettingsBlockProps) {
  return (
    <Box className="step4-settings" component="section" aria-label="表示設定">
      <Box className="step4-settings__row--primary">
        <SettingsGroup>
          <SettingsLabel>穴あけガイド</SettingsLabel>
          <SettingsControls>
            <Switch
              checked={showHoleGuide}
              onChange={(e) => onShowHoleGuideChange(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'var(--color-primary)',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'var(--color-primary)',
                },
              }}
            />
          </SettingsControls>
        </SettingsGroup>
        <SettingsGroup muted={!showHoleGuide}>
          <SettingsLabel>
            {holeSideAppliesToAllSlots ? '穴の位置（全枠）' : '穴の位置'}
          </SettingsLabel>
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
      </Box>
      {isFoldLayout && onShowFoldGuidesChange ? (
        <Box className="step4-settings__row--fold-guide">
          <SettingsGroup>
            <SettingsLabel>折り目ガイド</SettingsLabel>
            <SettingsControls>
              <Switch
                checked={showFoldGuides}
                onChange={(e) => onShowFoldGuidesChange(e.target.checked)}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: 'var(--color-primary)',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'var(--color-primary)',
                  },
                }}
              />
            </SettingsControls>
          </SettingsGroup>
          <FoldGuideHint>
            ONのとき、折り位置の上下に短い破線（各2mm）をプレビューとPDFに入れます。
          </FoldGuideHint>
        </Box>
      ) : null}
      <Box className="step4-settings__row--border">
        <SettingsGroup>
          <SettingsLabel>枠線を表示</SettingsLabel>
          <SettingsControls>
            <Switch
              checked={showBorder}
              onChange={(e) => onShowBorderChange(e.target.checked)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'var(--color-primary)',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'var(--color-primary)',
                },
              }}
            />
          </SettingsControls>
        </SettingsGroup>
      </Box>
      <Box
        className="step4-settings__row--color"
        sx={{ opacity: showBorder ? 1 : 0.55 }}
      >
        <SettingsLabel>線の色</SettingsLabel>
        <Box className="step4-settings__swatches" role="group" aria-label="線の色">
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
        </Box>
      </Box>
    </Box>
  )
}
