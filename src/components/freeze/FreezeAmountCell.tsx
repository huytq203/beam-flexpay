import { formatCurrency } from '@utils/formatNumber'
import { getFreezeAmountSummary } from '@utils/freeze'
import type { FreezeItem } from '@type/freeze.type'

interface FreezeAmountCellProps {
  item: FreezeItem
}

/**
 * Số tiền của một lệnh đóng băng không phải một con số. Chỉ hiện `amount` sẽ giấu mất việc
 * lệnh đã được Đã mở băng một phần, hoặc ví không đủ tiền nên hệ thống chưa giữ đủ.
 * Các dòng phụ chỉ xuất hiện khi thực sự khác 0, để hàng bình thường vẫn gọn đúng một dòng.
 */
export const FreezeAmountCell = ({ item }: FreezeAmountCellProps) => {
  const { held, released, shortfall, topUpCount } = getFreezeAmountSummary(item)

  return (
    <div className='flex flex-col items-end gap-0.5'>
      <span className='amount-caution font-semibold tabular-nums'>
        {formatCurrency(held, { symbol: 'VNĐ', position: 'after' })}
      </span>

      {released > 0 && (
        <span className='text-[12px] text-muted-foreground tabular-nums'>
          Đã mở băng{' '}
          {formatCurrency(released, { symbol: 'VNĐ', position: 'after' })}
        </span>
      )}

      {shortfall > 0 && (
        <span className='amount-negative text-[12px] font-medium tabular-nums'>
          Còn thiếu{' '}
          {formatCurrency(shortfall, { symbol: 'VNĐ', position: 'after' })}
        </span>
      )}

      {topUpCount > 0 && (
        <span className='text-[12px] text-muted-foreground'>
          Đã bù {topUpCount} lần
        </span>
      )}
    </div>
  )
}
