import type { Client, Session } from './types'

// Hourly rate in effect on a given date. rateHistory entries mean "from this
// date onwards the rate is X"; dates before the earliest entry use the earliest
// entry's rate. Clients without history always bill at hourlyRate.
export const rateOn = (client: Client, date: string): number => {
  const hist = client.rateHistory
  if (!hist || hist.length === 0) return client.hourlyRate
  const sorted = [...hist].sort((a, b) => a.from.localeCompare(b.from))
  let rate = sorted[0].rate
  for (const entry of sorted) {
    if (entry.from <= date) rate = entry.rate
    else break
  }
  return rate
}

export const sessionCost = (client: Client, s: Pick<Session, 'date' | 'duration'>): number =>
  rateOn(client, s.date) * s.duration

// Appends a rate change effective from the given date. Same-day changes
// replace the existing entry. Returns the fields to merge into the client.
export const withRateChange = (client: Client, newRate: number, effectiveFrom: string): Pick<Client, 'hourlyRate' | 'rateHistory'> => {
  const base = client.rateHistory?.length
    ? client.rateHistory
    : [{ from: '1970-01-01', rate: client.hourlyRate }]
  const history = [...base.filter(e => e.from !== effectiveFrom), { from: effectiveFrom, rate: newRate }]
    .sort((a, b) => a.from.localeCompare(b.from))
  return { hourlyRate: history[history.length - 1].rate, rateHistory: history }
}
