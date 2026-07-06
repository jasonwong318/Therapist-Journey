import { describe, it, expect } from 'vitest'
import { buildYearCSV } from '../report'
import type { Client, Session, Invoice } from '../types'

const client: Client = {
  id: 'c1', name: '陳小明', color: '', hourlyRate: 900,
  rateHistory: [{ from: '1970-01-01', rate: 800 }, { from: '2026-06-01', rate: 900 }],
  defaultDuration: 1, schedule: [], notes: '',
}

const sessions: Session[] = [
  { id: 's1', clientId: 'c1', date: '2026-05-04', startTime: '10:00', duration: 1, status: 'completed', notes: '', isRecurring: true, invoiceId: 'i1' },
  { id: 's2', clientId: 'c1', date: '2026-06-08', startTime: '10:00', duration: 1.5, status: 'completed', notes: '', isRecurring: true },
  { id: 's3', clientId: 'c1', date: '2026-06-15', startTime: '10:00', duration: 1, status: 'cancelled', notes: '', isRecurring: true },
  { id: 's4', clientId: 'c1', date: '2025-12-01', startTime: '10:00', duration: 1, status: 'completed', notes: '', isRecurring: true },
]

const invoices: Invoice[] = [
  { id: 'i1', invoiceNumber: 'INV-0001', clientId: 'c1', month: '2026-05', sessionIds: ['s1'], issuedAt: '2026-06-01', paidAt: '2026-06-05', totalAmount: 800 },
]

describe('buildYearCSV', () => {
  const csv = buildYearCSV(2026, [client], sessions, invoices, 'HKD')
  const lines = csv.split('\n')

  it('includes only billable sessions of the requested year', () => {
    expect(csv).toContain('2026-05-04')
    expect(csv).toContain('2026-06-08')
    expect(csv).not.toContain('2026-06-15') // cancelled
    expect(csv).not.toContain('2025-12-01') // wrong year
  })

  it('uses the per-date rate', () => {
    const may = lines.find(l => l.startsWith('2026-05-04'))!
    const jun = lines.find(l => l.startsWith('2026-06-08'))!
    expect(may).toContain('800')
    expect(jun).toContain('1350') // 900 * 1.5
  })

  it('includes invoice number and paid mark', () => {
    const may = lines.find(l => l.startsWith('2026-05-04'))!
    expect(may).toContain('INV-0001')
    expect(may).toContain('✓')
  })

  it('summary totals add up', () => {
    expect(csv).toContain('2150') // 800 + 1350 grand total
  })
})
