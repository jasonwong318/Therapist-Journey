import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Link } from 'react-router-dom'
import { formatMonthYear } from '../lib/dates'
import { t } from '../lib/i18n'

export const Invoices = () => {
  const { invoices, clients, settings } = useStoreCtx()
  const cur = settings.currency

  const sorted = [...invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt))

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">{t.invoices}</h1>

      {sorted.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-3">📄</div>
            <p className="text-slate-500 text-sm">{t.noInvoices}</p>
            <p className="text-slate-400 text-xs mt-1">{t.generateFromClient}</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map(inv => {
            const client = clients.find(c => c.id === inv.clientId)
            return (
              <Link key={inv.id} to={`/invoices/${inv.id}`}>
                <Card className="!p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">{inv.invoiceNumber}</p>
                      <Badge color={inv.paidAt ? 'green' : inv.sentAt ? 'yellow' : 'indigo'}>
                        {inv.paidAt ? t.paid : inv.sentAt ? t.sent : t.draft}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{client?.name} · {formatMonthYear(inv.month)}</p>
                  </div>
                  <p className="font-bold text-slate-900">{cur} {inv.totalAmount.toLocaleString()}</p>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
