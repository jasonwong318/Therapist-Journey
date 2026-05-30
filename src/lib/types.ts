export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'late_cancel'

export type SessionDuration = 1 | 1.5 | 2

export interface ScheduleSlot {
  dayOfWeek: number // 0=Sun, 1=Mon, ..., 6=Sat
  time: string // "HH:MM"
  duration: SessionDuration
}

export interface Client {
  id: string
  name: string
  color: string
  hourlyRate: number
  defaultDuration: SessionDuration
  schedule: ScheduleSlot[]
  notes: string
  archivedAt?: string
}

export interface Session {
  id: string
  clientId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  duration: SessionDuration
  status: SessionStatus
  originalSessionId?: string
  notes: string
  invoiceId?: string
  isRecurring: boolean
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  month: string // YYYY-MM
  sessionIds: string[]
  issuedAt: string
  sentAt?: string
  paidAt?: string
  totalAmount: number
}

export interface AppSettings {
  therapistName: string
  phone: string
  email: string
  paymentInfo: string
  currency: string
  invoicePrefix: string
  nextInvoiceNumber: number
}
