import { useParams, useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDisplay, formatMonthYear } from '../lib/dates'
import { generateInvoicePDF } from '../lib/invoice'

export const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, clients, sessions, settings, updateInvoice } = useStoreCtx()

  const invoice = invoices.find(i => i.id === id)
  if (!invoice) return <div className="p-8 text-center text-slate-400">Invoice not found.</div>

  const client = clients.find(c => c.id === invoice.clientId)!
  const invSessions = sessions.filter(s => invoice.sessionIds.includes(s.id)).sort((a, b) => a.date.localeCompare(b.date))
  const cur = settings.currency

  const handleDownload = () => generateInvoicePDF(invoice, client, invSessions, settings)

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
          <p className="text-xs text-slate-400">{client?.name} · {formatMonthYear(invoice.month)}</p>
        </div>
        <Badge color={invoice.paidAt ? 'green' : invoice.sentAt ? 'yellow' : 'indigo'}>
          {invoice.paidAt ? 'Paid' : invoice.sentAt ? 'Sent' : 'Draft'}
        </Badge>
      </div>

      {/* Amount */}
      <Card className="!p-5 bg-gradient-to-br from-[#635BFF] to-[#4F46E5] !border-0">
        <p className="text-indigo-200 text-sm">Total Amount</p>
        <p className="text-4xl font-bold text-white mt-1">{cur} {invoice.totalAmount.toLocaleString()}</p>
        <p className="text-indigo-200 text-xs mt-1">{invSessions.length} sessions</p>
      </Card>

      {/* Sessions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Session Breakdown</h2>
        <Card padding={false}>
          {invSessions.map((s, i) => (
            <div key={s.id} className={`flex items-center justify-between px-4 py-3.5 ${i < invSessions.length - 1 ? 'border-b border-slate-50' : ''}`}>
              <div>
                <p className="text-sm font-medium text-slate-900">{formatDisplay(s.date)}</p>
                <p className="text-xs text-slate-400">{s.startTime} · {s.duration}h</p>
              </div>
              <p className="text-sm font-semibold text-slate-900">{cur} {(client.hourlyRate * s.duration).toLocaleString()}</p>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 rounded-b-2xl">
            <p className="text-sm font-bold text-slate-900">Total</p>
            <p className="text-sm font-bold text-[#635BFF]">{cur} {invoice.totalAmount.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button fullWidth onClick={handleDownload}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </Button>

        {!invoice.sentAt && (
          <Button fullWidth variant="secondary" onClick={() => updateInvoice(invoice.id, { sentAt: new Date().toISOString() })}>
            Mark as Sent
          </Button>
        )}

        {!invoice.paidAt && (
          <Button fullWidth variant="secondary" onClick={() => updateInvoice(invoice.id, { paidAt: new Date().toISOString() })}>
            Mark as Paid
          </Button>
        )}

        {invoice.paidAt && (
          <Button fullWidth variant="ghost" onClick={() => updateInvoice(invoice.id, { paidAt: undefined })}>
            Unmark Paid
          </Button>
        )}
      </div>

      {/* Dates */}
      <Card className="!p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">Issued</span>
          <span className="text-slate-700">{formatDisplay(invoice.issuedAt.slice(0, 10))}</span>
        </div>
        {invoice.sentAt && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Sent</span>
            <span className="text-slate-700">{formatDisplay(invoice.sentAt.slice(0, 10))}</span>
          </div>
        )}
        {invoice.paidAt && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Paid</span>
            <span className="text-emerald-600 font-medium">{formatDisplay(invoice.paidAt.slice(0, 10))}</span>
          </div>
        )}
      </Card>
    </div>
  )
}
