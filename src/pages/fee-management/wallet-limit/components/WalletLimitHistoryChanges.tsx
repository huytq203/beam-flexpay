import type { WalletLimitHistoryChange } from '@type/walletLimit.type'
import { formatNumber } from '@utils/index'

interface WalletLimitHistoryChangesProps {
  changes: WalletLimitHistoryChange[]
}

const EMPTY_VALUE_LABEL = 'Trống'

/** Số tiền ghi đủ chữ số; `null` là Trống; chuỗi giữ nguyên nhãn BE trả về. */
const formatChangeValue = (value: string | number | null): string => {
  if (value === null) return EMPTY_VALUE_LABEL
  return typeof value === 'number' ? formatNumber(value) : value
}

export function WalletLimitHistoryChanges({
  changes
}: WalletLimitHistoryChangesProps) {
  return (
    <ul className='m-0 flex list-none flex-col gap-1 p-0'>
      {changes.map((change) => (
        <li
          key={change.field}
          className='grid grid-cols-1 gap-1 sm:grid-cols-[minmax(150px,220px)_minmax(0,1fr)] sm:gap-3'
        >
          <span>{change.label}</span>
          <span className='tabular-nums'>
            <del className='text-muted-foreground'>
              {formatChangeValue(change.oldValue)}
            </del>
            <span aria-hidden> → </span>
            <span className='sr-only'> đổi thành </span>
            <strong>{formatChangeValue(change.newValue)}</strong>
          </span>
        </li>
      ))}
    </ul>
  )
}
