import type { Client, Session, Invoice, AppSettings, Holiday } from './types'

const KEYS = {
  clients: 'tt_clients',
  sessions: 'tt_sessions',
  invoices: 'tt_invoices',
  settings: 'tt_settings',
  holidays: 'tt_holidays',
}

// Ask the browser to protect this origin's storage from eviction under
// storage pressure (best effort; supported on Chromium/Firefox, and helps
// installed PWAs on Android). Fire-and-forget.
export const requestPersistentStorage = () => {
  try {
    navigator.storage?.persist?.()
  } catch {
    // unsupported — nothing to do
  }
}

// Called at most once per page load so a full disk doesn't spam alerts.
let warnedWriteFailure = false
export let onStorageWriteError: (() => void) | null = null
export const setStorageWriteErrorHandler = (fn: () => void) => { onStorageWriteError = fn }

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // QuotaExceededError etc. — the write was lost; surface it loudly once
    if (!warnedWriteFailure) {
      warnedWriteFailure = true
      onStorageWriteError?.()
    }
  }
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
  autoBackup: true, // effective only once a GitHub token + gist exist
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

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Validate backup shape before importing so a wrong or corrupted file can't
// wipe real data. Checks the fields the app actually relies on.
export const isValidBackup = (data: unknown): data is ReturnType<typeof exportData> => {
  if (!isRecord(data)) return false
  const d = data
  if (!Array.isArray(d.clients) || !Array.isArray(d.sessions) || !Array.isArray(d.invoices) || !isRecord(d.settings)) return false
  const clientsOk = d.clients.every(c => isRecord(c)
    && typeof c.id === 'string' && typeof c.name === 'string'
    && typeof c.hourlyRate === 'number' && Array.isArray(c.schedule))
  const sessionsOk = d.sessions.every(s => isRecord(s)
    && typeof s.id === 'string' && typeof s.clientId === 'string'
    && typeof s.date === 'string' && DATE_RE.test(s.date)
    && typeof s.startTime === 'string' && typeof s.status === 'string')
  const invoicesOk = d.invoices.every(i => isRecord(i)
    && typeof i.id === 'string' && typeof i.clientId === 'string'
    && Array.isArray(i.sessionIds) && typeof i.totalAmount === 'number')
  const holidaysOk = d.holidays === undefined || (Array.isArray(d.holidays)
    && d.holidays.every(h => isRecord(h) && typeof h.date === 'string'))
  return clientsOk && sessionsOk && invoicesOk && holidaysOk
}

export const importData = (data: ReturnType<typeof exportData>) => {
  if (!isValidBackup(data)) throw new Error('Invalid backup file')
  saveClients(data.clients)
  saveSessions(data.sessions)
  saveInvoices(data.invoices)
  saveSettings({ ...DEFAULT_SETTINGS, ...data.settings })
  if (data.holidays) saveHolidays(data.holidays)
}
