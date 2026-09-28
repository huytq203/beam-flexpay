interface AccessStat {
  key: string
  label: string
  value: number
  tone?: 'default' | 'success' | 'danger' | 'warning'
  onClick?: () => void
  active?: boolean
}

const toneClasses = {
  default: 'text-foreground',
  success: 'text-success-strong',
  danger: 'text-danger-strong',
  warning: 'text-warning-strong'
} as const

export function AccessStatCards({ items }: { items: readonly AccessStat[] }) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 ${items.length === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'}`}
    >
      {items.map((item) => {
        const content = (
          <>
            <span className='text-xs text-muted-foreground'>{item.label}</span>
            <strong
              className={`font-display text-2xl tabular-nums ${toneClasses[item.tone ?? 'default']}`}
            >
              {item.value.toLocaleString('vi-VN')}
            </strong>
          </>
        )
        return item.onClick ? (
          <button
            key={item.key}
            aria-pressed={item.active}
            className={`flex min-h-20 flex-col items-start justify-center gap-1 rounded-xl border bg-background px-4 text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${item.active ? 'border-primary bg-primary/5' : 'border-border'}`}
            onClick={item.onClick}
            type='button'
          >
            {content}
          </button>
        ) : (
          <div
            key={item.key}
            className='flex min-h-20 flex-col items-start justify-center gap-1 rounded-xl border border-border bg-background px-4'
          >
            {content}
          </div>
        )
      })}
    </div>
  )
}
