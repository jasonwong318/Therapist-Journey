// Hong Kong statutory public holidays 2025–2026
type HolidayEntry = { zh: string; en: string }
const HK_HOLIDAYS_BILINGUAL: Record<string, HolidayEntry> = {
  // 2025
  '2025-01-01': { zh: '元旦', en: "New Year's Day" },
  '2025-01-29': { zh: '農曆年初一', en: 'Lunar New Year Day 1' },
  '2025-01-30': { zh: '農曆年初二', en: 'Lunar New Year Day 2' },
  '2025-01-31': { zh: '農曆年初三', en: 'Lunar New Year Day 3' },
  '2025-04-04': { zh: '清明節', en: 'Ching Ming Festival' },
  '2025-04-18': { zh: '耶穌受難節', en: 'Good Friday' },
  '2025-04-19': { zh: '耶穌受難節翌日', en: 'Day after Good Friday' },
  '2025-04-21': { zh: '復活節星期一', en: 'Easter Monday' },
  '2025-05-01': { zh: '勞動節', en: 'Labour Day' },
  '2025-05-05': { zh: '佛誕', en: "Buddha's Birthday" },
  '2025-05-31': { zh: '端午節', en: 'Tuen Ng Festival' },
  '2025-07-01': { zh: '香港回歸紀念日', en: 'HKSAR Establishment Day' },
  '2025-09-07': { zh: '中秋節翌日', en: 'Day after Mid-Autumn' },
  '2025-10-01': { zh: '國慶日', en: 'National Day' },
  '2025-10-02': { zh: '重陽節', en: 'Chung Yeung Festival' },
  '2025-12-25': { zh: '聖誕節', en: 'Christmas Day' },
  '2025-12-26': { zh: '聖誕節後第一個周日', en: 'Boxing Day' },
  // 2026
  '2026-01-01': { zh: '元旦', en: "New Year's Day" },
  '2026-02-17': { zh: '農曆年初一', en: 'Lunar New Year Day 1' },
  '2026-02-18': { zh: '農曆年初二', en: 'Lunar New Year Day 2' },
  '2026-02-19': { zh: '農曆年初三', en: 'Lunar New Year Day 3' },
  '2026-04-03': { zh: '清明節', en: 'Ching Ming Festival' },
  '2026-04-05': { zh: '耶穌受難節', en: 'Good Friday' },
  '2026-04-06': { zh: '耶穌受難節翌日', en: 'Day after Good Friday' },
  '2026-04-07': { zh: '復活節星期一', en: 'Easter Monday' },
  '2026-05-01': { zh: '勞動節', en: 'Labour Day' },
  '2026-05-24': { zh: '佛誕', en: "Buddha's Birthday" },
  '2026-06-20': { zh: '端午節', en: 'Tuen Ng Festival' },
  '2026-07-01': { zh: '香港回歸紀念日', en: 'HKSAR Establishment Day' },
  '2026-09-26': { zh: '中秋節翌日', en: 'Day after Mid-Autumn' },
  '2026-10-01': { zh: '國慶日', en: 'National Day' },
  '2026-10-22': { zh: '重陽節', en: 'Chung Yeung Festival' },
  '2026-12-25': { zh: '聖誕節', en: 'Christmas Day' },
  '2026-12-26': { zh: '聖誕節後第一個周日', en: 'Boxing Day' },
}

export const getHKHolidayLabel = (dateStr: string): string | undefined => {
  const entry = HK_HOLIDAYS_BILINGUAL[dateStr]
  if (!entry) return undefined
  const lang = localStorage.getItem('tt_lang') ?? 'zh'
  return lang === 'en' ? entry.en : entry.zh
}

// Keep backward-compatible export for any code checking existence
export const HK_HOLIDAYS: Record<string, string> = Object.fromEntries(
  Object.entries(HK_HOLIDAYS_BILINGUAL).map(([k, v]) => [k, v.zh])
)
