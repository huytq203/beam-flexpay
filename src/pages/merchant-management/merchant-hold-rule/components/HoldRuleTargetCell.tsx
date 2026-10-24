import {
  useGetHierarchyParentByIdQuery,
  useGetSubMerchantDetailQuery
} from '@/app/services/merchantHierarchyApi'
import { LEVEL_LABEL } from '../constants/holdRule.constants'
import type { HoldRuleLevel } from '../types/holdRule.types'

interface HoldRuleTargetCellProps {
  level: HoldRuleLevel
  targetId?: string | null
}

/** BE chỉ trả `targetLevel`/`targetId`, không trả tên nên tự tra Master/Sub. */
export function HoldRuleTargetCell({
  level,
  targetId
}: HoldRuleTargetCellProps) {
  const master = useGetHierarchyParentByIdQuery(targetId ?? '', {
    skip: level !== 'MASTER' || !targetId
  })
  const sub = useGetSubMerchantDetailQuery(targetId ?? '', {
    skip: level !== 'SUB' || !targetId
  })
  const picked = level === 'MASTER' ? master.data : sub.data
  return (
    <div className='min-w-0'>
      <div className='text-sm font-medium'>{LEVEL_LABEL[level] ?? level}</div>
      {targetId && (
        <div
          className='truncate text-xs text-muted-foreground'
          title={targetId}
        >
          {picked ? `${picked.code} — ${picked.name}` : targetId}
        </div>
      )}
    </div>
  )
}
