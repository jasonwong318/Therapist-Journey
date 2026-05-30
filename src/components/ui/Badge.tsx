type Color = 'indigo' | 'green' | 'red' | 'yellow' | 'slate' | 'orange'

const colors: Record<Color, string> = {
  indigo: 'bg-indigo-50 text-indigo-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-700',
  slate: 'bg-slate-100 text-slate-500 line-through',
  orange: 'bg-orange-50 text-orange-700',
}

interface Props {
  color?: Color
  children: React.ReactNode
  className?: string
}

export const Badge = ({ color = 'indigo', children, className = '' }: Props) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
    {children}
  </span>
)
