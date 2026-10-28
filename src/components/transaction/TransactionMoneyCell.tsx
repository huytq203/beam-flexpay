import { cn } from '@utils/cn'
import { formatNumber } from '@utils/formatNumber'

export type FlowTone = 'principal' | 'fee' | 'negative' | 'positive'

const TONE_CLASS: Readonly<Record<FlowTone, string>> = {
  principal: 'font-medium',
  fee: 'text-gray-500',
  negative: 'font-medium amount-negative',
  positive: 'font-medium amount-positive'
}

interface MoneyCellProps {
  amount: number | null
  currency: string
  tone: FlowTone
}

/** Số 0 để xám cho nhẹ mắt; chỉ dòng tiền thực sự phát sinh mới lên màu. */
export function MoneyCell({ amount, currency, tone }: MoneyCellProps) {
  if (amount === null) return <span className='text-gray-500'>--</span>
  return (
    <div className='text-right'>
      <span
        className={cn(
          'whitespace-nowrap tabular-nums',
          amount === 0 ? 'text-gray-500' : TONE_CLASS[tone]
        )}
      >
        {formatNumber(amount)} {currency}
      </span>
    </div>
  )
}

interface SplitFeeCellProps {
  senderFee: number
  receiverFee: number
  currency: string
}

/** Phí trừ ví của chuyển tiền trong hệ thống: tách người chuyển / người nhận trong cùng một ô. */
export function SplitFeeCell({
  senderFee,
  receiverFee,
  currency
}: SplitFeeCellProps) {
  const rows = [
    ['Người chuyển', senderFee],
    ['Người nhận', receiverFee]
  ] as const
  return (
    <dl className='flex flex-col items-end gap-1'>
      {rows.map(([label, amount]) => (
        <div
          key={label}
          className='flex items-baseline gap-2'
        >
          <dt className='whitespace-nowrap text-xs text-gray-500'>{label}</dt>
          <dd>
            <MoneyCell
              amount={amount}
              currency={currency}
              tone='fee'
            />
          </dd>
        </div>
      ))}
    </dl>
  )
}
