/** Step1「あなたの手帳は？」など、サイズ選択ボタンの表示行 */
export const SIZE_PICKER_LINES: Record<string, string[]> = {
  microfive: ['M5', 'Micro5 / ミニ5'],
  m5square: ['M5', 'スクエア'],
  mini6: ['M6', 'ミニ6 / ポケットサイズ'],
  bible: ['Bible', '聖書サイズ'],
}

export interface SizeDefinition {
  id: string
  name: string
  shortName?: string
  w: number | null
  h: number | null
  holePosY: number[] | null
  holeStandard?: string
}

export const SIZES: SizeDefinition[] = [
  {
    id: 'microfive',
    name: 'M5',
    shortName: 'M5',
    w: 62,
    h: 105,
    holePosY: [14.5, 33.5, 52.5, 71.5, 90.5],
  },
  {
    id: 'mini6',
    name: 'M6',
    shortName: 'M6',
    w: 80,
    h: 126,
    holePosY: [15.5, 34.5, 53.5, 72.5, 91.5, 110.5],
  },
  {
    id: 'bible',
    name: 'Bible',
    shortName: 'Bible',
    w: 95,
    h: 170,
    holePosY: [21.5, 40.5, 59.5, 110.5, 129.5, 148.5],
  },
  {
    id: 'm5square',
    name: 'M5スクエア',
    shortName: 'M5スクエア',
    w: 105,
    h: 105,
    holePosY: [14.5, 33.5, 52.5, 71.5, 90.5],
  },
  {
    id: 'custom',
    name: 'カスタム',
    w: null,
    h: null,
    holePosY: null,
    // 穴規格を選べる
    holeStandard: 'mini6',
  },
]

/** カスタムサイズ時に選べる穴規格（Step1プリセットの M5 / M6 / Bible に合わせる） */
export const HOLE_STANDARDS = [{ id: 'microfive' }, { id: 'mini6' }, { id: 'bible' }]

export const A4 = {
  portrait: { w: 210, h: 297 },
  landscape: { w: 297, h: 210 },
} as const

export type PaperOrientation = keyof typeof A4

export function getHolePositions(
  size: SizeDefinition | null | undefined,
  customHoleStandard?: string,
): number[] {
  if (!size) return []
  if (size.id === 'custom') {
    const standard = SIZES.find((s) => s.id === (customHoleStandard || 'mini6'))
    return standard!.holePosY!
  }
  return size.holePosY!
}
