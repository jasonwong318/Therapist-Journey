import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Button } from '../components/ui/Button'
import { Input, Select, TextArea } from '../components/ui/Input'
import type { ScheduleSlot, SessionDuration } from '../lib/types'
import { withRateChange } from '../lib/rates'
import { todayStr } from '../lib/dates'
import { t } from '../lib/i18n'

export const ClientForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clients, addClient, updateClient } = useStoreCtx()
  const existing = id ? clients.find(c => c.id === id) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [phone, setPhone] = useState(existing?.phone ?? '')
  const [hourlyRate, setHourlyRate] = useState(String(existing?.hourlyRate ?? ''))
  const [defaultDuration, setDefaultDuration] = useState<SessionDuration>(existing?.defaultDuration ?? 1)
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(existing?.schedule ?? [])
  const [pauseStart, setPauseStart] = useState(existing?.pauseStart ?? '')
  const [pauseEnd, setPauseEnd] = useState(existing?.pauseEnd ?? '')
  const [rateEffectiveFrom, setRateEffectiveFrom] = useState(todayStr())

  const rateChanged = !!existing && Number(hourlyRate) !== existing.hourlyRate

  const addSlot = () => setSchedule(prev => [...prev, { dayOfWeek: 1, time: '10:00', duration: defaultDuration }])
  const removeSlot = (i: number) => setSchedule(prev => prev.filter((_, idx) => idx !== i))
  const updateSlot = (i: number, patch: Partial<ScheduleSlot>) => setSchedule(prev => prev.map((s, idx) => idx === i ? { ...s, ...patch } : s))

  const rateNum = Number(hourlyRate)
  const valid = !!name.trim() && Number.isFinite(rateNum) && rateNum > 0

  const handleSubmit = () => {
    if (!valid) return
    const data = {
      name: name.trim(),
      color: '',
      phone: phone.trim() || undefined,
      hourlyRate: rateNum,
      defaultDuration,
      notes,
      schedule,
      pauseStart: pauseStart || undefined,
      pauseEnd: pauseEnd || undefined,
    }
    if (existing) {
      // A rate change takes effect from the chosen date: sessions before it
      // keep billing at the old rate via the client's rate history.
      const rateFields = rateChanged
        ? withRateChange(existing, rateNum, rateEffectiveFrom || todayStr())
        : {}
      updateClient(existing.id, { ...data, ...rateFields })
      navigate(`/clients/${existing.id}`)
    } else {
      const c = addClient(data)
      navigate(`/clients/${c.id}`)
    }
  }

  return (
    <div className="px-4 pt-6 pb-28 space-y-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Back" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{existing ? t.editClient : t.newClient}</h1>
      </div>

      <div className="space-y-4">
        <Input label={t.clientName} value={name} onChange={e => setName(e.target.value)} placeholder={t.clientNamePlaceholder} />
        <div>
          <Input label={t.clientPhone} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="85291234567" />
          <p className="text-xs text-slate-400 mt-1">{t.clientPhoneHint}</p>
        </div>
        <div>
          <Input label={t.hourlyRate} type="number" min={1} value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="例：800" />
          {rateChanged && (
            <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-2">
              <Input label={t.rateEffectiveFrom} type="date" value={rateEffectiveFrom} onChange={e => setRateEffectiveFrom(e.target.value)} />
              <p className="text-xs text-amber-700 dark:text-amber-400">{t.rateChangeHint}</p>
            </div>
          )}
        </div>
        <Select label={t.defaultDuration} value={defaultDuration} onChange={e => setDefaultDuration(Number(e.target.value) as SessionDuration)}>
          <option value={0.5}>{t.halfHour}</option>
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
                <button onClick={() => removeSlot(i)} aria-label="Remove slot" className="mt-5 p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input label={t.slotStartDate} type="date" value={slot.startDate ?? ''} onChange={e => updateSlot(i, { startDate: e.target.value || undefined })} />
                <Input label={t.slotEndDate} type="date" value={slot.endDate ?? ''} onChange={e => updateSlot(i, { endDate: e.target.value || undefined })} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pause schedule (e.g. summer break) */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t.pauseSchedule}</h2>
        <p className="text-xs text-slate-400 mb-3">{t.pauseHint}</p>
        <div className="grid grid-cols-2 gap-2">
          <Input label={t.pauseStart} type="date" value={pauseStart} onChange={e => setPauseStart(e.target.value)} />
          <Input label={t.pauseEnd} type="date" value={pauseEnd} onChange={e => setPauseEnd(e.target.value)} />
        </div>
      </div>

      <Button fullWidth onClick={handleSubmit} disabled={!valid}>
        {existing ? t.saveChanges : t.addClient}
      </Button>

      {existing && (
        existing.archivedAt ? (
          <Button fullWidth variant="secondary" onClick={() => {
            updateClient(existing.id, { archivedAt: undefined })
            navigate(`/clients/${existing.id}`)
          }}>
            {t.unarchiveClient}
          </Button>
        ) : (
          <Button fullWidth variant="danger" onClick={() => {
            if (!window.confirm(t.confirmArchiveClient)) return
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
