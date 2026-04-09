import type { AccentColor } from '../types/calculator'

export interface AccentOption {
  id: AccentColor
  labelEn: string
  labelRu: string
  rgb: [number, number, number]
  softRgb: [number, number, number]
  deepRgb: [number, number, number]
}

const ACCENT_OPTIONS: readonly AccentOption[] = [
  {
    id: 'cyan',
    labelEn: 'Cyan',
    labelRu: 'Циан',
    rgb: [6, 182, 212],
    softRgb: [207, 250, 254],
    deepRgb: [8, 145, 178],
  },
  {
    id: 'blue',
    labelEn: 'Blue',
    labelRu: 'Синий',
    rgb: [59, 130, 246],
    softRgb: [219, 234, 254],
    deepRgb: [37, 99, 235],
  },
  {
    id: 'emerald',
    labelEn: 'Emerald',
    labelRu: 'Изумруд',
    rgb: [16, 185, 129],
    softRgb: [209, 250, 229],
    deepRgb: [5, 150, 105],
  },
  {
    id: 'violet',
    labelEn: 'Violet',
    labelRu: 'Фиолет',
    rgb: [139, 92, 246],
    softRgb: [237, 233, 254],
    deepRgb: [124, 58, 237],
  },
  {
    id: 'rose',
    labelEn: 'Rose',
    labelRu: 'Роза',
    rgb: [244, 63, 94],
    softRgb: [255, 228, 230],
    deepRgb: [225, 29, 72],
  },
  {
    id: 'amber',
    labelEn: 'Amber',
    labelRu: 'Янтарь',
    rgb: [245, 158, 11],
    softRgb: [254, 243, 199],
    deepRgb: [217, 119, 6],
  },
  {
    id: 'teal',
    labelEn: 'Teal',
    labelRu: 'Бирюза',
    rgb: [20, 184, 166],
    softRgb: [204, 251, 241],
    deepRgb: [13, 148, 136],
  },
  {
    id: 'slate',
    labelEn: 'Slate',
    labelRu: 'Графит',
    rgb: [100, 116, 139],
    softRgb: [226, 232, 240],
    deepRgb: [71, 85, 105],
  },
]

export const accentOptions = ACCENT_OPTIONS
export const defaultAccentColor: AccentColor = 'cyan'

const accentMap = new Map<AccentColor, AccentOption>(
  accentOptions.map((option) => [option.id, option] as const),
)

export function isSupportedAccentColor(value: string): value is AccentColor {
  return accentMap.has(value as AccentColor)
}

export function getAccentOption(accentColor: AccentColor): AccentOption {
  return accentMap.get(accentColor) ?? accentMap.get(defaultAccentColor)!
}
