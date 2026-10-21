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
