import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Client, Session, Invoice, AppSettings } from './types'
import { formatDisplay, formatMonthYear } from './dates'

export const generateInvoicePDF = (
  invoice: Invoice,
  client: Client,
  sessions: Session[],
  settings: AppSettings,
) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const cur = settings.currency

  // Header
  doc.setFillColor(99, 91, 255)
  doc.rect(0, 0, 210, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 14, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.invoiceNumber, 196, 18, { align: 'right' })

  // Therapist info
  doc.setTextColor(30, 30, 50)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(settings.therapistName || 'Therapist', 14, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 120)
  let y = 46
  if (settings.email) { doc.text(settings.email, 14, y); y += 5 }
  if (settings.phone) { doc.text(settings.phone, 14, y); y += 5 }

  // Client info
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 50)
  doc.text('Bill To:', 120, 40)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(client.name, 120, 47)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 120)
  doc.text(`Period: ${formatMonthYear(invoice.month)}`, 120, 53)
  doc.text(`Issued: ${formatDisplay(invoice.issuedAt.slice(0, 10))}`, 120, 58)

  // Sessions table
  const rows = sessions.map(s => [
    formatDisplay(s.date),
    s.startTime,
    `${s.duration} hr${s.duration > 1 ? 's' : ''}`,
    `${cur} ${client.hourlyRate.toLocaleString()}`,
    `${cur} ${(client.hourlyRate * s.duration).toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 70,
    head: [['Date', 'Time', 'Duration', 'Rate/hr', 'Amount']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [99, 91, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [246, 249, 252] },
    columnStyles: { 4: { halign: 'right' } },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 8

  // Total
  doc.setDrawColor(220, 220, 230)
  doc.line(120, finalY, 196, finalY)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 30, 50)
  doc.text('Total:', 120, finalY + 8)
  doc.setTextColor(99, 91, 255)
  doc.text(`${cur} ${invoice.totalAmount.toLocaleString()}`, 196, finalY + 8, { align: 'right' })

  // Payment info
  if (settings.paymentInfo) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 120)
    doc.text('Payment Info:', 14, finalY + 8)
    const lines = doc.splitTextToSize(settings.paymentInfo, 90)
    doc.text(lines, 14, finalY + 14)
  }

  doc.save(`${invoice.invoiceNumber}-${client.name}.pdf`)
}
