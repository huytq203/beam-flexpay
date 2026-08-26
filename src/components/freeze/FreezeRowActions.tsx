import { ButtonComponent } from '@components/index'
import { UnfreezeDecision } from '@hooks/useUnfreezeApproval'
import { FreezeRowAction, getFreezeRowAction } from '@utils/freeze'
import type { FreezeItem } from '@type/freeze.type'

interface FreezeRowActionsProps {
  item: FreezeItem
  /** Thiếu quyền checker thì hành động duyệt/từ chối bị ẩn hẳn, không hiện dạng mờ. */
  canApprove: boolean
  onRequestUnfreeze?: (item: FreezeItem) => void
  onDecide?: (item: FreezeItem, decision: UnfreezeDecision) => void
}

const EMPTY = <span className="text-muted-foreground">--</span>

export const FreezeRowActions = ({
  item,
  canApprove,
  onRequestUnfreeze,
  onDecide
}: FreezeRowActionsProps) => {
  const action = getFreezeRowAction(item)

  if (action === FreezeRowAction.REQUEST_UNFREEZE) {
    return (
      <ButtonComponent
        size="small"
        type="default"
        onClick={() => onRequestUnfreeze?.(item)}
        content="Mở băng"
      />
    )
  }

  // Trạng thái đã nói rõ "Đang chờ phê duyệt"; người không có quyền duyệt không cần nút nào.
  if (action !== FreezeRowAction.DECIDE_UNFREEZE || !canApprove) return EMPTY

  return (
    <div className="flex items-center justify-center gap-1">
      <ButtonComponent
        size="small"
        onClick={() => onDecide?.(item, UnfreezeDecision.APPROVE)}
        content="Duyệt"
      />
      <ButtonComponent
        size="small"
        color="danger"
        variant="outlined"
        onClick={() => onDecide?.(item, UnfreezeDecision.REJECT)}
        content="Từ chối"
      />
    </div>
  )
}
