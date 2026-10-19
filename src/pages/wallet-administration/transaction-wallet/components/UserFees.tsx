import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { formatCurrency } from '@utils/formatNumber'
import { cn } from '@lib/utils/cn'
import { buildUserFeeSummary, type UserFeeRow } from '../utils/userFeeSummary'

interface UserFeesProps {
  data?: UnifiedContentJournal
  profit?: TransactionProfit | null
  fee?: TransactionFeeDetail | null
}

interface FeeRowProps {
  row: UserFeeRow
  formatMoney: (value: number) => string
}

const FeeRow = ({ row, formatMoney }: FeeRowProps) => (
  <div
    className={cn(
      'py-2',
      row.isTotal && 'border-t border-border font-semibold'
    )}
  >
    <div className='flex flex-wrap items-baseline justify-between gap-2'>
      <p className={cn(row.isTotal ? 'text-teal-950' : 'text-teal-900')}>
        {row.label}
      </p>
      <p
        className={cn(
          'text-right tabular-nums',
          row.isFee ? 'text-red-700' : 'text-teal-950',
          row.isTotal && 'text-lg'
        )}
      >
        {formatMoney(row.amount)}
      </p>
    </div>
    {row.formula && (
      <p className='mt-1 text-xs text-gray-600 tabular-nums'>{row.formula}</p>
    )}
  </div>
)

const UserFees = ({ data, profit, fee }: UserFeesProps) => {
  const currency = data?.currency ?? 'VND'
  const formatMoney = (value: number): string =>
    formatCurrency(value, { symbol: currency, position: 'after' })

  const header = (
    <>
      <p className='text-blue font-medium'>Tài chính & phí người dùng</p>
      <hr className='my-3' />
    </>
  )
  if (!data) {
    return (
      <>
        {header}
        <p className='text-gray-500'>--</p>
      </>
    )
  }

  const summary = buildUserFeeSummary(data, profit, fee)

  return (
    <>
      {header}
      {summary.badge && (
        <span className='mb-3 inline-block rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold tracking-wide text-violet-700 uppercase'>
          {summary.badge}
        </span>
      )}
      <div
        className='rounded-xl border border-border bg-teal-50 px-3 py-1'
        aria-label='Tóm tắt tiền và phí'
      >
        {summary.rows.map((row) => (
          <FeeRow
            key={row.label}
            row={row}
            formatMoney={formatMoney}
          />
        ))}
      </div>
      {summary.mismatch && (
        <p
          className='mt-2 text-xs text-warning-strong'
          role='alert'
        >
          Số liệu tiền và phí từ hệ thống không khớp nhau, vui lòng đối chiếu
          bút toán.
        </p>
      )}
    </>
  )
}

export default UserFees
