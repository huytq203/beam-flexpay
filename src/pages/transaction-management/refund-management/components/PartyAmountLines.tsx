import { cn } from '@lib/utils/cn'
import { formatVnd } from '../utils/refund.utils'

interface PartyAmountLinesProps {
  sender?: number | null
  receiver?: number | null
}

interface PartyAmountProps {
  label: string
  value?: number | null
}

/** Số 0 là giá trị đã tính nhưng không cần gây chú ý; null hiện "-" (chưa có dữ liệu). */
function PartyAmount({ label, value }: PartyAmountProps) {
  const isZero = value === 0
  return (
    <div className='flex items-baseline justify-between gap-3'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className={cn(isZero && 'text-muted-foreground')}>
        {formatVnd(value)}
      </dd>
    </div>
  )
}

/**
 * Bên chuyển luôn hiện vì quyết định số khách nhận; bên nhận chỉ hiện khi có phát sinh,
 * để hầu hết dòng chỉ còn một số. Nhãn là cột bên trái, số căn phải cho thẳng chữ số.
 */
export function PartyAmountLines({ sender, receiver }: PartyAmountLinesProps) {
  return (
    <dl className='flex min-w-28 flex-col tabular-nums'>
      <PartyAmount
        label='Chuyển'
        value={sender}
      />
      {receiver ? (
        <PartyAmount
          label='Nhận'
          value={receiver}
        />
      ) : null}
    </dl>
  )
}
