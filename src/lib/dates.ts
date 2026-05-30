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
