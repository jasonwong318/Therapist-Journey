import type { Client, Session, Invoice } from './types'
import { isBillable } from './billing'
import { rateOn, sessionCost } from './rates'
import { t } from './i18n'

const csvCell = (v: string | number): string => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Annual income report: one row per billable session, plus a summary block.
// Prefixed with a BOM so Excel opens the CJK text correctly.
export const buildYearCSV = (
  year: number,
  clients: Client[],
  sessions: Session[],
  invoices: Invoice[],
  currency: string,
): string => {
  const clientById = new Map(clients.map(c => [c.id, c]))
  const invoiceById = new Map(invoices.map(i => [i.id, i]))

  const rows = sessions
    .filter(s => s.date.startsWith(String(year)) && isBillable(s))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const header = [
    t.dateLabel, t.clients, t.timeLabel, `${t.durationLabel} (h)`,
    `${t.hourlyRate.replace(/（.*）|\(.*\)/, '').trim()}`, `${t.totalAmount} (${currency})`,
    t.statusLabel, t.invoice, t.paid,
  ]

  const lines = rows.map(s => {
    const client = clientById.get(s.clientId)
    const invoice = s.invoiceId ? invoiceById.get(s.invoiceId) : undefined
    return [
      s.date,
      client?.name ?? '?',
      s.startTime,
      s.duration,
      client ? rateOn(client, s.date) : '',
      client ? sessionCost(client, s) : '',
      t.statusLabels[s.status] ?? s.status,
      invoice?.invoiceNumber ?? '',
      invoice ? (invoice.paidAt ? '✓' : '✗') : '',
    ].map(csvCell).join(',')
  })

  const total = rows.reduce((sum, s) => {
    const client = clientById.get(s.clientId)
    return sum + (client ? sessionCost(client, s) : 0)
  }, 0)
  const totalHours = rows.reduce((sum, s) => sum + s.duration, 0)
  const paidTotal = rows.reduce((sum, s) => {
    const client = clientById.get(s.clientId)
    const invoice = s.invoiceId ? invoiceById.get(s.invoiceId) : undefined
    return sum + (client && invoice?.paidAt ? sessionCost(client, s) : 0)
  }, 0)

  const summary = [
    '',
    [t.total, rows.length + ' ' + t.sessions, '', totalHours, '', total, '', '', ''].map(csvCell).join(','),
    ['', t.paid, '', '', '', paidTotal, '', '', ''].map(csvCell).join(','),
    ['', t.outstanding, '', '', '', total - paidTotal, '', '', ''].map(csvCell).join(','),
  ]

  return '\uFEFF' + [header.map(csvCell).join(','), ...lines, ...summary].join('\n')
}

export const downloadCSV = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
