import { describe, it, expect } from 'vitest'
import { isBillable, billableTotal } from '../billing'
import { rateOn, sessionCost, withRateChange } from '../rates'
import type { Client, Session } from '../types'

const client = (over: Partial<Client> = {}): Client => ({
  id: 'c1', name: 'Test', color: '', hourlyRate: 800,
  defaultDuration: 1, schedule: [], notes: '', ...over,
})

const session = (over: Partial<Session> = {}): Session => ({
  id: 's1', clientId: 'c1', date: '2026-07-04', startTime: '10:00',
  duration: 1, status: 'completed', notes: '', isRecurring: true, ...over,
})

describe('isBillable', () => {
  it('bills completed', () => expect(isBillable(session({ status: 'completed' }))).toBe(true))
  it('bills late cancellations', () => expect(isBillable(session({ status: 'late_cancel' }))).toBe(true))
  it('does not bill cancelled', () => expect(isBillable(session({ status: 'cancelled' }))).toBe(false))
  it('does not bill rescheduled', () => expect(isBillable(session({ status: 'rescheduled' }))).toBe(false))
  it('does not bill scheduled', () => expect(isBillable(session({ status: 'scheduled' }))).toBe(false))
})

describe('rateOn', () => {
  it('uses hourlyRate when no history', () => {
    expect(rateOn(client(), '2026-07-04')).toBe(800)
  })
  it('uses the rate in effect on the session date', () => {
    const c = client({ hourlyRate: 900, rateHistory: [
      { from: '1970-01-01', rate: 800 },
      { from: '2026-08-01', rate: 900 },
    ] })
    expect(rateOn(c, '2026-07-31')).toBe(800)
    expect(rateOn(c, '2026-08-01')).toBe(900)
    expect(rateOn(c, '2026-12-25')).toBe(900)
  })
  it('dates before the earliest entry use the earliest rate', () => {
    const c = client({ rateHistory: [{ from: '2026-08-01', rate: 900 }] })
    expect(rateOn(c, '2020-01-01')).toBe(900)
  })
})

describe('withRateChange', () => {
  it('preserves the old rate before the effective date', () => {
    const c = client({ hourlyRate: 800 })
    const fields = withRateChange(c, 900, '2026-08-01')
    const updated = { ...c, ...fields }
    expect(updated.hourlyRate).toBe(900)
    expect(rateOn(updated, '2026-07-31')).toBe(800)
    expect(rateOn(updated, '2026-08-01')).toBe(900)
  })
  it('same-day change replaces the entry instead of stacking', () => {
    const c = client({ hourlyRate: 800 })
    const once = { ...c, ...withRateChange(c, 900, '2026-08-01') }
    const twice = { ...once, ...withRateChange(once, 950, '2026-08-01') }
    expect(twice.rateHistory!.filter(e => e.from === '2026-08-01')).toHaveLength(1)
    expect(rateOn(twice, '2026-08-01')).toBe(950)
    expect(rateOn(twice, '2026-07-31')).toBe(800)
  })
})

describe('billableTotal / sessionCost', () => {
  it('sums only billable sessions at per-date rates', () => {
    const c = client({ hourlyRate: 900, rateHistory: [
      { from: '1970-01-01', rate: 800 },
      { from: '2026-08-01', rate: 900 },
    ] })
    const list = [
      session({ id: 'a', date: '2026-07-04', duration: 1, status: 'completed' }),      // 800
      session({ id: 'b', date: '2026-08-04', duration: 1.5, status: 'completed' }),    // 1350
      session({ id: 'c', date: '2026-08-11', duration: 1, status: 'late_cancel' }),    // 900
      session({ id: 'd', date: '2026-08-18', duration: 2, status: 'cancelled' }),      // 0
    ]
    expect(billableTotal(list, c)).toBe(800 + 1350 + 900)
  })
  it('half-hour sessions cost half the rate', () => {
    expect(sessionCost(client(), session({ duration: 0.5 }))).toBe(400)
  })
})
