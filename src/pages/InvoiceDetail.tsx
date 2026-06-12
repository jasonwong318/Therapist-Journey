import { useParams, useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { formatDisplay, formatMonthYear, endTimeOf } from '../lib/dates'
import { isBillable } from '../lib/billing'
import { generateInvoicePDF } from '../lib/invoice'
import { t, getLang } from '../lib/i18n'

export const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, clients, sessions, settings, updateInvoice } = useStoreCtx()

  const invoice = invoices.find(i => i.id === id)
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : undefined
  if (!invoice || !client) return <div className="p-8 text-center text-slate-400">找不到發票。</div>

  const invSessions = sessions.filter(s => invoice.sessionIds.includes(s.id)).sort((a, b) => a.date.localeCompare(b.date))
  const billableSessions = invSessions.filter(isBillable)
  const displayTotal = billableSessions.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
  const cur = settings.currency

  const handleDownload = () => generateInvoicePDF(invoice, client, billableSessions, settings)

  const handleWhatsApp = () => {
    const zh = getLang() === 'zh'
    const lines = [
      `${settings.therapistName || (zh ? '治療師' : 'Therapist')}`,
      ``,
      zh ? `${formatMonthYear(invoice.month)} 發票` : `Invoice for ${formatMonthYear(invoice.month)}`,
      zh ? `發票號碼：${invoice.invoiceNumber}` : `Invoice No: ${invoice.invoiceNumber}`,
      ``,
      ...billableSessions.map(s =>
        `${formatDisplay(s.date)}  ${s.startTime}–${endTimeOf(s.startTime, s.duration)}  ${cur}${(client.hourlyRate * s.duration).toLocaleString()}`
      ),
      ``,
      zh ? `總計：${cur} ${displayTotal.toLocaleString()}` : `Total: ${cur} ${displayTotal.toLocaleString()}`,
      ``,
      settings.paymentInfo ? (zh ? `付款資料：\n${settings.paymentInfo}` : `Payment Info:\n${settings.paymentInfo}`) : '',
    ].filter(Boolean).join('\n')

    const target = client.phone ? `https://wa.me/${client.phone.replace(/\D/g, '')}` : 'https://wa.me/'
    window.open(`${target}?text=${encodeURIComponent(lines)}`, '_blank')
  }

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Back" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</h1>
          <p className="text-xs text-slate-400">{client.name} · {formatMonthYear(invoice.month)}</p>
        </div>
        <Badge color={invoice.paidAt ? 'green' : invoice.sentAt ? 'yellow' : 'indigo'}>
          {invoice.paidAt ? t.paid : invoice.sentAt ? t.sent : t.draft}
        </Badge>
      </div>

      {/* Amount card */}
      <Card className="!p-5 bg-gradient-to-br from-[#635BFF] to-[#4F46E5] !border-0">
        <p className="text-indigo-200 text-sm">{t.totalAmount}</p>
        <p className="text-4xl font-bold text-white mt-1">{cur} {displayTotal.toLocaleString()}</p>
        <p className="text-indigo-200 text-xs mt-1">{billableSessions.length} {t.sessions}</p>
      </Card>

      {/* Sessions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">{t.sessionBreakdown}</h2>
        <Card padding={false}>
          {/* Header row */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-4 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-t-2xl">
            <p className="text-xs font-medium text-slate-400">{t.dateLabel}</p>
            <p className="text-xs font-medium text-slate-400">{t.timeLabel}</p>
            <p className="text-xs font-medium text-slate-400 text-center">{t.sessions}</p>
            <p className="text-xs font-medium text-slate-400 text-right">{cur}</p>
          </div>
          {invSessions.map((s, i) => {
            const billable = isBillable(s)
            return (
              <div key={s.id} className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-4 py-3 ${i < invSessions.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''}`}>
                <p className={`text-sm font-medium ${billable ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 line-through'}`}>{formatDisplay(s.date)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{s.startTime}–{endTimeOf(s.startTime, s.duration)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">{billable ? `1${t.sessions}` : '–'}</p>
                <p className={`text-sm font-semibold text-right whitespace-nowrap ${billable ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'}`}>
                  {billable ? (client.hourlyRate * s.duration).toLocaleString() : t.statusLabels[s.status]}
                </p>
              </div>
            )
          })}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-b-2xl border-t border-slate-100 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.total}</p>
            <p className="text-xs text-slate-400 text-center">{billableSessions.length}{t.sessions}</p>
            <span />
            <p className="text-sm font-bold text-[#635BFF] text-right">{displayTotal.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button fullWidth onClick={handleDownload}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t.downloadPDF}
        </Button>

        {/* WhatsApp share */}
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#25D366] text-[#25D366] font-medium text-sm hover:bg-[#25D366]/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {t.whatsappShare}
        </button>

        {!invoice.sentAt && (
          <Button fullWidth variant="secondary" onClick={() => updateInvoice(invoice.id, { sentAt: new Date().toISOString() })}>
            {t.markSent}
          </Button>
        )}

        {!invoice.paidAt && (
          <Button fullWidth variant="secondary" onClick={() => updateInvoice(invoice.id, { paidAt: new Date().toISOString() })}>
            {t.markPaid}
          </Button>
        )}

        {invoice.paidAt && (
          <Button fullWidth variant="ghost" onClick={() => updateInvoice(invoice.id, { paidAt: undefined })}>
            {t.unmarkPaid}
          </Button>
        )}
      </div>

      {/* Dates */}
      <Card className="!p-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">{t.issued}</span>
          <span className="text-slate-700 dark:text-slate-300">{formatDisplay(invoice.issuedAt.slice(0, 10))}</span>
        </div>
        {invoice.sentAt && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{t.sentDate}</span>
            <span className="text-slate-700 dark:text-slate-300">{formatDisplay(invoice.sentAt.slice(0, 10))}</span>
          </div>
        )}
        {invoice.paidAt && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">{t.paidDate}</span>
            <span className="text-emerald-600 font-medium">{formatDisplay(invoice.paidAt.slice(0, 10))}</span>
          </div>
        )}
      </Card>
    </div>
  )
}
