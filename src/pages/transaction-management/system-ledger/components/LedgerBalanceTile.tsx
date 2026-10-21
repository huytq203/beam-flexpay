import { cn } from '@lib/utils/cn'
import { formatCurrency } from '@utils/formatNumber'
import {
  SUMMARY_LABEL as LABEL,
  SUMMARY_TILE as TILE,
  SUMMARY_VALUE as VALUE
} from '../constants/ledgerSummary.styles'

interface LedgerBalanceTileProps {
  debit?: number
  credit?: number
  /** Lọc theo một chiều thì tổng bên kia luôn bằng 0, so hai bên là vô nghĩa. */
  isFilteredByDirection: boolean
}

const TITLE = 'Chênh lệch Nợ - Có'

/**
 * Kế toán kép: tổng Nợ phải bằng tổng Có trên cùng một bộ lọc. Lệch là dấu hiệu
 * bút toán ghi thiếu một vế, nên phải nổi lên ngay chứ không để người trực tự trừ.
 */
export const LedgerBalanceTile = ({
  debit,
  credit,
  isFilteredByDirection
}: LedgerBalanceTileProps) => {
  if (isFilteredByDirection || debit == null || credit == null) {
    return (
      <div className={TILE}>
        <span className={LABEL}>{TITLE}</span>
        <span className={cn(VALUE, 'text-muted-foreground')}>--</span>
      </div>
    )
  }

  // Làm tròn tới đồng lẻ để sai số dấu phẩy động không bị báo thành lệch sổ.
  const diff = Math.round((debit - credit) * 100) / 100
  if (diff === 0) {
    return (
      <div className={TILE}>
        <span className={LABEL}>{TITLE}</span>
        <span className={cn(VALUE, 'text-success-strong')}>
          {formatCurrency(0)}
        </span>
      
      </div>
    )
  }

  return (
    <div
      role='status'
      className={cn(TILE, 'bg-danger/10 ring-1 ring-danger-strong')}
    >
      <span className={LABEL}>{TITLE}</span>
      <span className={cn(VALUE, 'text-danger-strong')}>
        {formatCurrency(Math.abs(diff))}
      </span>
     
    </div>
  )
}
