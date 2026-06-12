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
import { isBillable } from '../lib/billing'
import { todayStr } from '../lib/dates'
import { nanoid } from '../lib/nanoid'

const buildMonthsAhead = (count: number) => {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })
}

export const useStore = () => {
  const [clients, setClientsState] = useState<Client[]>(() => loadClients())
  const [sessions, setSessionsState] = useState<Session[]>(() => loadSessions())
  const [invoices, setInvoicesState] = useState<Invoice[]>(() => loadInvoices())
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings())
  const [holidays, setHolidaysState] = useState<Holiday[]>(() => loadHolidays())

  useEffect(() => {
    const months = buildMonthsAhead(6)
    const current = loadClients()
    const existing = loadSessions()
    const hols = loadHolidays()
    const skipHK = !!loadSettings().skipHKHolidays
    let allSessions = [...existing]
    let changed = false

    for (const { year, month } of months) {
      const newSessions = generateSessionsForMonth(current, allSessions, year, month, hols, skipHK)
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
      const skipHK = !!loadSettings().skipHKHolidays
      const newSessions = generateSessionsForMonth(current, prev, year, month, hols, skipHK)
      if (newSessions.length === 0) return prev
      return [...prev, ...newSessions]
    })
  }, [setSessions])

  const regenerateForClient = useCallback((client: Client) => {
    const months = buildMonthsAhead(6)
    const hols = loadHolidays()
    const skipHK = !!loadSettings().skipHKHolidays
    const today = todayStr()
    setSessions(prev => {
      // Drop future scheduled recurring sessions that no longer match any slot
      // (otherwise changing a slot's time leaves duplicates at the old time),
      // or that now fall inside the client's pause period.
      const inPause = (date: string) =>
        !!client.pauseStart && !!client.pauseEnd && date >= client.pauseStart && date <= client.pauseEnd
      const matchesSlot = (s: Session) => client.schedule.some(slot => {
        if (slot.time !== s.startTime) return false
        if (slot.startDate && s.date < slot.startDate) return false
        if (slot.endDate && s.date > slot.endDate) return false
        const day = new Date(s.date + 'T00:00:00').getDay()
        return day === slot.dayOfWeek
      })
      let all = prev.filter(s => {
        if (s.clientId !== client.id) return true
        if (!s.isRecurring || s.status !== 'scheduled' || s.date < today) return true
        if (client.archivedAt) return false
        return matchesSlot(s) && !inPause(s.date)
      })
      if (!client.archivedAt) {
        for (const { year, month } of months) {
          const newSessions = generateSessionsForMonth([client], all, year, month, hols, skipHK)
          all = [...all, ...newSessions]
        }
      }
      return all
    })
  }, [setSessions])

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: nanoid() }
    setClients(prev => [...prev, newClient])
    regenerateForClient(newClient)
    return newClient
  }, [setClients, regenerateForClient])

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    const base = clients.find(c => c.id === id)
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    if (base && (updates.schedule || 'pauseStart' in updates || 'pauseEnd' in updates || 'archivedAt' in updates)) {
      regenerateForClient({ ...base, ...updates })
    }
  }, [clients, setClients, regenerateForClient])

  // Recalculates the linked invoice's total from the post-update session list,
  // so it never drifts from session statuses.
  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessionsState(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s)
      saveSessions(next)
      const updated = next.find(s => s.id === id)
      if (updated?.invoiceId && ('status' in updates || 'duration' in updates)) {
        const client = loadClients().find(c => c.id === updated.clientId)
        if (client) {
          setInvoices(prevInv => prevInv.map(inv => {
            if (inv.id !== updated.invoiceId) return inv
            const billable = next.filter(s => inv.sessionIds.includes(s.id) && isBillable(s))
            const totalAmount = billable.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
            return { ...inv, totalAmount }
          }))
        }
      }
      return next
    })
  }, [setInvoices])

  const addSession = useCallback((session: Omit<Session, 'id'>) => {
    const s: Session = { ...session, id: nanoid() }
    setSessions(prev => [...prev, s])
    return s
  }, [setSessions])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [setSessions])

  // Cancels every scheduled session on the date (recurring and ad-hoc).
  // Returns how many were cancelled so the UI can report it.
  const addHoliday = useCallback((date: string, label: string): number => {
    const h: Holiday = { id: nanoid(), date, label }
    setHolidays(prev => [...prev, h])
    const count = loadSessions().filter(s => s.date === date && s.status === 'scheduled').length
    setSessions(prev => prev.map(s =>
      s.date === date && s.status === 'scheduled'
        ? { ...s, status: 'cancelled' as const }
        : s
    ))
    return count
  }, [setHolidays, setSessions])

  const removeHoliday = useCallback((date: string, restoreSessions = false) => {
    setHolidays(prev => prev.filter(h => h.date !== date))
    if (restoreSessions) {
      setSessions(prev => prev.map(s =>
        s.date === date && s.status === 'cancelled'
          ? { ...s, status: 'scheduled' as const }
          : s
      ))
    }
  }, [setHolidays, setSessions])

  const createInvoice = useCallback((clientId: string, month: string, sessionIds: string[]) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return null
    const invoiceSessions = sessions.filter(s => sessionIds.includes(s.id) && isBillable(s))
    const totalAmount = invoiceSessions.reduce((sum, s) => sum + client.hourlyRate * s.duration, 0)
    const nextNum = Number(settings.nextInvoiceNumber) || 1
    const invNum = `${settings.invoicePrefix}-${String(nextNum).padStart(4, '0')}`
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
    setSettings({ ...settings, nextInvoiceNumber: nextNum + 1 })
    setSessions(prev => prev.map(s => sessionIds.includes(s.id) ? { ...s, invoiceId: invoice.id } : s))
    return invoice
  }, [clients, sessions, settings, setInvoices, setSettings, setSessions])

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv))
  }, [setInvoices])

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id))
    setSessions(prev => prev.map(s => s.invoiceId === id ? { ...s, invoiceId: undefined } : s))
  }, [setInvoices, setSessions])

  return {
    clients, sessions, invoices, settings, holidays,
    setClients, setSessions, setInvoices, setSettings, setHolidays,
    addClient, updateClient, updateSession, addSession, deleteSession,
    addHoliday, removeHoliday, createInvoice, updateInvoice, deleteInvoice,
    ensureSessionsForMonth,
  }
}

export type Store = ReturnType<typeof useStore>
