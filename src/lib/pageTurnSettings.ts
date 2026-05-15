/**
 * Paramètres additionnels du panneau « effet des pages » (persistés + Turn.js).
 * Les clés doivent rester alignées avec `api/src/lib/pageTurnSettings.ts`.
 */

export const PAGE_TURN_SETTING_KEYS = [
  'soundOnTurn',
  'pageEdges',
  'rtlRead',
  'showPageDepth',
  'showPageShadow',
  'roundedCorners',
  'centerWhenSingle',
] as const

export type PageTurnSettingKey = (typeof PAGE_TURN_SETTING_KEYS)[number]

export type PageTurnSettings = Record<PageTurnSettingKey, boolean>

export const defaultPageTurnSettings: PageTurnSettings = {
  soundOnTurn: true,
  pageEdges: true,
  rtlRead: false,
  showPageDepth: true,
  showPageShadow: true,
  roundedCorners: false,
  centerWhenSingle: true,
}

export function mergePageTurnSettings(raw: unknown): PageTurnSettings {
  const out = { ...defaultPageTurnSettings }
  if (raw === null || raw === undefined) return out
  if (typeof raw !== 'object' || Array.isArray(raw)) return out
  const o = raw as Record<string, unknown>
  for (const key of PAGE_TURN_SETTING_KEYS) {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      const v = o[key]
      if (typeof v === 'boolean') out[key] = v
    }
  }
  return out
}
