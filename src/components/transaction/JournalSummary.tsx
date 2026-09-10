import { cn } from '@lib/utils/cn'
import { JOURNAL_STATUS_ITEMS } from './journal-summary-items'
import type { UnifiedJournalSummary } from '@type/apiResponseJournal'
import { formatNumber } from '@utils/formatNumber'

export type JournalSummaryCountKey = Exclude<
  keyof UnifiedJournalSummary,
  'totalCount'
>

export interface JournalSummaryItem {
  /** Cột đếm trong khối `summary` của `/wallet/journal/unified`. */
  key: JournalSummaryCountKey
  label: string
  /** Giá trị gửi lên tham số `status` khi người dùng bấm vào ô. */
  status: string
  /** Tông chữ lấy từ token trạng thái; chấm màu ăn theo bằng `bg-current`. */
  toneClass: string
}

export interface JournalSummaryProps {
  ariaLabel: string
  items?: readonly JournalSummaryItem[]
  summary?: UnifiedJournalSummary
  /** Dùng khi BE chưa trả `summary` — vẫn phải cho thấy tổng số bản ghi. */
  totalFallback?: number
  totalLabel?: string
  isLoading?: boolean
  activeStatus?: string
  onStatusChange?: (status?: string) => void
  className?: string
}

const GRID =
  'grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-2 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none'

const TILE =
  'min-w-0 rounded-md px-3 py-2 text-left transition-colors hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

const TILE_ACTIVE = 'bg-background ring-1 ring-primary'

const LABEL = 'text-xs font-medium text-foreground'

const VALUE = 'mt-1 block text-xl font-bold tabular-nums'

/** Đủ chữ số, không rút gọn, không làm tròn — The Full Digit Rule. */
const displayCount = (value?: number) =>
  value == null ? '—' : formatNumber(value, { decimals: 0 })

/**
 * Dải tổng quan trạng thái cho các lưới đổ từ `/wallet/journal/unified`.
 * Mỗi ô vừa là con số vừa là bộ lọc: bấm để lọc theo `status`, bấm lại để bỏ lọc.
 */
export const JournalSummary = ({
  ariaLabel,
  items = JOURNAL_STATUS_ITEMS,
  summary,
  totalFallback,
  totalLabel = 'Tổng giao dịch',
  isLoading,
  activeStatus,
  onStatusChange,
  className
}: JournalSummaryProps) => {
  if (isLoading) {
    return (
      <div
        aria-label={`Đang tải ${ariaLabel.toLowerCase()}`}
        className={cn(GRID, 'mb-3', className)}
      >
        {Array.from({ length: items.length + 1 }, (_, index) => (
          <div
            key={index}
            className={cn('space-y-2 px-3 py-2', index === 0 && 'col-span-2 sm:col-span-1')}
            aria-hidden
          >
            <div className='h-3 w-20 animate-pulse rounded-sm bg-border' />
            <div className='h-6 w-16 animate-pulse rounded-sm bg-border' />
          </div>
        ))}
      </div>
    )
  }

  const totalValue = displayCount(summary?.totalCount ?? totalFallback)

  return (
    <section aria-label={ariaLabel} className={cn(GRID, 'mb-3', className)}>
      <button
        type='button'
        aria-pressed={!activeStatus}
        aria-label={`${totalLabel} ${totalValue}`}
        onClick={() => onStatusChange?.()}
        className={cn(
          TILE,
          'col-span-2 sm:col-span-1',
          !activeStatus && TILE_ACTIVE
        )}
      >
        <span className={cn(LABEL, 'block')}>{totalLabel}</span>
        <span className={cn(VALUE, 'text-foreground')}>{totalValue}</span>
      </button>

      {items.map((item) => {
        const isActive = activeStatus === item.status
        const value = displayCount(summary?.[item.key])

        return (
          <button
            key={item.key}
            type='button'
            aria-pressed={isActive}
            aria-label={`${item.label} ${value}`}
            onClick={() => onStatusChange?.(isActive ? undefined : item.status)}
            className={cn(TILE, isActive && TILE_ACTIVE)}
          >
            <span className={cn(LABEL, 'flex items-center gap-1.5')}>
              <span
                className={cn('size-2 shrink-0 rounded-full bg-current', item.toneClass)}
                aria-hidden
              />
              {item.label}
            </span>
            <span className={cn(VALUE, item.toneClass)}>{value}</span>
          </button>
        )
      })}
    </section>
  )
}
