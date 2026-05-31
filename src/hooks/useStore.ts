import { useState, useEffect, useCallback } from 'react'
import type { Client, Session, Invoice, AppSettings, Holiday } from '../lib/types'
import {
  loadClients, saveClients,
  loadSessions, saveSessions,
  loadInvoices, saveInvoices,
  loadSettings, saveSettings,
  loadHolidays, saveHolidays,
} from '../lib/storage'
import { generateSessionsForMonth } from '../lib/schedule'
import { nanoid } from '../lib/nanoid'

export const useStore = () => {
  const [clients, setClientsState] = useState<Client[]>(() => loadClients())
  const [sessions, setSessionsState] = useState<Session[]>(() => loadSessions())
  const [invoices, setInvoicesState] = useState<Invoice[]>(() => loadInvoices())
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings())
  const [holidays, setHolidaysState] = useState<Holiday[]>(() => loadHolidays())

  const buildMonthsAhead = (count: number) => {
    const now = new Date()
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  useEffect(() => {
    const months = buildMonthsAhead(6)
    const current = loadClients()
    const existing = loadSessions()
    const hols = loadHolidays()
    let allSessions = [...existing]
    let changed = false

    for (const { year, month } of months) {
      const newSessions = generateSessionsForMonth(current, allSessions, year, month, hols)
      if (newSessions.length > 0) {
        allSessions = [...allSessions, ...newSessions]
        changed = true
      }
    }

    if (changed) {
      saveSessions(allSessions)
      setSessionsState(allSessions)
    }
  }, [])

  const setClients = useCallback((updater: Client[] | ((prev: Client[]) => Client[])) => {
    setClientsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveClients(next)
      return next
    })
  }, [])

  const setSessions = useCallback((updater: Session[] | ((prev: Session[]) => Session[])) => {
    setSessionsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveSessions(next)
      return next
    })
  }, [])

  const setInvoices = useCallback((updater: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    setInvoicesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveInvoices(next)
      return next
    })
  }, [])

  const setSettings = useCallback((s: AppSettings) => {
    setSettingsState(s)
    saveSettings(s)
  }, [])

  const setHolidays = useCallback((updater: Holiday[] | ((prev: Holiday[]) => Holiday[])) => {
    setHolidaysState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveHolidays(next)
      return next
    })
  }, [])

  const ensureSessionsForMonth = useCallback((year: number, month: number) => {
    setSessions(prev => {
      const current = loadClients()
      const hols = loadHolidays()
      const newSessions = generateSessionsForMonth(current, prev, year, month, hols)
      if (newSessions.length === 0) return prev
      const next = [...prev, ...newSessions]
      saveSessions(next)
      return next
    })
  }, [setSessions])

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: nanoid() }
    setClients(prev => [...prev, newClient])
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
    const hols = loadHolidays()
    setSessions(prev => {
      let all = [...prev]
      for (const { year, month } of months) {
        const newSessions = generateSessionsForMonth([newClient], all, year, month, hols)
        all = [...all, ...newSessions]
      }
      return all
    })
    return newClient
  }, [setClients, setSessions])

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    // Regenerate sessions if schedule changed
    if (updates.schedule) {
      const now = new Date()
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
        return { year: d.getFullYear(), month: d.getMonth() }
      })
      const hols = loadHolidays()
      const allClients = loadClients()
      const updatedClient = { ...allClients.find(c => c.id === id)!, ...updates }
      setSessions(prev => {
        let all = [...prev]
        for (const { year, month } of months) {
          const newSessions = generateSessionsForMonth([updatedClient], all, year, month, hols)
          all = [...all, ...newSessions]
        }
        return all
      })
    }
  }, [setClients, setSessions])

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
    if ('status' in updates) {
      const session = sessions.find(s => s.id === id)
      if (session?.invoiceId) {
        const client = clients.find(c => c.id === session.clientId)
        if (client) {
          const invoiceId = session.invoiceId
          setInvoices(prevInv => prevInv.map(inv => {
            if (inv.id !== invoiceId) return inv
            const updatedSessions = sessions.map(s => s.id === id ? { ...s, ...updates } : s)
            const billable = updatedSessions.filter(s => inv.sessionIds.includes(s.id) && (s.status === 'completed' || s.status === 'late_cancel'))
            const totalAmount = billable.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
            return { ...inv, totalAmount }
          }))
        }
      }
    }
  }, [setSessions, sessions, clients, setInvoices])

  const addSession = useCallback((session: Omit<Session, 'id'>) => {
    const s: Session = { ...session, id: nanoid() }
    setSessions(prev => [...prev, s])
    return s
  }, [setSessions])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [setSessions])

  const addHoliday = useCallback((date: string, label: string) => {
    const h: Holiday = { id: nanoid(), date, label }
    setHolidays(prev => [...prev, h])
    // Cancel all scheduled recurring sessions on this date
    setSessions(prev => prev.map(s =>
      s.date === date && s.status === 'scheduled' && s.isRecurring
        ? { ...s, status: 'cancelled' as const }
        : s
    ))
  }, [setHolidays, setSessions])

  const removeHoliday = useCallback((date: string) => {
    setHolidays(prev => prev.filter(h => h.date !== date))
  }, [setHolidays])

  const createInvoice = useCallback((clientId: string, month: string, sessionIds: string[]) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return null
    const invoiceSessions = sessions.filter(s => sessionIds.includes(s.id))
    const totalAmount = invoiceSessions.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
    const invNum = `${settings.invoicePrefix}-${String(settings.nextInvoiceNumber).padStart(4, '0')}`
    const invoice: Invoice = {
      id: nanoid(),
      invoiceNumber: invNum,
      clientId,
      month,
      sessionIds,
      issuedAt: new Date().toISOString(),
      totalAmount,
    }
    setInvoices(prev => [...prev, invoice])
    setSettings({ ...settings, nextInvoiceNumber: settings.nextInvoiceNumber + 1 })
    setSessions(prev => prev.map(s => sessionIds.includes(s.id) ? { ...s, invoiceId: invoice.id } : s))
    return invoice
  }, [clients, sessions, settings, setInvoices, setSettings, setSessions])

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv))
  }, [setInvoices])

  return {
    clients, sessions, invoices, settings, holidays,
    setClients, setSessions, setInvoices, setSettings, setHolidays,
    addClient, updateClient, updateSession, addSession, deleteSession,
    addHoliday, removeHoliday, createInvoice, updateInvoice,
    ensureSessionsForMonth,
  }
}

export type Store = ReturnType<typeof useStore>
