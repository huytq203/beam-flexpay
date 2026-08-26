import { useCallback, useMemo, useState } from 'react'
import { useAccess } from '@/app/permissions'
import { UNFREEZE_APPROVE_PERMISSIONS } from '@constants/freeze.constant'
import { useMessage } from '@hooks/useMessage'
import {
  useApproveUnfreezeMutation,
  useRejectUnfreezeMutation
} from '@services/apiFreezes'
import type { FreezeItem } from '@type/freeze.type'

export const UnfreezeDecision = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT'
} as const

export type UnfreezeDecision =
  (typeof UnfreezeDecision)[keyof typeof UnfreezeDecision]

export interface UnfreezeDecisionDialogState {
  open: boolean
  decision: UnfreezeDecision | null
  item: FreezeItem | null
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export interface UseUnfreezeApprovalResult {
  /** Người dùng có quyền checker hay không. Thiếu quyền thì hành động bị ẩn hẳn. */
  canApprove: boolean
  openDecision: (item: FreezeItem, decision: UnfreezeDecision) => void
  dialogState: UnfreezeDecisionDialogState
}

const SUCCESS_MESSAGE: Record<UnfreezeDecision, string> = {
  [UnfreezeDecision.APPROVE]: 'Đã duyệt lệnh mở băng, tiền được hoàn về ví khả dụng',
  [UnfreezeDecision.REJECT]: 'Đã từ chối lệnh mở băng, tiền vẫn đang bị giữ'
}

/**
 * Bước checker của luồng mở băng: duyệt hoặc từ chối lệnh do người khác tạo.
 * Gom quyền, hai mutation và trạng thái hộp thoại về một chỗ vì cả ba màn đang dùng
 * `/wallet/freezes` đều cần đúng hành vi này.
 */
export const useUnfreezeApproval = (
  onSettled?: () => void
): UseUnfreezeApprovalResult => {
  const { hasAny } = useAccess()
  const { successMess } = useMessage()
  const [selectedItem, setSelectedItem] = useState<FreezeItem | null>(null)
  const [decision, setDecision] = useState<UnfreezeDecision | null>(null)

  const [approveUnfreeze, { isLoading: isApproving }] =
    useApproveUnfreezeMutation()
  const [rejectUnfreeze, { isLoading: isRejecting }] =
    useRejectUnfreezeMutation()

  const canApprove = hasAny(UNFREEZE_APPROVE_PERMISSIONS)

  const openDecision = useCallback(
    (item: FreezeItem, next: UnfreezeDecision) => {
      setSelectedItem(item)
      setDecision(next)
    },
    []
  )

  const closeDecision = useCallback(() => {
    setSelectedItem(null)
    setDecision(null)
  }, [])

  const confirmDecision = useCallback(async () => {
    const commandId = selectedItem?.unfreezeCommandId
    if (!commandId || !decision) return

    try {
      const mutate =
        decision === UnfreezeDecision.APPROVE ? approveUnfreeze : rejectUnfreeze
      await mutate(commandId).unwrap()
      successMess(SUCCESS_MESSAGE[decision])
      closeDecision()
      onSettled?.()
    } catch {
      /* lỗi đã được thông báo tập trung ở fetchBaseQueryCustom */
    }
  }, [
    approveUnfreeze,
    closeDecision,
    decision,
    onSettled,
    rejectUnfreeze,
    selectedItem,
    successMess
  ])

  const dialogState = useMemo<UnfreezeDecisionDialogState>(
    () => ({
      open: decision !== null && selectedItem !== null,
      decision,
      item: selectedItem,
      loading: isApproving || isRejecting,
      onConfirm: confirmDecision,
      onCancel: closeDecision
    }),
    [closeDecision, confirmDecision, decision, isApproving, isRejecting, selectedItem]
  )

  return { canApprove, openDecision, dialogState }
}
