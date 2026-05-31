import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { exportData, importData } from '../lib/storage'
import { t } from '../lib/i18n'
import { formatDisplay } from '../lib/dates'

export const Settings = () => {
  const navigate = useNavigate()
  const { settings, setSettings, holidays, removeHoliday } = useStoreCtx()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSettings(form)
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
          alert('無效的備份檔案。')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const field = (key: keyof typeof form) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date))
  const dividerCls = `border-t border-slate-100 dark:border-slate-700`
  const rowCls = `flex items-center justify-between py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#635BFF]`

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
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
            <Input label={t.nextInvoiceNumber} type="number" {...field('nextInvoiceNumber')} />
          </div>
        </Card>
      </div>

      <Button fullWidth onClick={handleSave}>
        {saved ? t.saved : t.saveSettings}
      </Button>

      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t.holidays}</h2>
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
                  移除
                </button>
              </div>
            ))
          )}
        </Card>
        <p className="text-xs text-slate-400 mt-2 text-center">從日曆頁點擊日期可新增假期</p>
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
