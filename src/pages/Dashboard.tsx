import { useState } from 'react'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { todayStr, currentMonth, isInMonth, monthSelectorOptions } from '../lib/dates'
import { CLIENT_COLORS } from '../lib/constants'
import { isBillable } from '../lib/billing'
import { getLastBackup } from '../lib/gistBackup'
import { Link } from 'react-router-dom'
import { t, getLang } from '../lib/i18n'

const BACKUP_REMINDER_DAYS = 30

export const Dashboard = () => {
  const { clients, sessions, invoices, settings } = useStoreCtx()
  const today = todayStr()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())
  const cur = settings.currency

  const todaySessions = sessions
    .filter(s => s.date === today && s.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const isFuture = selectedMonth > currentMonth()

  // For future months: assume all non-cancelled sessions are attended (projected income)
  const monthSessions = sessions.filter(s => isInMonth(s.date, selectedMonth) && (
    isFuture ? s.status !== 'cancelled' : s.status === 'completed'
  ))
  const monthEarned = monthSessions.reduce((sum, s) => {
    const client = clients.find(c => c.id === s.clientId)
    return sum + (client ? client.hourlyRate * s.duration : 0)
  }, 0)

  const unpaidInvoices = invoices.filter(inv => !inv.paidAt && inv.month === selectedMonth)
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => {
    const client = clients.find(c => c.id === inv.clientId)
    if (!client) return sum + inv.totalAmount
    const billable = sessions.filter(s => inv.sessionIds.includes(s.id) && isBillable(s))
    return sum + billable.reduce((s2, s) => s2 + client.hourlyRate * s.duration, 0)
  }, 0)

  const clientMonthly = clients.filter(c => !c.archivedAt).map(client => {
    const completed = sessions.filter(s => s.clientId === client.id && isInMonth(s.date, selectedMonth) && s.status === 'completed')
    const scheduled = sessions.filter(s => s.clientId === client.id && isInMonth(s.date, selectedMonth) && s.status === 'scheduled')
    const earned = isFuture
      ? sessions.filter(s => s.clientId === client.id && isInMonth(s.date, selectedMonth) && s.status !== 'cancelled').reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
      : completed.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
    return { client, completed: completed.length, scheduled: scheduled.length, earned }
  }).filter(x => x.completed > 0 || x.scheduled > 0)

  // Year overview: earned per month of the current year, up to this month
  const year = new Date().getFullYear()
  const yearMonths = Array.from({ length: new Date().getMonth() + 1 }, (_, i) => {
    const ym = `${year}-${String(i + 1).padStart(2, '0')}`
    const earned = sessions.filter(s => isInMonth(s.date, ym) && s.status === 'completed').reduce((sum, s) => {
      const client = clients.find(c => c.id === s.clientId)
      return sum + (client ? client.hourlyRate * s.duration : 0)
    }, 0)
    return { ym, label: t.monthNames[i], earned }
  }).filter(m => m.earned > 0)
  const yearMax = Math.max(...yearMonths.map(m => m.earned), 1)
  const yearTotal = yearMonths.reduce((s, m) => s + m.earned, 0)

  const lastBackup = getLastBackup()
  const backupOverdue = !lastBackup || (Date.now() - new Date(lastBackup).getTime()) > BACKUP_REMINDER_DAYS * 86400000
  const hasData = clients.length > 0

  const opts = monthSelectorOptions()
  const locale = getLang() === 'en' ? 'en-US' : 'zh-HK'

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {new Date().toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
          {settings.therapistName ? t.hiGreeting(settings.therapistName.split(' ')[0]) : t.dashboard}
        </h1>
      </div>

      {hasData && backupOverdue && (
        <Link to="/settings">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <span className="text-sm">💾</span>
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">{t.backupReminder}</p>
          </div>
        </Link>
      )}

      {/* Month selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {opts.map(opt => (
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

      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-4">
          <p className="text-xs text-slate-400 font-medium">{isFuture ? t.projected : t.thisMonth}</p>
          <p className={`text-2xl font-bold mt-1 ${isFuture ? 'text-slate-400' : 'text-[#635BFF]'}`}>{cur} {monthEarned.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">{monthSessions.length} {t.sessions}{isFuture ? ` (${t.projected})` : ''}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-400 font-medium">{t.outstanding}</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{cur} {unpaidTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">{unpaidInvoices.length} {t.invoicesCount}</p>
        </Card>
      </div>

      {selectedMonth === currentMonth() && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.todaySessions}</h2>
            <Link to="/calendar" className="text-xs text-[#635BFF] font-medium">{t.calendar} →</Link>
          </div>
          {todaySessions.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-400 text-center py-3">{t.noSessionsToday}</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {todaySessions.map(session => {
                const client = clients.find(c => c.id === session.clientId)
                if (!client) return null
                const idx = clients.indexOf(client)
                return (
                  <Link key={session.id} to={`/clients/${client.id}`}>
                    <Card className="!p-4 flex items-center gap-3">
                      <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: CLIENT_COLORS[idx % CLIENT_COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{client.name}</p>
                        <p className="text-xs text-slate-400">{session.startTime} · {t.hrs(session.duration)} · {cur} {(client.hourlyRate * session.duration).toLocaleString()}</p>
                      </div>
                      <Badge color={session.status === 'completed' ? 'green' : 'indigo'}>
                        {session.status === 'completed' ? t.done : t.upcoming}
                      </Badge>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {clientMonthly.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t.monthlyOverview}</h2>
          <Card padding={false}>
            {clientMonthly.map(({ client, completed, scheduled, earned }, i) => {
              const idx = clients.indexOf(client)
              return (
                <Link key={client.id} to={`/clients/${client.id}`}>
                  <div className={`flex items-center gap-3 px-4 py-3.5 ${i < clientMonthly.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CLIENT_COLORS[idx % CLIENT_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{client.name}</p>
                      <p className="text-xs text-slate-400">{completed} {t.done} · {scheduled} {t.upcoming}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cur} {earned.toLocaleString()}</p>
                  </div>
                </Link>
              )
            })}
          </Card>
        </div>
      )}

      {yearMonths.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.yearOverview} {year}</h2>
            <p className="text-xs font-semibold text-[#635BFF]">{cur} {yearTotal.toLocaleString()}</p>
          </div>
          <Card className="!p-4">
            <div className="space-y-2">
              {yearMonths.map(m => (
                <div key={m.ym} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-10 flex-shrink-0">{m.label}</span>
                  <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#635BFF] rounded-full" style={{ width: `${(m.earned / yearMax) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-20 text-right flex-shrink-0">{cur} {m.earned.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {clients.filter(c => !c.archivedAt).length === 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">{t.noClientsYet}</p>
            <Link to="/clients/new" className="mt-3 inline-block text-sm font-medium text-[#635BFF]">{t.addFirstClient}</Link>
          </div>
        </Card>
      )}
    </div>
  )
}
