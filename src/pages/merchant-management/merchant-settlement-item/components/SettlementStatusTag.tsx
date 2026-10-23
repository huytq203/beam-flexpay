import { TagComponent, TooltipComponent } from '@components/index'
import {
  SETTLEMENT_STATUS_COLORS,
  SETTLEMENT_STATUS_DESCRIPTIONS,
  SETTLEMENT_STATUS_LABELS
} from '../constants/settlementItem.constants'
import type { SettlementLineStatus } from '../types/settlementItem.types'

/** `null` nghĩa là mục chưa có dòng tương ứng (ví dụ không có đợt giữ). */
export function SettlementStatusTag({
  status
}: {
  status: SettlementLineStatus | null
}) {
  if (!status) return <span className='text-muted-foreground'>—</span>
  return (
    <TooltipComponent title={SETTLEMENT_STATUS_DESCRIPTIONS[status] ?? status}>
      <span>
        <TagComponent color={SETTLEMENT_STATUS_COLORS[status] ?? 'default'}>
          {SETTLEMENT_STATUS_LABELS[status] ?? status}
        </TagComponent>
      </span>
    </TooltipComponent>
  )
}
