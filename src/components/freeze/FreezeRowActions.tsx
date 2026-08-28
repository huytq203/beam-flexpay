import { ButtonComponent } from '@components/index'
import { UnfreezeDecision } from '@hooks/useUnfreezeApproval'
import { useAppSelector } from '@hooks/hook'
import { getFreezeRowActionFlags } from '@utils/freeze'
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
  const currentUsername = useAppSelector((state) => state.auth.profile.username)
  const { canRequestUnfreeze, canDecideUnfreeze } = getFreezeRowActionFlags(item)

  // Chính mình là maker của lệnh đang pending → không được duyệt/từ chối.
  const isMaker =
    !!item.unfreezeCommandMakerId &&
    item.unfreezeCommandMakerId === currentUsername

  const showDecide = canDecideUnfreeze && canApprove && !isMaker

  if (!canRequestUnfreeze && !showDecide) return EMPTY

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {canRequestUnfreeze && (
        <ButtonComponent
          size="small"
          type="default"
          onClick={() => onRequestUnfreeze?.(item)}
          content="Mở băng"
        />
      )}
      {showDecide && (
        <>
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
        </>
      )}
    </div>
  )
}
