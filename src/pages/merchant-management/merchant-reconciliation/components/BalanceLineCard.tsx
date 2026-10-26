import { TagComponent } from '@components/index'
import { FREEZE_NOT_APPLIED_NOTE } from '../constants/reconciliation.constants'
import { formatVnd } from '../../merchant-settlement/utils/money'
import type { BalanceLine } from '../types/reconciliation.types'

/** Một khoản của báo cáo; `label` và `explanation` do BE cố định nên hiển thị nguyên văn. */
export function BalanceLineCard({ line }: { line: BalanceLine }) {
  const notApplied = line.code === 'ORDER_FREEZE'
  return (
    <div className='flex min-w-0 flex-col gap-1 rounded-lg border border-border p-3'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-sm font-medium'>{line.label}</span>
        {notApplied && (
          <TagComponent color='default'>Chưa áp dụng</TagComponent>
        )}
      </div>
      <span className='tabular-nums text-lg font-semibold'>
        {formatVnd(line.amount)} đ
      </span>
      <p className='text-xs leading-relaxed text-muted-foreground'>
        {line.explanation}
      </p>
      {notApplied && (
        <p className='text-xs leading-relaxed text-muted-foreground'>
          {FREEZE_NOT_APPLIED_NOTE}
        </p>
      )}
    </div>
  )
}
