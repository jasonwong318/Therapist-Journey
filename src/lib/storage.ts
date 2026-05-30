import type { Client, Session, Invoice, AppSettings, Holiday } from './types'

const KEYS = {
  clients: 'tt_clients',
  sessions: 'tt_sessions',
  invoices: 'tt_invoices',
  settings: 'tt_settings',
  holidays: 'tt_holidays',
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const loadClients = (): Client[] => load<Client[]>(KEYS.clients, [])
export const saveClients = (clients: Client[]) => save(KEYS.clients, clients)

export const loadSessions = (): Session[] => load<Session[]>(KEYS.sessions, [])
export const saveSessions = (sessions: Session[]) => save(KEYS.sessions, sessions)

export const loadInvoices = (): Invoice[] => load<Invoice[]>(KEYS.invoices, [])
export const saveInvoices = (invoices: Invoice[]) => save(KEYS.invoices, invoices)

export const loadHolidays = (): Holiday[] => load<Holiday[]>(KEYS.holidays, [])
export const saveHolidays = (holidays: Holiday[]) => save(KEYS.holidays, holidays)

const DEFAULT_SETTINGS: AppSettings = {
  therapistName: '',
  phone: '',
  email: '',
  paymentInfo: '',
  currency: 'HKD',
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1,
}
export const loadSettings = (): AppSettings => ({ ...DEFAULT_SETTINGS, ...load<Partial<AppSettings>>(KEYS.settings, {}) })
export const saveSettings = (settings: AppSettings) => save(KEYS.settings, settings)

export const exportData = () => ({
  clients: loadClients(),
  sessions: loadSessions(),
  invoices: loadInvoices(),
  settings: loadSettings(),
  holidays: loadHolidays(),
  exportedAt: new Date().toISOString(),
})

export const importData = (data: ReturnType<typeof exportData>) => {
  saveClients(data.clients)
  saveSessions(data.sessions)
  saveInvoices(data.invoices)
  saveSettings(data.settings)
  if (data.holidays) saveHolidays(data.holidays)
}
