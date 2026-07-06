import type { Client, Session, Holiday, ScheduleSlot } from './types'
import { toDateStr, recurringDatesInMonth } from './dates'
import { getHKHolidayLabel } from './hkHolidays'
import { nanoid } from './nanoid'

const daysSinceEpoch = (dateStr: string) =>
  Math.round(new Date(dateStr + 'T00:00:00').getTime() / 86400000)

// Whether a date falls on the slot's repeat cycle (weekly slots: always).
// Biweekly/four-weekly cycles anchor on startDate; without one, the parity is
// stable but arbitrary — the UI nudges users to set startDate for these slots.
export const isDateInSlotCycle = (slot: ScheduleSlot, dateStr: string): boolean => {
  const interval = slot.intervalWeeks ?? 1
  if (interval <= 1) return true
  const anchor = slot.startDate ?? '1970-01-01'
  const diffWeeks = Math.floor((daysSinceEpoch(dateStr) - daysSinceEpoch(anchor)) / 7)
  return ((diffWeeks % interval) + interval) % interval === 0
}

export const generateSessionsForMonth = (
  clients: Client[],
  existingSessions: Session[],
  year: number,
  month: number,
  holidays: Holiday[] = [],
  skipHKHolidays = false,
): Session[] => {
  const holidayDates = new Set(holidays.map(h => h.date))
  const newSessions: Session[] = []

  for (const client of clients) {
    if (client.archivedAt) continue
    for (const slot of client.schedule) {
      const dates = recurringDatesInMonth(slot.dayOfWeek, year, month)
      for (const date of dates) {
        const dateStr = toDateStr(date)
        if (slot.startDate && dateStr < slot.startDate) continue
        if (slot.endDate && dateStr > slot.endDate) continue
        if (!isDateInSlotCycle(slot, dateStr)) continue
        if (client.pauseStart && client.pauseEnd && dateStr >= client.pauseStart && dateStr <= client.pauseEnd) continue
        if (holidayDates.has(dateStr)) continue
        if (skipHKHolidays && getHKHolidayLabel(dateStr)) continue
        const alreadyExists = existingSessions.some(
          s => s.clientId === client.id && s.date === dateStr && s.startTime === slot.time && s.isRecurring
        )
        if (!alreadyExists) {
          newSessions.push({
            id: nanoid(),
            clientId: client.id,
            date: dateStr,
            startTime: slot.time,
            duration: slot.duration,
            status: 'scheduled',
            notes: '',
            isRecurring: true,
          })
        }
      }
    }
  }

  return newSessions
}
