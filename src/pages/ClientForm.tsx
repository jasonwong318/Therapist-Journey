import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Button } from '../components/ui/Button'
import { Input, Select, TextArea } from '../components/ui/Input'
import type { ScheduleSlot, SessionDuration } from '../lib/types'
import { t } from '../lib/i18n'

export const ClientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, addClient, updateClient } = useStoreCtx()
  const existing = id ? clients.find(c => c.id === id) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [hourlyRate, setHourlyRate] = useState(String(existing?.hourlyRate ?? ''))
  const [defaultDuration, setDefaultDuration] = useState<SessionDuration>(existing?.defaultDuration ?? 1)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(existing?.schedule ?? [])

  const addSlot = () => setSchedule(prev => [...prev, { dayOfWeek: 1, time: '10:00', duration: defaultDuration }])
  const removeSlot = (i: number) => setSchedule(prev => prev.filter((_, idx) => idx !== i))
  const updateSlot = (i: number, patch: Partial<ScheduleSlot>) => setSchedule(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  const handleSubmit = () => {
    if (!name.trim() || !hourlyRate) return
    const data = { name: name.trim(), color: '', hourlyRate: Number(hourlyRate), defaultDuration, notes, schedule }
    if (existing) {
      updateClient(existing.id, data)
      navigate(`/clients/${existing.id}`)
    } else {
      const c = addClient(data)
      navigate(`/clients/${c.id}`)
    }
  }

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex-1">{existing ? t.editClient : t.newClient}</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1">
          取消
        </button>
      </div>

      <div className="space-y-4">
        <Input label={t.clientName} value={name} onChange={e => setName(e.target.value)} placeholder={t.clientNamePlaceholder} />
        <Input label={t.hourlyRate} type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="例：800" />
        <Select label={t.defaultDuration} value={defaultDuration} onChange={e => setDefaultDuration(Number(e.target.value) as SessionDuration)}>
          <option value={1}>{t.oneHour}</option>
          <option value={1.5}>{t.oneHalfHour}</option>
          <option value={2}>{t.twoHours}</option>
        </Select>
        <TextArea label={t.notes} value={notes} onChange={e => setNotes(e.target.value)} placeholder={t.notesPlaceholder} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t.weeklySchedule}</h2>
          <button onClick={addSlot} className="text-sm text-[#635BFF] font-medium">{t.addSlot}</button>
        </div>
        {schedule.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            {t.noSlots}
          </p>
        )}
        <div className="space-y-3">
          {schedule.map((slot, i) => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Select label={t.day} value={slot.dayOfWeek} onChange={e => updateSlot(i, { dayOfWeek: Number(e.target.value) })}>
                  {t.daysLong.map((d, di) => <option key={di} value={di}>{d}</option>)}
                </Select>
                <Input label={t.time} type="time" value={slot.time} onChange={e => updateSlot(i, { time: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Select label={t.duration} value={slot.duration} onChange={e => updateSlot(i, { duration: Number(e.target.value) as SessionDuration })}>
                    <option value={1}>{t.oneHour}</option>
                    <option value={1.5}>{t.oneHalfHour}</option>
                    <option value={2}>{t.twoHours}</option>
                  </Select>
                </div>
                <button onClick={() => removeSlot(i)} className="mt-5 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button fullWidth onClick={handleSubmit} disabled={!name.trim() || !hourlyRate}>
        {existing ? t.saveChanges : t.addClient}
      </Button>

      <Button fullWidth variant="secondary" onClick={() => navigate(-1)}>
        取消
      </Button>

      {existing && (
        existing.archivedAt ? (
          <Button fullWidth variant="secondary" onClick={() => {
            updateClient(existing.id, { archivedAt: undefined })
            navigate(`/clients/${existing.id}`)
          }}>
            取消存檔（重新啟用）
          </Button>
        ) : (
          <Button fullWidth variant="danger" onClick={() => {
            updateClient(existing.id, { archivedAt: new Date().toISOString() })
            navigate('/clients')
          }}>
            {t.archiveClient}
          </Button>
        )
      )}
    </div>
  )
}
