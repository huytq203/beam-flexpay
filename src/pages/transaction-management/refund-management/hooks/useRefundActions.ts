import { globalMessage } from '@hooks/useMessage'
import {
  useApproveRefundMutation,
  useRefreshRefundPayoutMutation,
  useRejectRefundMutation,
  useSettleRefundMutation
} from '@services/apiRefund'
import type { RefundDetail } from '../schemas/refund.schema'
import { getRefundErrorText } from '../utils/refund.utils'
import {
  describeApproveOutcome,
  describePayoutOutcome,
  describeSettleOutcome
} from '../utils/refundOutcome'

export type RefundActionResult =
  | { ok: true; refund: RefundDetail }
  | { ok: false; message: string }

const failure = (error: unknown): RefundActionResult => ({
  ok: false,
  message: getRefundErrorText(error)
})

/**
 * Lỗi trả về cho dialog tự hiển thị `detail`; riêng làm mới lệnh chi không có dialog
 * nên báo lỗi bằng message. Toast lỗi tập trung đã tắt ở `apiRefund`.
 */
export const useRefundActions = () => {
  const [approveRefund, approving] = useApproveRefundMutation()
  const [rejectRefund, rejecting] = useRejectRefundMutation()
  const [settleRefund, settling] = useSettleRefundMutation()
  const [refreshPayout, refreshing] = useRefreshRefundPayoutMutation()

  const approve = async (id: string): Promise<RefundActionResult> => {
    try {
      const refund = await approveRefund(id).unwrap()
      const outcome = describeApproveOutcome(refund)
      globalMessage[outcome.kind === 'success' ? 'success' : 'warning'](
        outcome.text
      )
      return { ok: true, refund }
    } catch (error) {
      return failure(error)
    }
  }

  const reject = async (
    id: string,
    reason: string
  ): Promise<RefundActionResult> => {
    try {
      const refund = await rejectRefund({ id, reason }).unwrap()
      globalMessage.success(`Đã từ chối ${refund.refundCode}`)
      return { ok: true, refund }
    } catch (error) {
      return failure(error)
    }
  }

  const settle = async (
    id: string,
    success: boolean,
    failureReason?: string
  ): Promise<RefundActionResult> => {
    try {
      const refund = await settleRefund({ id, success, failureReason }).unwrap()
      globalMessage.success(describeSettleOutcome(success))
      return { ok: true, refund }
    } catch (error) {
      return failure(error)
    }
  }

  const refreshPayoutOrder = async (
    id: string
  ): Promise<RefundActionResult> => {
    try {
      const refund = await refreshPayout(id).unwrap()
      globalMessage.success(describePayoutOutcome(refund))
      return { ok: true, refund }
    } catch (error) {
      const result = failure(error)
      if (!result.ok) globalMessage.error(result.message)
      return result
    }
  }

  return {
    approve,
    reject,
    settle,
    refreshPayoutOrder,
    isApproving: approving.isLoading,
    isRejecting: rejecting.isLoading,
    isSettling: settling.isLoading,
    isRefreshingPayout: refreshing.isLoading
  }
}
