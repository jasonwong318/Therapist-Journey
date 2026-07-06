import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Client, Session, Invoice, AppSettings } from './types'
import { formatDisplay, formatMonthYear, endTimeOf } from './dates'
import { isBillable } from './billing'
import { rateOn, sessionCost } from './rates'
import { t } from './i18n'

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Renders the invoice as styled HTML and converts to PDF via html2canvas,
// so CJK text (client names, footer) displays correctly — jsPDF's built-in
// fonts cannot render Chinese. Long invoices are split across A4 pages.
export const generateInvoicePDF = async (
  invoice: Invoice,
  client: Client,
  sessions: Session[],
  settings: AppSettings,
) => {
  const cur = escapeHtml(settings.currency)
  const billable = sessions.filter(isBillable).sort((a, b) => a.date.localeCompare(b.date))
  const total = billable.reduce((sum, s) => sum + sessionCost(client, s), 0)

  const rows = billable.map(s => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;">${formatDisplay(s.date)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;">${s.startTime}–${endTimeOf(s.startTime, s.duration)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;text-align:center;">${s.duration} hr</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;text-align:right;">${cur} ${rateOn(client, s.date).toLocaleString()}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eef2f7;text-align:right;font-weight:600;">${cur} ${sessionCost(client, s).toLocaleString()}</td>
    </tr>`).join('')

  const el = document.createElement('div')
  el.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;background:#ffffff;font-family:Inter,"PingFang TC","Microsoft JhengHei",sans-serif;color:#1e1e32;'
  el.innerHTML = `
    <div style="background:#635BFF;color:#fff;padding:28px 40px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:26px;font-weight:700;letter-spacing:1px;">INVOICE</span>
      <span style="font-size:15px;">${escapeHtml(invoice.invoiceNumber)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:32px 40px 8px;">
      <div>
        <div style="font-weight:700;font-size:15px;">${escapeHtml(settings.therapistName || 'Therapist')}</div>
        ${settings.email ? `<div style="color:#646478;font-size:12px;margin-top:4px;">${escapeHtml(settings.email)}</div>` : ''}
        ${settings.phone ? `<div style="color:#646478;font-size:12px;margin-top:2px;">${escapeHtml(settings.phone)}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;font-size:13px;">Bill To:</div>
        <div style="font-size:14px;margin-top:4px;">${escapeHtml(client.name)}</div>
        <div style="color:#646478;font-size:12px;margin-top:4px;">Period: ${formatMonthYear(invoice.month)}</div>
        <div style="color:#646478;font-size:12px;margin-top:2px;">Issued: ${formatDisplay(invoice.issuedAt.slice(0, 10))}</div>
      </div>
    </div>
    <div style="padding:16px 40px;">
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#635BFF;color:#fff;">
            <th style="padding:8px 12px;text-align:left;">${t.dateLabel}</th>
            <th style="padding:8px 12px;text-align:left;">${t.timeLabel}</th>
            <th style="padding:8px 12px;text-align:center;">${t.durationLabel}</th>
            <th style="padding:8px 12px;text-align:right;">Rate/hr</th>
            <th style="padding:8px 12px;text-align:right;">${t.totalAmount}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;margin-top:16px;">
        <div style="text-align:right;">
          <span style="font-size:14px;font-weight:700;margin-right:24px;">${t.total}:</span>
          <span style="font-size:18px;font-weight:700;color:#635BFF;">${cur} ${total.toLocaleString()}</span>
        </div>
      </div>
      ${settings.paymentInfo ? `
      <div style="margin-top:28px;padding-top:16px;border-top:1px solid #eef2f7;">
        <div style="font-weight:700;font-size:12px;">Payment Info:</div>
        <div style="color:#646478;font-size:12px;white-space:pre-wrap;margin-top:4px;">${escapeHtml(settings.paymentInfo)}</div>
      </div>` : ''}
      ${settings.invoiceFooter ? `
      <div style="margin-top:20px;color:#9494a8;font-size:11px;white-space:pre-wrap;">${escapeHtml(settings.invoiceFooter)}</div>` : ''}
      <div style="height:32px;"></div>
    </div>`

  document.body.appendChild(el)
  try {
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' })
    const img = canvas.toDataURL('image/png')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = 210
    const pageH = 297
    const imgH = (canvas.height * pageW) / canvas.width
    // Repeat the full image with a negative offset per page; the area outside
    // each page is clipped, so long invoices paginate instead of being cut off.
    let offset = 0
    let first = true
    while (offset < imgH) {
      if (!first) doc.addPage()
      doc.addImage(img, 'PNG', 0, -offset, pageW, imgH)
      offset += pageH
      first = false
    }

    const filename = `${invoice.invoiceNumber}-${client.name}.pdf`
    // Prefer the native share sheet (works reliably in installed iOS PWAs,
    // where triggering a download can fail); fall back to a plain download.
    const blob = doc.output('blob')
    const file = new File([blob], filename, { type: 'application/pdf' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return // user closed the sheet
        // sharing failed for another reason — fall through to download
      }
    }
    doc.save(filename)
  } finally {
    document.body.removeChild(el)
  }
}
