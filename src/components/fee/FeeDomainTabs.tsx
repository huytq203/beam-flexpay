import { cn } from '@lib/utils/cn'
import { FEE_DOMAIN_ENTRIES, type FeeDomain } from './feeDomain'

export interface FeeDomainTabsProps {
  value: FeeDomain
  onChange: (next: FeeDomain) => void
  /** Khoá tab lại khi miền phí không còn đổi được, ví dụ lúc sửa bản ghi cũ. */
  disabled?: boolean
  className?: string
}

/**
 * Hàng tab miền phí dùng chung cho màn danh sách và màn cấu hình, để hai màn
 * không trôi ra hai bộ nhãn khác nhau.
 */
export const FeeDomainTabs = ({
  value,
  onChange,
  disabled = false,
  className
}: FeeDomainTabsProps) => {
  const active = FEE_DOMAIN_ENTRIES.find((entry) => entry.value === value)

  return (
    <div className={className}>
      <div role='tablist' aria-label='Miền phí' className='flex flex-wrap gap-2'>
        {FEE_DOMAIN_ENTRIES.map(({ value: domain, label, Icon }) => {
          const isActive = domain === value
          return (
            <button
              key={domain}
              type='button'
              role='tab'
              aria-selected={isActive}
              disabled={disabled && !isActive}
              onClick={() => onChange(domain)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2',
                'text-[13px] font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-60',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              )}
            >
              <Icon size={16} weight={isActive ? 'fill' : 'bold'} aria-hidden />
              {label}
            </button>
          )
        })}
      </div>
      {active && (
        <p className='mt-2 text-xs text-muted-foreground'>{active.hint}</p>
      )}
    </div>
  )
}
