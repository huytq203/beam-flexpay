import { cn } from '@lib/utils/cn'
import type { LedgerSummary as LedgerSummaryData } from '@type/systemLedger'
import { formatCurrency, formatNumber } from '@utils/formatNumber'
import {
  SUMMARY_GRID as GRID,
  SUMMARY_LABEL as LABEL,
  SUMMARY_TILE as TILE,
  SUMMARY_VALUE as VALUE
} from '../constants/ledgerSummary.styles'
import { LedgerBalanceTile } from './LedgerBalanceTile'

interface LedgerSummaryProps {
  summary?: LedgerSummaryData
  totalFallback?: number
  isLoading?: boolean
  /** Lần tải gần nhất lỗi: không trình bày số cũ như số đúng. */
  isError?: boolean
  activeDirection?: string
  onDirectionChange?: (direction?: string) => void
}

const DIRECTION_ITEMS = [
  { key: 'debitAmount', label: 'Tổng Nợ', direction: 'DEBIT' },
  { key: 'creditAmount', label: 'Tổng Có', direction: 'CREDIT' }
] as const

/** Đủ chữ số, không rút gọn, không làm tròn: The Full Digit Rule. */
const displayCount = (value?: number) =>
  value == null ? '--' : formatNumber(value, { decimals: 0 })

const displayAmount = (value?: number) =>
  value == null ? '--' : formatCurrency(value)

export const LedgerSummary = ({
  summary,
  totalFallback,
  isLoading,
  isError,
  activeDirection,
  onDirectionChange
}: LedgerSummaryProps) => {
  if (isLoading) {
    return (
      <div
        aria-label='Đang tải tổng quan sổ cái'
        className={GRID}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className='space-y-2 px-3 py-2'
            aria-hidden
          >
            <div className='h-3 w-20 animate-pulse rounded-sm bg-border' />
            <div className='h-6 w-32 animate-pulse rounded-sm bg-border' />
          </div>
        ))}
      </div>
    )
  }

  const data = isError ? undefined : summary
  const totalValue = displayCount(
    isError ? undefined : (summary?.totalCount ?? totalFallback)
  )

  return (
    <section
      aria-label='Tổng quan sổ cái'
      className={GRID}
    >
      <button
        type='button'
        aria-pressed={!activeDirection}
        aria-label={`Tổng bút toán ${totalValue}`}
        onClick={() => onDirectionChange?.()}
        className={cn(
          TILE,
          'hover:bg-background',
          !activeDirection && 'bg-background ring-1 ring-primary'
        )}
      >
        <span className={LABEL}>Tổng bút toán</span>
        <span className={VALUE}>{totalValue}</span>
      </button>

      {DIRECTION_ITEMS.map((item) => {
        const isActive = activeDirection === item.direction
        const value = displayAmount(data?.[item.key])
        return (
          <button
            key={item.key}
            type='button'
            aria-pressed={isActive}
            aria-label={`${item.label} ${value}`}
            onClick={() => onDirectionChange?.(item.direction)}
            className={cn(
              TILE,
              'hover:bg-background',
              isActive && 'bg-background ring-1 ring-primary'
            )}
          >
            <span className={LABEL}>{item.label}</span>
            <span className={VALUE}>{value}</span>
          </button>
        )
      })}

      <LedgerBalanceTile
        debit={data?.debitAmount}
        credit={data?.creditAmount}
        isFilteredByDirection={Boolean(activeDirection)}
      />
    </section>
  )
}
