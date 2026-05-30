import { useState, useEffect, useCallback } from 'react'
import type { Client, Session, Invoice, AppSettings } from '../lib/types'
import {
  loadClients, saveClients,
  loadSessions, saveSessions,
  loadInvoices, saveInvoices,
  loadSettings, saveSettings,
} from '../lib/storage'
import { generateSessionsForMonth } from '../lib/schedule'
import { nanoid } from '../lib/nanoid'

export const useStore = () => {
  const [clients, setClientsState] = useState<Client[]>(() => loadClients())
  const [sessions, setSessionsState] = useState<Session[]>(() => loadSessions())
  const [invoices, setInvoicesState] = useState<Invoice[]>(() => loadInvoices())
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings())

  // Auto-generate sessions for current + next month on load
  useEffect(() => {
    const now = new Date()
    const months = [
      [now.getFullYear(), now.getMonth()],
      [now.getFullYear(), now.getMonth() + 1 > 11 ? 0 : now.getMonth() + 1],
    ].map(([y, m]) => ({ year: y === now.getFullYear() && m === 0 && now.getMonth() === 11 ? y + 1 : y, month: m }))

    const current = loadClients()
    const existing = loadSessions()
    let allSessions = [...existing]
    let changed = false

    for (const { year, month } of months) {
      const newSessions = generateSessionsForMonth(current, allSessions, year, month)
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

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: nanoid() }
    setClients(prev => [...prev, newClient])
    // Generate sessions for current + next month for new client
    const now = new Date()
    const months = [
      { year: now.getFullYear(), month: now.getMonth() },
      { year: now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(), month: now.getMonth() === 11 ? 0 : now.getMonth() + 1 },
    ]
    setSessions(prev => {
      let all = [...prev]
      for (const { year, month } of months) {
        const newSessions = generateSessionsForMonth([newClient], all, year, month)
        all = [...all, ...newSessions]
      }
      return all
    })
    return newClient
  }, [setClients, setSessions])

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }, [setClients])

  const updateSession = useCallback((id: string, updates: Partial<Session>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }, [setSessions])

  const addSession = useCallback((session: Omit<Session, 'id'>) => {
    const s: Session = { ...session, id: nanoid() }
    setSessions(prev => [...prev, s])
    return s
  }, [setSessions])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id))
  }, [setSessions])

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
    clients, sessions, invoices, settings,
    setClients, setSessions, setInvoices, setSettings,
    addClient, updateClient, updateSession, addSession, deleteSession,
    createInvoice, updateInvoice,
  }
}

export type Store = ReturnType<typeof useStore>
