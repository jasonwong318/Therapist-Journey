import {
  format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addWeeks, isSameDay, addMonths, startOfWeek, endOfWeek,
  isAfter, getMonth, getYear,
} from 'date-fns'

export { format, parseISO, isSameDay, getDay, getMonth, getYear, startOfMonth, endOfMonth, addMonths }

export const toDateStr = (d: Date) => format(d, 'yyyy-MM-dd')
export const parseDate = (s: string) => parseISO(s)
export const formatDisplay = (s: string) => format(parseISO(s), 'MMM d, yyyy')
export const formatMonthYear = (s: string) => format(parseISO(s + '-01'), 'MMMM yyyy')

const DAY_NAMES_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const formatDisplayWithDay = (s: string) => {
  const d = parseISO(s)
  const lang = localStorage.getItem('tt_lang') ?? 'zh'
  if (lang === 'en') return `${DAY_NAMES_EN[getDay(d)]}, ${format(d, 'MMM d')}`
  return `${DAY_NAMES_ZH[getDay(d)]} ${format(d, 'M月d日')}`
}
export const todayStr = () => toDateStr(new Date())
export const currentMonth = () => format(new Date(), 'yyyy-MM')

export const calendarWeeks = (year: number, month: number) => {
  const first = new Date(year, month, 1)
  const last = endOfMonth(first)
  const start = startOfWeek(first, { weekStartsOn: 0 })
  const end = endOfWeek(last, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start, end })
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

// Generate recurring session dates for a given month
export const recurringDatesInMonth = (dayOfWeek: number, year: number, month: number): Date[] => {
  const first = new Date(year, month, 1)
  const last = endOfMonth(first)
  const dates: Date[] = []
  // Find first occurrence of dayOfWeek in month
  let cur = new Date(year, month, 1)
  while (getDay(cur) !== dayOfWeek) {
    cur = new Date(cur.getTime() + 86400000)
  }
  while (!isAfter(cur, last)) {
    dates.push(new Date(cur))
    cur = addWeeks(cur, 1)
  }
  return dates
}

export const isInMonth = (dateStr: string, yearMonth: string) => dateStr.startsWith(yearMonth)

// End time of a session, wrapping past midnight (23:00 + 2h → 01:00)
export const endTimeOf = (startTime: string, durationHours: number): string => {
  const [h, m] = startTime.split(':').map(Number)
  const endMins = (h * 60 + m + Math.round(durationHours * 60)) % (24 * 60)
  return `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`
}

// Month selector options: future months on the left, past on the right
export const monthSelectorOptions = (future = 3, past = 5) => {
  const now = new Date()
  const opts: { value: string; label: string }[] = []
  for (let i = future; i >= -past; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    opts.push({ value: val, label: formatMonthYear(val) })
  }
  return opts
}

// Whether two sessions' time ranges overlap (same-day comparison).
export const timesOverlap = (t1: string, hours1: number, t2: string, hours2: number): boolean => {
  const mins = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  const s1 = mins(t1), e1 = s1 + Math.round(hours1 * 60)
  const s2 = mins(t2), e2 = s2 + Math.round(hours2 * 60)
  return s1 < e2 && s2 < e1
}

export const addDaysStr = (dateStr: string, days: number): string => {
  const d = parseISO(dateStr)
  d.setDate(d.getDate() + days)
  return toDateStr(d)
}
