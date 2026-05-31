import { useState } from 'react'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { calendarWeeks, toDateStr, formatDisplay, getMonth } from '../lib/dates'
import { HK_HOLIDAYS } from '../lib/hkHolidays'
import type { Session, SessionStatus, SessionDuration } from '../lib/types'
import { t } from '../lib/i18n'

const CLIENT_COLORS = ['#635BFF', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export const Calendar = () => {
  const { clients, sessions, holidays, updateSession, addSession, addHoliday, removeHoliday, ensureSessionsForMonth } = useStoreCtx()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [addSessionModal, setAddSessionModal] = useState(false)
  const [holidayModal, setHolidayModal] = useState(false)
  const [holidayLabel, setHolidayLabel] = useState('')
  const [newSession, setNewSession] = useState({ clientId: '', startTime: '10:00', duration: 1 as SessionDuration })

  const weeks = calendarWeeks(year, month)
  const today = toDateStr(now)

  const dayMap: Record<string, Session[]> = {}
  sessions.forEach(s => {
    if (!dayMap[s.date]) dayMap[s.date] = []
    dayMap[s.date].push(s)
  })

  const userHolidayMap = new Map(holidays.map(h => [h.date, h.label || t.isHoliday]))
  const getHolidayLabel = (dateStr: string): string | null => {
    if (userHolidayMap.has(dateStr)) return userHolidayMap.get(dateStr)!
    if (HK_HOLIDAYS[dateStr]) return HK_HOLIDAYS[dateStr]
    return null
  }
  const isUserHoliday = (dateStr: string) => userHolidayMap.has(dateStr)

  const prevMonth = () => {
    let y = year, m = month
    if (m === 0) { y -= 1; m = 11 } else m -= 1
    setYear(y); setMonth(m)
  }
  const nextMonth = () => {
    let y = year, m = month
    if (m === 11) { y += 1; m = 0 } else m += 1
    setYear(y); setMonth(m)
    ensureSessionsForMonth(y, m)
  }

  const selectedSessions = selectedDate ? (dayMap[selectedDate] ?? []).sort((a, b) => a.startTime.localeCompare(b.startTime)) : []
  const selectedHolidayLabel = selectedDate ? getHolidayLabel(selectedDate) : null
  const selectedIsUserHoliday = selectedDate ? isUserHoliday(selectedDate) : false

  const getClientColor = (clientId: string) => {
    const idx = clients.findIndex(c => c.id === clientId)
    return CLIENT_COLORS[idx % CLIENT_COLORS.length] ?? '#635BFF'
  }

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.monthNames[month]} {year}</h1>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {t.dayLabels.map((d, i) => (
          <div key={i} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              const dateStr = toDateStr(day)
              const isCurrentMonth = getMonth(day) === month
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              const daySessions = dayMap[dateStr] ?? []
              const holLabel = getHolidayLabel(dateStr)
              const isHol = !!holLabel && isCurrentMonth
              const hasContent = (daySessions.length > 0 || isHol) && isCurrentMonth

              return (
                <button
                  key={di}
                  onClick={() => isCurrentMonth && setSelectedDate(isSelected ? null : dateStr)}
                  className={`aspect-square flex flex-col items-center justify-start pt-1 rounded-xl relative transition-colors ${
                    !isCurrentMonth ? 'opacity-20 cursor-default' : ''
                  } ${isSelected ? 'bg-[#635BFF] text-white' : isToday ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#635BFF]' : isHol ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : isToday ? 'text-[#635BFF]' : isHol ? 'text-red-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {day.getDate()}
                  </span>
                  {hasContent && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center px-0.5">
                      {isHol && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? 'white' : '#f87171' }} />}
                      {daySessions.slice(0, 2).map(s => (
                        <div key={s.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? 'white' : getClientColor(s.clientId) }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDisplay(selectedDate)}</h2>
              {selectedHolidayLabel && (
                <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {selectedHolidayLabel}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {selectedIsUserHoliday ? (
                <button onClick={() => removeHoliday(selectedDate)} className="text-xs text-red-400 font-medium">{t.cancelHoliday}</button>
              ) : (
                <button onClick={() => { setHolidayLabel(''); setHolidayModal(true) }} className="text-xs text-slate-400 font-medium">{t.addHoliday}</button>
              )}
              <button onClick={() => setAddSessionModal(true)} className="text-sm text-[#635BFF] font-medium">{t.addSession}</button>
            </div>
          </div>

          {selectedSessions.length === 0 && !selectedHolidayLabel ? (
            <Card><p className="text-sm text-slate-400 text-center py-3">{t.noSessionsDay}</p></Card>
          ) : (
            <div className="space-y-2">
              {selectedSessions.map(s => {
                const client = clients.find(c => c.id === s.clientId)
                if (!client) return null
                return (
                  <Card key={s.id} className="!p-4 flex items-center gap-3">
                    <div className="w-2 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: getClientColor(s.clientId) }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{client.name}</p>
                      <p className="text-xs text-slate-400">{s.startTime} · {s.duration}小時</p>
                    </div>
                    <select
                      className="text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      value={s.status}
                      onChange={e => updateSession(s.id, { status: e.target.value as SessionStatus })}
                    >
                      <option value="scheduled">{t.statusLabels.scheduled}</option>
                      <option value="completed">{t.statusLabels.completed}</option>
                      <option value="cancelled">{t.statusLabels.cancelled}</option>
                      <option value="late_cancel">{t.statusLabels.late_cancel}</option>
                      <option value="rescheduled">{t.statusLabels.rescheduled}</option>
                    </select>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Modal open={addSessionModal} onClose={() => setAddSessionModal(false)} title={selectedDate ? t.addSessionTitle(formatDisplay(selectedDate)) : ''}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.clients}</label>
            <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100" value={newSession.clientId} onChange={e => setNewSession(s => ({ ...s, clientId: e.target.value }))}>
              <option value="">{t.selectClient}</option>
              {clients.filter(c => !c.archivedAt).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.time}</label>
              <input type="time" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100" value={newSession.startTime} onChange={e => setNewSession(s => ({ ...s, startTime: e.target.value }))} />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.duration}</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100" value={newSession.duration} onChange={e => setNewSession(s => ({ ...s, duration: Number(e.target.value) as SessionDuration }))}>
                <option value={1}>{t.oneHour}</option>
                <option value={1.5}>{t.oneHalfHour}</option>
                <option value={2}>{t.twoHours}</option>
              </select>
            </div>
          </div>
          <Button fullWidth disabled={!newSession.clientId || !selectedDate} onClick={() => {
            if (!newSession.clientId || !selectedDate) return
            addSession({ clientId: newSession.clientId, date: selectedDate, startTime: newSession.startTime, duration: newSession.duration, status: 'scheduled', notes: '', isRecurring: false })
            setAddSessionModal(false)
          }}>
            {t.addSession.replace('+ ', '')}
          </Button>
        </div>
      </Modal>

      <Modal open={holidayModal} onClose={() => setHolidayModal(false)} title={t.markHoliday}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.holidayLabel}</label>
            <input
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              placeholder={t.holidayPlaceholder}
              value={holidayLabel}
              onChange={e => setHolidayLabel(e.target.value)}
            />
          </div>
          <Button fullWidth onClick={() => {
            if (selectedDate) addHoliday(selectedDate, holidayLabel)
            setHolidayModal(false)
          }}>
            {t.confirmMarkHoliday}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
