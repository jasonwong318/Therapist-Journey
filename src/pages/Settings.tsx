import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { exportData, importData } from '../lib/storage'
import { backupToGist, restoreFromGist, setLastBackup, getLastBackup } from '../lib/gistBackup'
import { t } from '../lib/i18n'
import { formatDisplay } from '../lib/dates'

export const Settings = () => {
  const navigate = useNavigate()
  const { settings, setSettings, holidays, removeHoliday } = useStoreCtx()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [backupState, setBackupState] = useState<'idle' | 'busy' | 'ok' | 'fail'>('idle')

  const handleSave = () => {
    setSettings({ ...form, nextInvoiceNumber: Math.max(1, Number(form.nextInvoiceNumber) || 1) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `therapy-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setLastBackup()
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          importData(data)
          window.location.reload()
        } catch {
          alert(t.invalidBackup)
        }
      }
      reader.onerror = () => alert(t.invalidBackup)
      reader.readAsText(file)
    }
    input.click()
  }

  const handleCloudBackup = async () => {
    if (!form.githubToken) return
    setBackupState('busy')
    try {
      const gistId = await backupToGist(form.githubToken, form.githubGistId)
      const next = { ...form, githubGistId: gistId }
      setForm(next)
      setSettings({ ...next, nextInvoiceNumber: Math.max(1, Number(next.nextInvoiceNumber) || 1) })
      setLastBackup()
      setBackupState('ok')
    } catch {
      setBackupState('fail')
    }
    setTimeout(() => setBackupState('idle'), 3000)
  }

  const handleCloudRestore = async () => {
    if (!form.githubToken || !form.githubGistId) return
    if (!window.confirm(t.restoreConfirm)) return
    setBackupState('busy')
    try {
      const data = await restoreFromGist(form.githubToken, form.githubGistId)
      importData(data as Parameters<typeof importData>[0])
      window.location.reload()
    } catch {
      setBackupState('fail')
      alert(t.restoreFailed)
      setTimeout(() => setBackupState('idle'), 3000)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: String(form[key] ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  const lastBackup = getLastBackup()
  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date))
  const dividerCls = `border-t border-slate-100 dark:border-slate-700`
  const rowCls = `flex items-center justify-between py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#635BFF]`

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Back" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t.settings}</h1>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.therapistProfile}</h2>
        <Card>
          <div className="space-y-4">
            <Input label={t.yourName} placeholder={t.namePlaceholder} {...field('therapistName')} />
            <Input label={t.email} type="email" placeholder="jane@example.com" {...field('email')} />
            <Input label={t.phone} type="tel" placeholder="+852 9xxx xxxx" {...field('phone')} />
            <TextArea label={t.paymentInfo} placeholder={t.paymentPlaceholder} {...field('paymentInfo')} />
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.invoiceSettings}</h2>
        <Card>
          <div className="space-y-4">
            <Input label={t.currency} placeholder="HKD" {...field('currency')} />
            <Input label={t.invoicePrefix} placeholder="INV" {...field('invoicePrefix')} />
            <Input label={t.nextInvoiceNumber} type="number" min={1} {...field('nextInvoiceNumber')} />
            <TextArea label={t.invoiceFooterLabel} placeholder={t.invoiceFooterPlaceholder} {...field('invoiceFooter')} />
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.holidays}</h2>
        <Card>
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.skipHKHolidays}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t.skipHKHolidaysHint}</p>
            </div>
            <input
              type="checkbox"
              className="w-5 h-5 accent-[#635BFF]"
              checked={!!form.skipHKHolidays}
              onChange={e => setForm(f => ({ ...f, skipHKHolidays: e.target.checked }))}
            />
          </label>
        </Card>
      </div>

      <Button fullWidth onClick={handleSave}>
        {saved ? t.saved : t.saveSettings}
      </Button>

      <div>
        <p className="text-xs text-slate-400 mb-3">{t.manageHolidays}</p>
        <Card padding={false}>
          {sortedHolidays.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">{t.noHolidays}</p>
          ) : (
            sortedHolidays.map((h, i) => (
              <div key={h.id} className={`flex items-center justify-between px-4 py-3 ${i < sortedHolidays.length - 1 ? dividerCls : ''}`}>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDisplay(h.date)}</p>
                  {h.label && <p className="text-xs text-slate-400">{h.label}</p>}
                </div>
                <button onClick={() => removeHoliday(h.date)} className="text-xs text-red-400 font-medium px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                  {t.removeHoliday}
                </button>
              </div>
            ))
          )}
        </Card>
        <p className="text-xs text-slate-400 mt-2 text-center">{t.addHolidayHint}</p>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.cloudBackup}</h2>
        <Card>
          <div className="space-y-4">
            <Input label={t.githubTokenLabel} type="password" placeholder="ghp_..." {...field('githubToken')} />
            <p className="text-xs text-slate-400">{t.githubTokenHint}</p>
            <div className="flex gap-2">
              <Button fullWidth onClick={handleCloudBackup} disabled={!form.githubToken || backupState === 'busy'}>
                {backupState === 'busy' ? t.backingUp : backupState === 'ok' ? t.backupSuccess : backupState === 'fail' ? t.backupFailed : t.backupNow}
              </Button>
              {form.githubGistId && (
                <Button fullWidth variant="secondary" onClick={handleCloudRestore} disabled={!form.githubToken || backupState === 'busy'}>
                  {t.restoreFromCloud}
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center">
              {lastBackup ? t.lastBackup(formatDisplay(lastBackup.slice(0, 10))) : t.neverBackedUp}
            </p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.data}</h2>
        <Card>
          <div className="space-y-1">
            <button onClick={handleExport} className={`w-full flex items-center justify-between ${rowCls}`}>
              <span>{t.exportBackup}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <div className={dividerCls} />
            <button onClick={handleImport} className={`w-full flex items-center justify-between ${rowCls}`}>
              <span>{t.importBackup}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-400 text-center pb-4">{t.dataLocal}</p>
    </div>
  )
}
