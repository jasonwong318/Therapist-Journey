// Hong Kong statutory public holidays.
//
// Static table below is a verified fallback for 2025–2026. On top of that,
// refreshHKHolidays() fetches the official government feed (1823.gov.hk) and
// caches it in localStorage, so future years keep working without an app update.

type HolidayEntry = { zh: string; en: string }

const STATIC_HOLIDAYS: Record<string, HolidayEntry> = {
  // 2025 (per HK Government gazette)
  '2025-01-01': { zh: '元旦', en: "New Year's Day" },
  '2025-01-29': { zh: '農曆年初一', en: 'Lunar New Year Day 1' },
  '2025-01-30': { zh: '農曆年初二', en: 'Lunar New Year Day 2' },
  '2025-01-31': { zh: '農曆年初三', en: 'Lunar New Year Day 3' },
  '2025-04-04': { zh: '清明節', en: 'Ching Ming Festival' },
  '2025-04-18': { zh: '耶穌受難節', en: 'Good Friday' },
  '2025-04-19': { zh: '耶穌受難節翌日', en: 'Day following Good Friday' },
  '2025-04-21': { zh: '復活節星期一', en: 'Easter Monday' },
  '2025-05-01': { zh: '勞動節', en: 'Labour Day' },
  '2025-05-05': { zh: '佛誕', en: "Buddha's Birthday" },
  '2025-05-31': { zh: '端午節', en: 'Tuen Ng Festival' },
  '2025-07-01': { zh: '香港特別行政區成立紀念日', en: 'HKSAR Establishment Day' },
  '2025-10-01': { zh: '國慶日', en: 'National Day' },
  '2025-10-07': { zh: '中秋節翌日', en: 'Day following Mid-Autumn Festival' },
  '2025-10-29': { zh: '重陽節', en: 'Chung Yeung Festival' },
  '2025-12-25': { zh: '聖誕節', en: 'Christmas Day' },
  '2025-12-26': { zh: '聖誕節後第一個周日', en: 'First weekday after Christmas Day' },
  // 2026
  '2026-01-01': { zh: '元旦', en: "New Year's Day" },
  '2026-02-17': { zh: '農曆年初一', en: 'Lunar New Year Day 1' },
  '2026-02-18': { zh: '農曆年初二', en: 'Lunar New Year Day 2' },
  '2026-02-19': { zh: '農曆年初三', en: 'Lunar New Year Day 3' },
  '2026-04-03': { zh: '耶穌受難節', en: 'Good Friday' },
  '2026-04-04': { zh: '耶穌受難節翌日', en: 'Day following Good Friday' },
  '2026-04-06': { zh: '復活節星期一', en: 'Easter Monday' },
  '2026-04-07': { zh: '清明節翌日', en: 'Day following Ching Ming Festival' },
  '2026-05-01': { zh: '勞動節', en: 'Labour Day' },
  '2026-05-25': { zh: '佛誕翌日', en: "Day following Buddha's Birthday" },
  '2026-06-19': { zh: '端午節', en: 'Tuen Ng Festival' },
  '2026-07-01': { zh: '香港特別行政區成立紀念日', en: 'HKSAR Establishment Day' },
  '2026-09-26': { zh: '中秋節翌日', en: 'Day following Mid-Autumn Festival' },
  '2026-10-01': { zh: '國慶日', en: 'National Day' },
  '2026-10-19': { zh: '重陽節翌日', en: 'Day following Chung Yeung Festival' },
  '2026-12-25': { zh: '聖誕節', en: 'Christmas Day' },
  '2026-12-26': { zh: '聖誕節後第一個周日', en: 'First weekday after Christmas Day' },
}

const CACHE_KEY = 'tt_hk_holidays'
const CACHE_MAX_AGE_MS = 30 * 24 * 3600 * 1000 // refetch monthly

type HolidayCache = { fetchedAt: string; data: Record<string, HolidayEntry> }

const storage = (): Storage | null => (typeof localStorage === 'undefined' ? null : localStorage)

const loadCache = (): HolidayCache | null => {
  try {
    const raw = storage()?.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as HolidayCache
    return parsed && typeof parsed.data === 'object' ? parsed : null
  } catch {
    return null
  }
}

// In-memory merged map: static fallback overlaid with the official feed.
let merged: Record<string, HolidayEntry> = { ...STATIC_HOLIDAYS, ...(loadCache()?.data ?? {}) }

// Official feed: https://www.1823.gov.hk/common/ical/{en,tc}.json (iCal-as-JSON).
// Best effort — offline or blocked fetches leave the static/cached data in place.
export const refreshHKHolidays = async (): Promise<void> => {
  const cache = loadCache()
  if (cache && Date.now() - new Date(cache.fetchedAt).getTime() < CACHE_MAX_AGE_MS) return
  try {
    const [en, tc] = await Promise.all([
      fetch('https://www.1823.gov.hk/common/ical/en.json').then(r => r.json()),
      fetch('https://www.1823.gov.hk/common/ical/tc.json').then(r => r.json()),
    ])
    type VEvent = { dtstart: [string, unknown]; summary: string }
    const parse = (json: { vcalendar?: { vevent?: VEvent[] }[] }): Record<string, string> => {
      const out: Record<string, string> = {}
      for (const ev of json.vcalendar?.[0]?.vevent ?? []) {
        const raw = String(ev.dtstart?.[0] ?? '') // "YYYYMMDD"
        if (raw.length >= 8) out[`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`] = ev.summary
      }
      return out
    }
    const enMap = parse(en)
    const tcMap = parse(tc)
    const data: Record<string, HolidayEntry> = {}
    for (const date of Object.keys(enMap)) {
      data[date] = { en: enMap[date], zh: tcMap[date] ?? enMap[date] }
    }
    if (Object.keys(data).length === 0) return
    merged = { ...STATIC_HOLIDAYS, ...data }
    storage()?.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: new Date().toISOString(), data } satisfies HolidayCache))
  } catch {
    // offline / CORS failure — keep static + previous cache
  }
}

export const getHKHolidayLabel = (dateStr: string): string | undefined => {
  const entry = merged[dateStr]
  if (!entry) return undefined
  const lang = storage()?.getItem('tt_lang') ?? 'zh'
  return lang === 'en' ? entry.en : entry.zh
}

// True when we have no holiday data at all for the given year (e.g. far future
// and the official feed hasn't been reachable) — callers can warn the user.
export const hasHolidayDataForYear = (year: number): boolean =>
  Object.keys(merged).some(d => d.startsWith(String(year)))
