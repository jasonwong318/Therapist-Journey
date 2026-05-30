import { useState } from 'react'
import { useStoreCtx } from '../hooks/StoreContext'
import { Card } from '../components/ui/Card'
import { Input, TextArea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { exportData, importData } from '../lib/storage'

export const Settings = () => {
  const { settings, setSettings } = useStoreCtx()
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
          alert('Invalid backup file.')
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

  return (
    <div className="px-4 pt-6 pb-28 space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      {/* Profile */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Therapist Profile</h2>
        <Card>
          <div className="space-y-4">
            <Input label="Your Name" placeholder="e.g. Jane Wong" {...field('therapistName')} />
            <Input label="Email" type="email" placeholder="jane@example.com" {...field('email')} />
            <Input label="Phone" type="tel" placeholder="+852 9xxx xxxx" {...field('phone')} />
            <TextArea label="Payment Info (shown on invoice)" placeholder="FPS: 9xxx xxxx&#10;Bank transfer: ..." {...field('paymentInfo')} />
          </div>
        </Card>
      </div>

      {/* Invoice settings */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Invoice</h2>
        <Card>
          <div className="space-y-4">
            <Input label="Currency" placeholder="HKD" {...field('currency')} />
            <Input label="Invoice Number Prefix" placeholder="INV" {...field('invoicePrefix')} />
            <Input label="Next Invoice Number" type="number" {...field('nextInvoiceNumber')} />
          </div>
        </Card>
      </div>

      <Button fullWidth onClick={handleSave}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </Button>

      {/* Data */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data</h2>
        <Card>
          <div className="space-y-3">
            <button onClick={handleExport} className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-[#635BFF]">
              <span>Export Backup (JSON)</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <div className="border-t border-slate-100" />
            <button onClick={handleImport} className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-[#635BFF]">
              <span>Import Backup (JSON)</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-400 text-center pb-4">All data is stored locally on this device.</p>
    </div>
  )
}
