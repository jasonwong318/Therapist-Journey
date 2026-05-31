import { type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const baseInput = `w-full px-3 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-colors bg-white dark:bg-slate-700 dark:border-slate-600`

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <input className={`${baseInput} ${error ? 'border-red-400' : 'border-slate-200'} ${className}`} {...props} />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = ({ label, error, className = '', children, ...props }: SelectProps & { children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <select
      className={`${baseInput} ${error ? 'border-red-400' : 'border-slate-200'} ${className}`}
      {...(props as any)}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const TextArea = ({ label, className = '', ...props }: TextAreaProps) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
    <textarea
      className={`w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-colors bg-white dark:bg-slate-700 resize-none ${className}`}
      rows={3}
      {...props}
    />
  </div>
)
