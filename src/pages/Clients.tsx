import { Link } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const CLIENT_COLORS = ['#635BFF', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export const Clients = () => {
  const { clients } = useStoreCtx()
  const active = clients.filter(c => !c.archivedAt)
  const archived = clients.filter(c => c.archivedAt)

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <Link to="/clients/new"><Button size="sm">+ Add</Button></Link>
      </div>

      {active.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-slate-500 text-sm">No clients yet.</p>
            <Link to="/clients/new" className="mt-3 inline-block text-sm font-medium text-[#635BFF]">Add your first client →</Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {active.map((client, i) => (
            <Link key={client.id} to={`/clients/${client.id}`}>
              <Card className="!p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: CLIENT_COLORS[i % CLIENT_COLORS.length] }}>
                  {client.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{client.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    HKD {client.hourlyRate}/hr · {client.schedule.length} slot{client.schedule.length !== 1 ? 's' : ''}/week
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <div>
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Archived</h2>
          <div className="space-y-2">
            {archived.map((client) => (
              <Link key={client.id} to={`/clients/${client.id}`}>
                <Card className="!p-4 flex items-center gap-3 opacity-60">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg flex-shrink-0">
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-600">{client.name}</p>
                    <p className="text-xs text-slate-400">Archived</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
