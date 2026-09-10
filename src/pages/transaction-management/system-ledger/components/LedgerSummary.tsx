import { formatCurrency, formatNumber } from '@utils/formatNumber'
import type { LedgerSummary as LedgerSummaryData } from '../types/SystemLedger.type'

interface LedgerSummaryProps {
  summary?: LedgerSummaryData
  totalFallback?: number
  isLoading?: boolean
  activeDirection?: string
  onDirectionChange?: (direction?: string) => void
}

const AMOUNT_ITEMS = [
  {
    key: 'debitAmount',
    label: 'Tổng Nợ',
    direction: 'DEBIT',
    dotClass: 'bg-red-600',
    valueClass: 'text-red-700'
  },
  {
    key: 'creditAmount',
    label: 'Tổng Có',
    direction: 'CREDIT',
    dotClass: 'bg-green-600',
    valueClass: 'text-green-700'
  }
] as const

const displayCount = (value?: number) =>
  value == null ? '—' : formatNumber(value, { decimals: 0 })

const displayAmount = (value?: number) =>
  value == null ? '—' : formatCurrency(value)

export const LedgerSummary = ({
  summary,
  totalFallback,
  isLoading,
  activeDirection,
  onDirectionChange
}: LedgerSummaryProps) => {
  if (isLoading) {
    return (
      <div
        aria-label='Đang tải tổng quan sổ cái'
        className='mb-3 grid grid-cols-1 gap-3 rounded-lg border border-border bg-slate-50 p-3 sm:grid-cols-3'
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className='space-y-2' aria-hidden>
            <div className='h-3 w-20 animate-pulse rounded-sm bg-slate-200' />
            <div className='h-6 w-32 animate-pulse rounded-sm bg-slate-200' />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section
      aria-label='Tổng quan sổ cái'
      className='mb-3 rounded-lg border border-border bg-slate-50 p-3'
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
        <button
          type='button'
          aria-pressed={!activeDirection}
          onClick={() => onDirectionChange?.()}
          className={`min-w-0 rounded-md px-2 py-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            !activeDirection ? 'bg-white ring-1 ring-slate-300' : 'hover:bg-white'
          }`}
        >
          <p className='text-xs font-medium text-slate-600'>Tổng bút toán</p>
          <p className='mt-1 text-xl font-bold tabular-nums text-slate-950'>
            {displayCount(summary?.totalCount ?? totalFallback)}
          </p>
        </button>

        {AMOUNT_ITEMS.map((item) => (
          <button
            key={item.key}
            type='button'
            aria-pressed={activeDirection === item.direction}
            onClick={() => onDirectionChange?.(item.direction)}
            className={`min-w-0 rounded-md border-t border-slate-200 px-2 py-1 pt-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-1 ${
              activeDirection === item.direction
                ? 'bg-white ring-1 ring-slate-300'
                : 'hover:bg-white'
            }`}
          >
            <p className='flex items-center gap-1.5 text-xs font-medium text-slate-600'>
              <span
                className={`size-2 shrink-0 rounded-full ${item.dotClass}`}
                aria-hidden
              />
              {item.label}
            </p>
            <p className={`mt-1 text-xl font-bold tabular-nums ${item.valueClass}`}>
              {displayAmount(summary?.[item.key])}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
