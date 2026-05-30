import type { Client, Session } from './types'
import { toDateStr, recurringDatesInMonth } from './dates'
import { nanoid } from './nanoid'

export const generateSessionsForMonth = (clients: Client[], existingSessions: Session[], year: number, month: number): Session[] => {
  const newSessions: Session[] = []

  for (const client of clients) {
    if (client.archivedAt) continue
    for (const slot of client.schedule) {
      const dates = recurringDatesInMonth(slot.dayOfWeek, year, month)
      for (const date of dates) {
        const dateStr = toDateStr(date)
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
