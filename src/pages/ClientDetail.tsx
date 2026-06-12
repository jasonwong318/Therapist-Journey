import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { formatDisplayWithDay, currentMonth, isInMonth, formatMonthYear, todayStr, monthSelectorOptions, addDaysStr } from '../lib/dates'
import { getHKHolidayLabel } from '../lib/hkHolidays'
import { billableTotal } from '../lib/billing'
import { t } from '../lib/i18n'
import type { Session, SessionStatus, SessionDuration } from '../lib/types'

const STATUS_COLORS: Record<SessionStatus, 'green' | 'slate' | 'indigo' | 'orange' | 'yellow'> = {
  completed: 'green',
  cancelled: 'slate',
  scheduled: 'indigo',
  rescheduled: 'yellow',
  late_cancel: 'orange',
}

export const ClientDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clients, sessions, invoices, settings, createInvoice, updateSession, updateInvoice, deleteSession, addSession, deleteInvoice } = useStoreCtx()
  const client = clients.find(c => c.id === id)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [editDuration, setEditDuration] = useState<SessionDuration | null>(null)
  const [editStatus, setEditStatus] = useState<SessionStatus | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [newDate, setNewDate] = useState(todayStr())
  const [newTime, setNewTime] = useState('10:00')
  const [newDuration, setNewDuration] = useState<SessionDuration>(1)
  const [newStatus, setNewStatus] = useState<'scheduled' | 'completed'>('completed')

  if (!client) return <div className="p-8 text-center text-slate-400">找不到客人。</div>

  const cur = settings.currency
  const clientSessions = sessions
    .filter(s => s.clientId === id && isInMonth(s.date, selectedMonth))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const completedSessions = clientSessions.filter(s => s.status === 'completed')
  const monthTotal = completedSessions.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
  const uninvoicedSessions = completedSessions.filter(s => !s.invoiceId)
  const monthInvoice = invoices.find(inv => inv.clientId === id && inv.month === selectedMonth)

  const isFutureMonth = selectedMonth > currentMonth()
  const isPaused = !!client.pauseStart && !!client.pauseEnd && todayStr() >= client.pauseStart && todayStr() <= client.pauseEnd

  const openSession = (session: Session) => {
    setActiveSession(session)
    setEditDuration(session.duration)
    setEditStatus(session.status)
    setEditDate(session.date)
    setEditTime(session.startTime)
    setEditNotes(session.notes)
  }

  const handleSaveSession = () => {
    if (!activeSession) return
    const updates: Partial<Session> = {
      status: editStatus ?? activeSession.status,
      duration: editDuration ?? activeSession.duration,
      notes: editNotes,
    }
    if (!activeSession.isRecurring) {
      updates.date = editDate || activeSession.date
      updates.startTime = editTime || activeSession.startTime
    }
    updateSession(activeSession.id, updates)
    setActiveSession(null)
  }

  const handleDeleteSession = () => {
    if (!activeSession) return
    if (!window.confirm(t.confirmDeleteSession)) return
    deleteSession(activeSession.id)
    setActiveSession(null)
  }

  const handleCopyToNextWeek = () => {
    if (!activeSession) return
    const date = addDaysStr(activeSession.date, 7)
    addSession({
      clientId: client.id,
      date,
      startTime: activeSession.startTime,
      duration: activeSession.duration,
      status: 'scheduled',
      notes: '',
      isRecurring: false,
    })
    setActiveSession(null)
  }

  const hasConflict = (date: string, time: string) =>
    sessions.some(s => s.date === date && s.startTime === time && s.status === 'scheduled')

  const openAddModal = () => {
    setNewDate(todayStr())
    setNewTime(client.schedule[0]?.time ?? '10:00')
    setNewDuration(client.defaultDuration ?? 1)
    setNewStatus('completed')
    setAddModal(true)
  }

  const handleAddSession = () => {
    if (hasConflict(newDate, newTime) && !window.confirm(t.conflictWarning)) return
    addSession({
      clientId: id!,
      date: newDate,
      startTime: newTime,
      duration: newDuration,
      status: newStatus,
      notes: '',
      isRecurring: false,
    })
    setAddModal(false)
  }

  const handleUpdateInvoice = () => {
    if (!monthInvoice || uninvoicedSessions.length === 0) return
    const newSessionIds = [...monthInvoice.sessionIds, ...uninvoicedSessions.map(s => s.id)]
    const allSessions = sessions.filter(s => newSessionIds.includes(s.id))
    const newTotal = billableTotal(allSessions, client)
    updateInvoice(monthInvoice.id, { sessionIds: newSessionIds, totalAmount: newTotal })
    uninvoicedSessions.forEach(s => updateSession(s.id, { invoiceId: monthInvoice.id }))
  }

  const handleDeleteInvoice = () => {
    if (!monthInvoice) return
    if (!window.confirm(t.confirmVoidInvoice)) return
    deleteInvoice(monthInvoice.id)
  }

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clients')} aria-label="Back" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{client.name}</h1>
            {isPaused && <Badge color="orange">{t.pausedTag}</Badge>}
          </div>
          <p className="text-xs text-slate-400">{cur} {client.hourlyRate}{t.perHour}</p>
        </div>
        <Link to={`/clients/${id}/edit`}><Button variant="secondary" size="sm">{t.edit}</Button></Link>
      </div>

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {monthSelectorOptions().map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelectedMonth(opt.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedMonth === opt.value
                ? 'bg-[#635BFF] text-white'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Monthly summary */}
      <Card className="!p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.monthlyEarnings(formatMonthYear(selectedMonth))}</p>
            <p className="text-2xl font-bold text-[#635BFF] mt-0.5">{cur} {monthTotal.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedSessions.length} {t.sessions} · {t.totalHours(completedSessions.reduce((s, x) => s + x.duration, 0))}
            </p>
          </div>
          <div className="text-right space-y-1">
            {monthInvoice ? (
              <>
                <Badge color={monthInvoice.paidAt ? 'green' : monthInvoice.sentAt ? 'yellow' : 'indigo'}>
                  {monthInvoice.paidAt ? t.paid : monthInvoice.sentAt ? t.sent : t.invoiced}
                </Badge>
                <Link to={`/invoices/${monthInvoice.id}`}>
                  <p className="text-xs text-[#635BFF] font-medium">{monthInvoice.invoiceNumber}</p>
                </Link>
                {!monthInvoice.paidAt && (
                  <div className="flex gap-1 justify-end mt-1">
                    {uninvoicedSessions.length > 0 && (
                      <button
                        onClick={handleUpdateInvoice}
                        className="text-xs text-[#635BFF] border border-[#635BFF] px-2 py-0.5 rounded-lg font-medium"
                      >
                        {t.updateInvoice}
                      </button>
                    )}
                    <button
                      onClick={handleDeleteInvoice}
                      className="text-xs text-red-400 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-lg font-medium"
                    >
                      {t.voidInvoice}
                    </button>
                  </div>
                )}
              </>
            ) : uninvoicedSessions.length > 0 ? (
              <Button size="sm" onClick={() => createInvoice(id!, selectedMonth, uninvoicedSessions.map(s => s.id))}>
                {t.invoice}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Session list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.sessionBreakdown}</h2>
          <button onClick={openAddModal} className="text-sm text-[#635BFF] font-medium">{t.addAdhoc}</button>
        </div>
        {clientSessions.length === 0 ? (
          <Card><p className="text-sm text-slate-400 text-center py-4">{t.noSessionsThisMonth}</p></Card>
        ) : (
          <Card padding={false}>
            {clientSessions.map((session, i) => {
              const holiday = isFutureMonth ? getHKHolidayLabel(session.date) : undefined
              return (
                <button
                  key={session.id}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50 dark:active:bg-slate-700 ${i < clientSessions.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}
                  onClick={() => openSession(session)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-medium ${session.status === 'cancelled' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {formatDisplayWithDay(session.date)}
                      </p>
                      {holiday && (
                        <span className="text-xs text-amber-500 font-medium">⚠ {holiday}</span>
                      )}
                      {session.notes && <span className="text-xs">📝</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {session.startTime} · {t.hrs(session.duration)} · {cur} {(client.hourlyRate * session.duration).toLocaleString()}
                      {!session.isRecurring && <span className="ml-1 text-amber-500">{t.adhocTag}</span>}
                    </p>
                  </div>
                  <Badge color={STATUS_COLORS[session.status]}>
                    {t.statusLabels[session.status]}
                  </Badge>
                </button>
              )
            })}
          </Card>
        )}
      </div>

      {/* Edit session modal */}
      <Modal open={!!activeSession} onClose={() => setActiveSession(null)} title={activeSession ? formatDisplayWithDay(activeSession.date) : ''}>
        {activeSession && (
          <div className="space-y-4">
            {!activeSession.isRecurring && (
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">{t.dateLabel}</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">{t.timeLabel}</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 font-medium mb-2">{t.sessionDuration}</p>
              <div className="flex gap-2">
                {([1, 1.5, 2] as SessionDuration[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setEditDuration(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      editDuration === d
                        ? 'bg-[#635BFF] text-white border-[#635BFF]'
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.hrs(d)}
                  </button>
                ))}
              </div>
              {editDuration && editDuration !== activeSession.duration && (
                <p className="text-xs text-[#635BFF] mt-1">
                  {t.cost}：{cur} {(client.hourlyRate * editDuration).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium mb-2">{t.updateStatus}</p>
              <div className="space-y-1.5">
                {(['completed', 'cancelled', 'late_cancel', 'rescheduled'] as SessionStatus[]).map(status => (
                  <button
                    key={status}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border transition-colors ${
                      editStatus === status
                        ? 'border-[#635BFF] bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => setEditStatus(status)}
                  >
                    <Badge color={STATUS_COLORS[status]}>{t.statusLabels[status]}</Badge>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">{t.lateCancelHint}</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium">{t.sessionNotes}</label>
              <textarea
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100 resize-none"
                rows={2}
                placeholder={t.sessionNotesPlaceholder}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
              />
            </div>

            <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-700">
              <Button fullWidth onClick={handleSaveSession}>
                {t.saveChanges}
              </Button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-[#635BFF]"
                onClick={handleCopyToNextWeek}
              >
                {t.copyToNextWeek}
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-500"
                onClick={handleDeleteSession}
              >
                {t.deleteSession}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add ad hoc session modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={t.adhocLabel}>
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.dateLabel}</label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.timeLabel}</label>
              <input
                type="time"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.durationLabel}</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 dark:text-slate-100"
                value={newDuration}
                onChange={e => setNewDuration(Number(e.target.value) as SessionDuration)}
              >
                <option value={1}>{t.oneHour}</option>
                <option value={1.5}>{t.oneHalfHour}</option>
                <option value={2}>{t.twoHours}</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.statusLabel}</label>
            <div className="flex gap-2">
              {(['completed', 'scheduled'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    newStatus === s
                      ? 'bg-[#635BFF] text-white border-[#635BFF]'
                      : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.statusLabels[s]}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-1">
            <p className="text-xs text-slate-400 mb-3 text-center">
              {t.cost}：{cur} {(client.hourlyRate * newDuration).toLocaleString()}
            </p>
            <Button fullWidth onClick={handleAddSession} disabled={!newDate || !newTime}>
              {t.confirmAddAdhoc}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
