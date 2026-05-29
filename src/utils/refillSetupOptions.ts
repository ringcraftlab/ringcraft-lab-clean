import { calcFoldLayout, calcLayout } from './layout'

type SheetLayout = ReturnType<typeof calcLayout>
type FoldLayout = ReturnType<typeof calcFoldLayout>

type MarginKind = 'single' | 'tight' | 'loose'

export interface SheetLayoutOption {
  id: string
  title: string
  detail: string
  layout: SheetLayout
  iconCols: number
  iconRows: number
  kind: 'sheet'
}

export interface FoldLayoutOption {
  id: string
  title: string
  detail: string
  supported: boolean
  layout: FoldLayout
  iconCols: number
  iconRows: number
  kind: 'fold'
}

export type WizardLayoutOption = SheetLayoutOption | FoldLayoutOption

export interface PrintTypeOption {
  id: string
  title: string
  shortDesc: string
  desc: string
  previewVariant: string
}

function sheetOption(
  mode: 'portrait' | 'landscape',
  layout: SheetLayout,
  marginKind: MarginKind,
): SheetLayoutOption {
  const orientLabel = mode === 'landscape' ? 'A4横向きで印刷' : 'A4縦向きで印刷'
  const title =
    marginKind === 'single'
      ? `A4に${layout.total}枚`
      : marginKind === 'tight'
        ? `A4に${layout.total}枚（余白少なめ）`
        : `A4に${layout.total}枚（余白多め）`

  return {
    id: mode,
    title,
    detail: orientLabel,
    layout,
    iconCols: layout.cols,
    iconRows: layout.rows,
    kind: 'sheet',
  }
}

/** Step 2: A4配置（余白少なめ / 余白多め） */
export function buildSheetLayoutOptions(refillW: number, refillH: number): SheetLayoutOption[] {
  const portrait = calcLayout(refillW, refillH, 'portrait')
  const landscape = calcLayout(refillW, refillH, 'landscape')
  const portraitOk = portrait.total > 0
  const landscapeOk = landscape.total > 0

  if (!portraitOk && !landscapeOk) return []

  if (portraitOk && !landscapeOk) {
    return [sheetOption('portrait', portrait, 'single')]
  }
  if (landscapeOk && !portraitOk) {
    return [sheetOption('landscape', landscape, 'single')]
  }

  if (portrait.total > landscape.total) {
    return [
      sheetOption('portrait', portrait, 'tight'),
      sheetOption('landscape', landscape, 'loose'),
    ]
  }
  if (landscape.total > portrait.total) {
    return [
      sheetOption('landscape', landscape, 'tight'),
      sheetOption('portrait', portrait, 'loose'),
    ]
  }

  return [
    sheetOption('landscape', landscape, 'tight'),
    sheetOption('portrait', portrait, 'loose'),
  ]
}

/** Step 2: 折りリフィル */
export function buildFoldLayoutOptions(refillW: number, refillH: number): FoldLayoutOption[] {
  return [
    { foldCount: 4 as const, id: 'fold4', title: '4つ折り' },
    { foldCount: 3 as const, id: 'fold3', title: '3つ折り' },
  ].map(({ foldCount, id, title }) => {
    const layout = calcFoldLayout(refillW, refillH, foldCount)
    return {
      id,
      title,
      detail: layout.supported
        ? `${layout.bookCount}冊・${layout.total}面・A4横`
        : 'このサイズでは使えません',
      supported: layout.supported,
      layout,
      iconCols: layout.foldCount,
      iconRows: layout.bookCount,
      kind: 'fold',
    }
  })
}

export function buildWizardLayoutOptions(refillW: number, refillH: number): WizardLayoutOption[] {
  return [...buildSheetLayoutOptions(refillW, refillH), ...buildFoldLayoutOptions(refillW, refillH)]
}

/** Step 3: 印刷タイプ */
export const PRINT_TYPES: PrintTypeOption[] = [
  {
    id: 'frame',
    title: 'リフィル枠を印刷',
    shortDesc: '枠とパンチ穴',
    desc: 'リフィル枠とパンチ穴を印刷します。',
    previewVariant: 'frame',
  },
  {
    id: 'background',
    title: '背景画像を印刷',
    shortDesc: 'A4全面に背景',
    desc: 'A4全体に背景画像を入れます。',
    previewVariant: 'background',
  },
  {
    id: 'images',
    title: '個別画像を挿入',
    shortDesc: '枠ごとに写真',
    desc: '各リフィル枠に写真やイラストを配置して印刷します。',
    previewVariant: 'images',
  },
]

export function creationModeForPrintType(printType: string): 'refillImages' | 'a4Frame' {
  return printType === 'images' ? 'refillImages' : 'a4Frame'
}
