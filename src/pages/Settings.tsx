import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { exportData, importData } from '../lib/storage'
import { backupToGist, restoreFromGist, setLastBackup, getLastBackup, listGistRevisions, BackupNeedsPassphraseError, BackupDecryptError, type GistRevision } from '../lib/gistBackup'
import { hasPin, setPin, verifyPin, clearPin } from '../lib/appLock'
import { buildYearCSV, downloadCSV } from '../lib/report'
import { t } from '../lib/i18n'
import { formatDisplay } from '../lib/dates'

export const Settings = () => {
  const navigate = useNavigate()
  const { settings, setSettings, holidays, removeHoliday, clients, sessions, invoices, bulkPause, clearAllPauses } = useStoreCtx()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [backupState, setBackupState] = useState<'idle' | 'busy' | 'ok' | 'fail'>('idle')
  const [pauseRange, setPauseRange] = useState({ start: '', end: '' })
  const [pinEnabled, setPinEnabled] = useState(() => hasPin())
  const [pinFields, setPinFields] = useState({ current: '', next: '', confirm: '' })
  const [revisions, setRevisions] = useState<GistRevision[] | null>(null)
  const [reportYear, setReportYear] = useState(() => String(new Date().getFullYear()))

  const resetPinFields = () => setPinFields({ current: '', next: '', confirm: '' })

  const handleEnablePin = async () => {
    if (pinFields.next.length < 4) { alert(t.pinTooShort); return }
    if (pinFields.next !== pinFields.confirm) { alert(t.pinMismatch); return }
    await setPin(pinFields.next)
    setPinEnabled(true)
    resetPinFields()
    alert(t.pinSet)
  }

  const handleChangePin = async () => {
    if (!(await verifyPin(pinFields.current))) { alert(t.pinWrong); return }
    if (pinFields.next.length < 4) { alert(t.pinTooShort); return }
    if (pinFields.next !== pinFields.confirm) { alert(t.pinMismatch); return }
    await setPin(pinFields.next)
    resetPinFields()
    alert(t.pinSet)
  }

  const handleDisablePin = async () => {
    if (!(await verifyPin(pinFields.current))) { alert(t.pinWrong); return }
    clearPin()
    setPinEnabled(false)
    resetPinFields()
  }

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

  const handleCloudRestore = async (revision?: string) => {
    if (!form.githubToken || !form.githubGistId) return
    setBackupState('busy')
    try {
      // Fetch first so the confirm dialog can show what would be overwritten.
      // Encrypted backups use the saved passphrase; prompt if it's missing/wrong.
      let data: Parameters<typeof importData>[0]
      try {
        data = await restoreFromGist(form.githubToken, form.githubGistId,
          { passphrase: form.backupPassphrase || undefined, revision }) as Parameters<typeof importData>[0]
      } catch (e) {
        if (e instanceof BackupNeedsPassphraseError || e instanceof BackupDecryptError) {
          const entered = window.prompt(t.enterBackupPassphrase)
          if (!entered) { setBackupState('idle'); return }
          data = await restoreFromGist(form.githubToken, form.githubGistId,
            { passphrase: entered, revision }) as Parameters<typeof importData>[0]
        } else {
          throw e
        }
      }
      const diff = t.restoreDiff(
        {
          clients: data.clients?.length ?? 0,
          sessions: data.sessions?.length ?? 0,
          invoices: data.invoices?.length ?? 0,
          exportedAt: (data.exportedAt ?? '').slice(0, 10) || '—',
        },
        { clients: clients.length, sessions: sessions.length, invoices: invoices.length },
      )
      if (!window.confirm(`${diff}\n\n${t.restoreConfirm}`)) {
        setBackupState('idle')
        return
      }
      importData(data)
      window.location.reload()
    } catch {
      setBackupState('fail')
      alert(t.restoreFailed)
      setTimeout(() => setBackupState('idle'), 3000)
    }
  }

  const handleShowHistory = async () => {
    if (!form.githubToken || !form.githubGistId) return
    try {
      setRevisions(await listGistRevisions(form.githubToken, form.githubGistId))
    } catch {
      alert(t.restoreFailed)
    }
  }

  const handleExportCSV = () => {
    const year = Number(reportYear)
    const csv = buildYearCSV(year, clients, sessions, invoices, form.currency || 'HKD')
    downloadCSV(csv, `therapy-income-${year}.csv`)
  }

  const dataYears = [...new Set(sessions.map(s => s.date.slice(0, 4)))].sort().reverse()

  const handleBulkPause = () => {
    const { start, end } = pauseRange
    if (!start || !end || end < start) {
      alert(t.bulkPauseInvalid)
      return
    }
    const n = bulkPause(start, end)
    alert(t.bulkPauseApplied(n))
  }

  const handleClearPauses = () => {
    const n = clearAllPauses()
    alert(t.bulkPauseCleared(n))
  }

  const toggleAutoBackup = (on: boolean) => {
    const next = { ...form, autoBackup: on }
    setForm(next)
    setSettings({ ...next, nextInvoiceNumber: Math.max(1, Number(next.nextInvoiceNumber) || 1) })
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
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.bulkPauseTitle}</h2>
        <Card>
          <div className="space-y-4">
            <p className="text-xs text-slate-400">{t.bulkPauseHint}</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label={t.pauseStart} type="date" value={pauseRange.start}
                onChange={e => setPauseRange(r => ({ ...r, start: e.target.value }))} />
              <Input label={t.pauseEnd} type="date" value={pauseRange.end}
                onChange={e => setPauseRange(r => ({ ...r, end: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button fullWidth onClick={handleBulkPause} disabled={!pauseRange.start || !pauseRange.end}>
                {t.applyBulkPause}
              </Button>
              <Button fullWidth variant="secondary" onClick={handleClearPauses}>
                {t.clearAllPauses}
              </Button>
            </div>
          </div>
        </Card>
      </div>

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
            <Input label={t.backupPassphraseLabel} type="password" {...field('backupPassphrase')} />
            <p className="text-xs text-slate-400">{t.backupPassphraseHint}</p>
            <div className="flex gap-2">
              <Button fullWidth onClick={handleCloudBackup} disabled={!form.githubToken || backupState === 'busy'}>
                {backupState === 'busy' ? t.backingUp : backupState === 'ok' ? t.backupSuccess : backupState === 'fail' ? t.backupFailed : t.backupNow}
              </Button>
              {form.githubGistId && (
                <Button fullWidth variant="secondary" onClick={() => void handleCloudRestore()} disabled={!form.githubToken || backupState === 'busy'}>
                  {t.restoreFromCloud}
                </Button>
              )}
            </div>
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.autoBackupLabel}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.autoBackupHint}</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 accent-[#635BFF]"
                checked={!!form.autoBackup}
                disabled={!form.githubToken || !form.githubGistId}
                onChange={e => toggleAutoBackup(e.target.checked)}
              />
            </label>
            <p className="text-xs text-slate-400 text-center">
              {lastBackup ? t.lastBackup(formatDisplay(lastBackup.slice(0, 10))) : t.neverBackedUp}
            </p>
            {form.githubGistId && (
              revisions === null ? (
                <button onClick={() => void handleShowHistory()} className="w-full text-center text-xs text-[#635BFF] font-medium py-1">
                  {t.backupHistory}
                </button>
              ) : revisions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center">{t.noBackupHistory}</p>
              ) : (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-2 space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.backupHistory}</p>
                  {revisions.map(rev => (
                    <div key={rev.version} className="flex items-center justify-between py-1">
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {new Date(rev.committedAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => void handleCloudRestore(rev.version)}
                        disabled={backupState === 'busy'}
                        className="text-xs text-[#635BFF] border border-[#635BFF] px-2 py-0.5 rounded-lg font-medium"
                      >
                        {t.restoreThisVersion}
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.appLock}</h2>
        <Card>
          <div className="space-y-3">
            {pinEnabled ? (
              <>
                <Input label={t.currentPinLabel} type="password" inputMode="numeric" value={pinFields.current}
                  onChange={e => setPinFields(f => ({ ...f, current: e.target.value }))} />
                <Input label={t.newPinLabel} type="password" inputMode="numeric" value={pinFields.next}
                  onChange={e => setPinFields(f => ({ ...f, next: e.target.value }))} />
                <Input label={t.confirmPinLabel} type="password" inputMode="numeric" value={pinFields.confirm}
                  onChange={e => setPinFields(f => ({ ...f, confirm: e.target.value }))} />
                <div className="flex gap-2">
                  <Button fullWidth onClick={() => void handleChangePin()} disabled={!pinFields.current || !pinFields.next}>
                    {t.changePin}
                  </Button>
                  <Button fullWidth variant="secondary" onClick={() => void handleDisablePin()} disabled={!pinFields.current}>
                    {t.disableLock}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Input label={t.newPinLabel} type="password" inputMode="numeric" value={pinFields.next}
                  onChange={e => setPinFields(f => ({ ...f, next: e.target.value }))} />
                <Input label={t.confirmPinLabel} type="password" inputMode="numeric" value={pinFields.confirm}
                  onChange={e => setPinFields(f => ({ ...f, confirm: e.target.value }))} />
                <Button fullWidth onClick={() => void handleEnablePin()} disabled={!pinFields.next}>
                  {t.enableLock}
                </Button>
              </>
            )}
            <p className="text-xs text-slate-400">{t.pinLockWarning}</p>
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
            {dataYears.length > 0 && (
              <>
                <div className={dividerCls} />
                <div className="flex items-center justify-between py-2.5 gap-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.annualReport}</span>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-sm border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 dark:text-slate-100"
                      value={reportYear}
                      onChange={e => setReportYear(e.target.value)}
                    >
                      {dataYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button onClick={handleExportCSV} className="text-sm text-[#635BFF] font-medium">
                      {t.exportCSV}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-400 text-center pb-4">{t.dataLocal}</p>
    </div>
  )
}
