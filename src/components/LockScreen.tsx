import { useState } from 'react'
import { verifyPin } from '../lib/appLock'
import { t } from '../lib/i18n'

export const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPinValue] = useState('')
  const [error, setError] = useState(false)

  const submit = async () => {
    if (!pin) return
    if (await verifyPin(pin)) {
      onUnlock()
    } else {
      setError(true)
      setPinValue('')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#F6F9FC] dark:bg-[#0f0f14] flex flex-col items-center justify-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-[#635BFF] flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{t.appName}</h1>
      <p className="text-sm text-slate-400 mb-6">{t.enterPin}</p>
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        className={`w-48 text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 dark:text-slate-100 ${
          error ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'
        }`}
        value={pin}
        onChange={e => { setPinValue(e.target.value.replace(/\D/g, '').slice(0, 8)); setError(false) }}
        onKeyDown={e => { if (e.key === 'Enter') void submit() }}
      />
      {error && <p className="text-xs text-red-400 mt-2">{t.pinWrong}</p>}
      <button
        onClick={() => void submit()}
        disabled={!pin}
        className="mt-6 w-48 py-3 rounded-xl bg-[#635BFF] text-white font-medium text-sm disabled:opacity-40"
      >
        {t.unlock}
      </button>
    </div>
  )
}
