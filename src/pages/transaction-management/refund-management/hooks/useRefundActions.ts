import { readFirstErrorMessage } from '@components/payout/manualPayout.utils'
import { globalMessage } from '@hooks/useMessage'
import {
  type ManualPayoutRefundArg,
  useApproveRefundMutation,
  useManualPayoutRefundMutation,
  useApproveRefundPayoutMutation,
  useRefreshRefundPayoutMutation,
  useRejectRefundMutation,
  useRejectRefundPayoutMutation,
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
  const [approveRefundPayout, approvingPayout] =
    useApproveRefundPayoutMutation()
  const [rejectRefundPayout, rejectingPayout] = useRejectRefundPayoutMutation()
  const [settleRefund, settling] = useSettleRefundMutation()
  const [refreshPayout, refreshing] = useRefreshRefundPayoutMutation()
  const [manualPayoutRefund, confirmingManual] =
    useManualPayoutRefundMutation()

  /**
   * Chốt tay lệnh chi hoàn MANUAL. Câu lỗi lấy `errors[0].message` của BE trước,
   * thiếu thì rơi về cách đọc chung của màn hoàn tiền.
   */
  const manualPayout = async (
    arg: ManualPayoutRefundArg
  ): Promise<RefundActionResult> => {
    try {
      const refund = await manualPayoutRefund(arg).unwrap()
      globalMessage.success(
        arg.outcome === 'SUCCESS'
          ? `Đã chốt chi thành công ${refund.refundCode}.`
          : `Đã chốt chi thất bại ${refund.refundCode}, tiền đang giữ đã được nhả.`
      )
      return { ok: true, refund }
    } catch (error) {
      return {
        ok: false,
        message: readFirstErrorMessage(error) ?? getRefundErrorText(error)
      }
    }
  }

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

  /** Kế toán duyệt chi: lệnh chi được phép gửi sang ngân hàng, job nền sẽ gửi. */
  const approvePayout = async (id: string): Promise<RefundActionResult> => {
    try {
      const refund = await approveRefundPayout(id).unwrap()
      globalMessage.success(
        `Đã duyệt chi ${refund.refundCode}. Lệnh chi sẽ được gửi sang ngân hàng.`
      )
      return { ok: true, refund }
    } catch (error) {
      return failure(error)
    }
  }

  /** Kế toán từ chối chi: yêu cầu bị từ chối và khoản tiền đang giữ được nhả. */
  const rejectPayout = async (
    id: string,
    reason: string
  ): Promise<RefundActionResult> => {
    try {
      const refund = await rejectRefundPayout({ id, reason }).unwrap()
      globalMessage.success(
        `Đã từ chối chi ${refund.refundCode}, tiền đang giữ đã được nhả.`
      )
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
    approvePayout,
    rejectPayout,
    settle,
    refreshPayoutOrder,
    manualPayout,
    isConfirmingManualPayout: confirmingManual.isLoading,
    isApproving: approving.isLoading,
    isRejecting: rejecting.isLoading,
    isApprovingPayout: approvingPayout.isLoading,
    isRejectingPayout: rejectingPayout.isLoading,
    isSettling: settling.isLoading,
    isRefreshingPayout: refreshing.isLoading
  }
}
