import { describe, it, expect } from 'vitest'
import { generateSessionsForMonth } from '../schedule'
import type { Client, Session, Holiday } from '../types'

const client = (over: Partial<Client> = {}): Client => ({
  id: 'c1', name: 'Test', color: '', hourlyRate: 800,
  defaultDuration: 1, notes: '',
  schedule: [{ dayOfWeek: 1, time: '10:00', duration: 1 }], // Mondays 10:00
  ...over,
})

const JULY = { year: 2026, month: 6 } // Mondays: 6, 13, 20, 27

describe('generateSessionsForMonth', () => {
  it('creates one session per matching weekday', () => {
    const out = generateSessionsForMonth([client()], [], JULY.year, JULY.month)
    expect(out.map(s => s.date)).toEqual(['2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27'])
    expect(out.every(s => s.isRecurring && s.status === 'scheduled' && s.startTime === '10:00')).toBe(true)
  })

  it('does not duplicate existing recurring sessions', () => {
    const first = generateSessionsForMonth([client()], [], JULY.year, JULY.month)
    const again = generateSessionsForMonth([client()], first, JULY.year, JULY.month)
    expect(again).toHaveLength(0)
  })

  it('a cancelled recurring session acts as a tombstone (not regenerated)', () => {
    const first = generateSessionsForMonth([client()], [], JULY.year, JULY.month)
    const withCancelled: Session[] = first.map(s =>
      s.date === '2026-07-13' ? { ...s, status: 'cancelled' as const } : s)
    const again = generateSessionsForMonth([client()], withCancelled, JULY.year, JULY.month)
    expect(again).toHaveLength(0)
  })

  it('skips the client pause period and resumes after', () => {
    const c = client({ pauseStart: '2026-07-10', pauseEnd: '2026-07-25' })
    const out = generateSessionsForMonth([c], [], JULY.year, JULY.month)
    expect(out.map(s => s.date)).toEqual(['2026-07-06', '2026-07-27'])
  })

  it('skips user-marked holidays', () => {
    const holidays: Holiday[] = [{ id: 'h1', date: '2026-07-20', label: 'off' }]
    const out = generateSessionsForMonth([client()], [], JULY.year, JULY.month, holidays)
    expect(out.map(s => s.date)).toEqual(['2026-07-06', '2026-07-13', '2026-07-27'])
  })

  it('skips HK public holidays when enabled', () => {
    // 2026-07-01 is HKSAR Establishment Day (a Wednesday)
    const c = client({ schedule: [{ dayOfWeek: 3, time: '10:00', duration: 1 }] })
    const withFlag = generateSessionsForMonth([c], [], JULY.year, JULY.month, [], true)
    const withoutFlag = generateSessionsForMonth([c], [], JULY.year, JULY.month, [], false)
    expect(withoutFlag.some(s => s.date === '2026-07-01')).toBe(true)
    expect(withFlag.some(s => s.date === '2026-07-01')).toBe(false)
  })

  it('respects slot start/end dates', () => {
    const c = client({ schedule: [{ dayOfWeek: 1, time: '10:00', duration: 1, startDate: '2026-07-10', endDate: '2026-07-24' }] })
    const out = generateSessionsForMonth([c], [], JULY.year, JULY.month)
    expect(out.map(s => s.date)).toEqual(['2026-07-13', '2026-07-20'])
  })

  it('generates nothing for archived clients', () => {
    const out = generateSessionsForMonth([client({ archivedAt: '2026-01-01' })], [], JULY.year, JULY.month)
    expect(out).toHaveLength(0)
  })
})
