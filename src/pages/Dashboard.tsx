import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { todayStr, currentMonth, isInMonth } from '../lib/dates'
import { Link } from 'react-router-dom'

const CLIENT_COLORS = ['#635BFF', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export const Dashboard = () => {
  const { clients, sessions, invoices, settings } = useStoreCtx()
  const today = todayStr()
  const month = currentMonth()
  const cur = settings.currency

  const todaySessions = sessions
    .filter(s => s.date === today && s.status !== 'cancelled')
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const monthSessions = sessions.filter(s => isInMonth(s.date, month) && s.status === 'completed')
  const monthEarned = monthSessions.reduce((sum, s) => {
    const client = clients.find(c => c.id === s.clientId)
    return sum + (client ? client.hourlyRate * s.duration : 0)
  }, 0)

  const unpaidInvoices = invoices.filter(inv => !inv.paidAt)
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  const clientMonthly = clients.filter(c => !c.archivedAt).map(client => {
    const completed = sessions.filter(s => s.clientId === client.id && isInMonth(s.date, month) && s.status === 'completed')
    const scheduled = sessions.filter(s => s.clientId === client.id && isInMonth(s.date, month) && s.status === 'scheduled')
    const earned = completed.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
    return { client, completed: completed.length, scheduled: scheduled.length, earned }
  }).filter(x => x.completed > 0 || x.scheduled > 0)

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {new Date().toLocaleDateString('en-HK', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
          {settings.therapistName ? `Hi, ${settings.therapistName.split(' ')[0]} 👋` : 'Dashboard'}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-4">
          <p className="text-xs text-slate-400 font-medium">This month</p>
          <p className="text-2xl font-bold text-[#635BFF] mt-1">{cur} {monthEarned.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">{monthSessions.length} sessions</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-400 font-medium">Outstanding</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{cur} {unpaidTotal.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-0.5">{unpaidInvoices.length} invoices</p>
        </Card>
      </div>

      {/* Today */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Today's Sessions</h2>
          <Link to="/calendar" className="text-xs text-[#635BFF] font-medium">Calendar →</Link>
        </div>
        {todaySessions.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400 text-center py-3">No sessions today</p>
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
                      <p className="font-medium text-slate-900 text-sm">{client.name}</p>
                      <p className="text-xs text-slate-400">{session.startTime} · {session.duration}h · {cur} {(client.hourlyRate * session.duration).toLocaleString()}</p>
                    </div>
                    <Badge color={session.status === 'completed' ? 'green' : 'indigo'}>
                      {session.status === 'completed' ? 'Done' : 'Upcoming'}
                    </Badge>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Monthly per client */}
      {clientMonthly.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Monthly Overview</h2>
          <Card padding={false}>
            {clientMonthly.map(({ client, completed, scheduled, earned }, i) => {
              const idx = clients.indexOf(client)
              return (
                <Link key={client.id} to={`/clients/${client.id}`}>
                  <div className={`flex items-center gap-3 px-4 py-3.5 ${i < clientMonthly.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CLIENT_COLORS[idx % CLIENT_COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{client.name}</p>
                      <p className="text-xs text-slate-400">{completed} done · {scheduled} upcoming</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{cur} {earned.toLocaleString()}</p>
                  </div>
                </Link>
              )
            })}
          </Card>
        </div>
      )}

      {clients.filter(c => !c.archivedAt).length === 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No clients yet.</p>
            <Link to="/clients/new" className="mt-3 inline-block text-sm font-medium text-[#635BFF]">Add your first client →</Link>
          </div>
        </Card>
      )}
    </div>
  )
}
