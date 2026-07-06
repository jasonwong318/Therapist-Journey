import { describe, it, expect } from 'vitest'
import { endTimeOf, addDaysStr, isInMonth, timesOverlap, recurringDatesInMonth, toDateStr } from '../dates'

describe('endTimeOf', () => {
  it('adds whole hours', () => expect(endTimeOf('10:00', 1)).toBe('11:00'))
  it('adds half hours', () => expect(endTimeOf('10:00', 0.5)).toBe('10:30'))
  it('adds 1.5 hours', () => expect(endTimeOf('09:30', 1.5)).toBe('11:00'))
  it('wraps past midnight', () => expect(endTimeOf('23:30', 1.5)).toBe('01:00'))
})

describe('addDaysStr', () => {
  it('adds within a month', () => expect(addDaysStr('2026-07-04', 7)).toBe('2026-07-11'))
  it('crosses a month boundary', () => expect(addDaysStr('2026-07-28', 7)).toBe('2026-08-04'))
  it('crosses a year boundary', () => expect(addDaysStr('2026-12-28', 7)).toBe('2027-01-04'))
})

describe('isInMonth', () => {
  it('matches same month', () => expect(isInMonth('2026-07-04', '2026-07')).toBe(true))
  it('rejects other months', () => expect(isInMonth('2026-08-01', '2026-07')).toBe(false))
})

describe('timesOverlap', () => {
  it('detects containment', () => expect(timesOverlap('10:00', 1.5, '11:00', 1)).toBe(true))
  it('detects identical start', () => expect(timesOverlap('10:00', 1, '10:00', 0.5)).toBe(true))
  it('back-to-back sessions do not overlap', () => expect(timesOverlap('10:00', 1, '11:00', 1)).toBe(false))
  it('disjoint sessions do not overlap', () => expect(timesOverlap('09:00', 1, '14:00', 2)).toBe(false))
})

describe('recurringDatesInMonth', () => {
  it('finds all Mondays of July 2026', () => {
    const dates = recurringDatesInMonth(1, 2026, 6).map(toDateStr)
    expect(dates).toEqual(['2026-07-06', '2026-07-13', '2026-07-20', '2026-07-27'])
  })
  it('every date falls on the requested weekday', () => {
    const dates = recurringDatesInMonth(3, 2026, 1) // Wednesdays, Feb 2026
    expect(dates.every(d => d.getDay() === 3)).toBe(true)
  })
})
