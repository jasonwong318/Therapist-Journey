import { type HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export const Card = ({ className = '', padding = true, children, ...props }: Props) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${padding ? 'p-4' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
)
