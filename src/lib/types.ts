export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'late_cancel'

export type SessionDuration = 1 | 1.5 | 2

export interface ScheduleSlot {
  dayOfWeek: number // 0=Sun, 1=Mon, ..., 6=Sat
  time: string // "HH:MM"
  duration: SessionDuration
  startDate?: string // YYYY-MM-DD, generate sessions from this date onwards
  endDate?: string   // YYYY-MM-DD, stop generating after this date
}

export interface Client {
  id: string
  name: string
  color: string
  phone?: string // for WhatsApp, e.g. "85291234567"
  hourlyRate: number
  defaultDuration: SessionDuration
  schedule: ScheduleSlot[]
  // Temporarily pause auto-scheduling (e.g. summer break); sessions are not
  // generated between these dates, and resume automatically afterwards.
  pauseStart?: string // YYYY-MM-DD
  pauseEnd?: string   // YYYY-MM-DD
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
  skipHKHolidays?: boolean // auto-skip HK public holidays when generating sessions
  invoiceFooter?: string   // custom footer text on PDF invoices
  githubToken?: string     // GitHub personal access token (gist scope) for cloud backup
  githubGistId?: string    // gist id used for backup (created on first backup)
}

export interface Holiday {
  id: string
  date: string // YYYY-MM-DD
  label: string
}
