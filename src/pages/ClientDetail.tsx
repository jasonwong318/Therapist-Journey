import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { formatDisplay, currentMonth, isInMonth, formatMonthYear } from '../lib/dates'
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
  const { clients, sessions, invoices, settings, createInvoice, updateSession, deleteSession } = useStoreCtx()
  const client = clients.find(c => c.id === id)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const [activeSession, setActiveSession] = useState<Session | null>(null)
  const [editDuration, setEditDuration] = useState<SessionDuration | null>(null)

  if (!client) return <div className="p-8 text-center text-slate-400">找不到客人。</div>

  const cur = settings.currency
  const clientSessions = sessions
    .filter(s => s.clientId === id && isInMonth(s.date, selectedMonth))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))

  const completedSessions = clientSessions.filter(s => s.status === 'completed')
  const monthTotal = completedSessions.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
  const uninvoicedSessions = completedSessions.filter(s => !s.invoiceId)
  const monthInvoice = invoices.find(inv => inv.clientId === id && inv.month === selectedMonth)

  const openSession = (session: Session) => {
    setActiveSession(session)
    setEditDuration(session.duration)
  }

  const handleSaveSession = (status: SessionStatus) => {
    if (!activeSession) return
    updateSession(activeSession.id, { status, duration: editDuration ?? activeSession.duration })
    setActiveSession(null)
  }

  const monthOptions = () => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return { value: val, label: formatMonthYear(val) }
    })
  }

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clients')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{client.name}</h1>
          <p className="text-xs text-slate-400">{cur} {client.hourlyRate}{t.perHour}</p>
        </div>
        <Link to={`/clients/${id}/edit`}><Button variant="secondary" size="sm">編輯</Button></Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {monthOptions().map(opt => (
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

      <Card className="!p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">{t.monthlyEarnings(formatMonthYear(selectedMonth))}</p>
            <p className="text-2xl font-bold text-[#635BFF] mt-0.5">{cur} {monthTotal.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedSessions.length} {t.sessions} · {t.totalHours(completedSessions.reduce((s, x) => s + x.duration, 0))}
            </p>
          </div>
          <div className="text-right">
            {monthInvoice ? (
              <div>
                <Badge color={monthInvoice.paidAt ? 'green' : monthInvoice.sentAt ? 'yellow' : 'indigo'}>
                  {monthInvoice.paidAt ? t.paid : monthInvoice.sentAt ? t.sent : t.invoiced}
                </Badge>
                <Link to={`/invoices/${monthInvoice.id}`}>
                  <p className="text-xs text-[#635BFF] mt-1 font-medium">{monthInvoice.invoiceNumber}</p>
                </Link>
              </div>
            ) : uninvoicedSessions.length > 0 ? (
              <Button size="sm" onClick={() => createInvoice(id!, selectedMonth, uninvoicedSessions.map(s => s.id))}>
                {t.invoice}
              </Button>
            ) : null}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t.sessionBreakdown}</h2>
        {clientSessions.length === 0 ? (
          <Card><p className="text-sm text-slate-400 text-center py-4">{t.noSessionsThisMonth}</p></Card>
        ) : (
          <Card padding={false}>
            {clientSessions.map((session, i) => (
              <button
                key={session.id}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50 dark:active:bg-slate-700 ${i < clientSessions.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}
                onClick={() => openSession(session)}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${session.status === 'cancelled' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {formatDisplay(session.date)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{session.startTime} · {session.duration}小時 · {cur} {(client.hourlyRate * session.duration).toLocaleString()}</p>
                </div>
                <Badge color={STATUS_COLORS[session.status]}>
                  {t.statusLabels[session.status]}
                </Badge>
              </button>
            ))}
          </Card>
        )}
      </div>

      <Modal open={!!activeSession} onClose={() => setActiveSession(null)} title={activeSession ? formatDisplay(activeSession.date) : ''}>
        {activeSession && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-2">課堂時長</p>
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
                    {d}小時
                  </button>
                ))}
              </div>
              {editDuration && editDuration !== activeSession.duration && (
                <p className="text-xs text-[#635BFF] mt-1">
                  費用：{cur} {(client.hourlyRate * editDuration).toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium mb-2">更新狀態</p>
              <div className="space-y-1.5">
                {(['completed', 'cancelled', 'late_cancel', 'rescheduled'] as SessionStatus[]).map(status => (
                  <button
                    key={status}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    onClick={() => handleSaveSession(status)}
                  >
                    <Badge color={STATUS_COLORS[status]}>{t.statusLabels[status]}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <button
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium text-red-500"
                onClick={() => { deleteSession(activeSession.id); setActiveSession(null) }}
              >
                刪除課堂
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
