import { globalMessage } from '@hooks/useMessage'
import {
  useApproveTransactionReviewMutation,
  useMarkTransactionReviewMutation,
  useRefreshTransactionMutation,
  useRejectTransactionReviewMutation,
  type ApproveReviewArg,
  type RejectReviewArg
} from '@services/apiTransactionReview'
import { getRefundErrorText } from '@pages/transaction-management/refund-management/utils/refund.utils'
import { ReviewRejectOption } from '@/app/schemas/transaction-review.schema'
import { markCacheKey, snapshotCacheKey } from './useTransactionSnapshot'

export type ReviewActionResult = { ok: true } | { ok: false; message: string }

const CONFLICT = 409

const isConflict = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === CONFLICT

/**
 * Lỗi trả về cho hộp thoại tự hiển thị `detail`. 409 nghĩa là trạng thái lệnh vừa bị
 * đổi (người khác đang xử lý, đã chốt...) nên tự kiểm tra lại để panel hiện đúng nút.
 */
export const useReviewActions = (
  transactionCode: string,
  canRefresh: boolean
) => {
  const [markReview, marking] = useMarkTransactionReviewMutation({
    fixedCacheKey: markCacheKey(transactionCode)
  })
  const [approveReview, approving] = useApproveTransactionReviewMutation()
  const [rejectReview, rejecting] = useRejectTransactionReviewMutation()
  const [refresh] = useRefreshTransactionMutation({
    fixedCacheKey: snapshotCacheKey(transactionCode)
  })

  const fail = async (error: unknown): Promise<ReviewActionResult> => {
    if (isConflict(error) && canRefresh) {
      await refresh(transactionCode)
    }
    return { ok: false, message: getRefundErrorText(error) }
  }

  const mark = async (reason: string): Promise<ReviewActionResult> => {
    try {
      await markReview({ transactionCode, reason }).unwrap()
      globalMessage.success(`Đã đánh dấu Review ${transactionCode}`)
      if (canRefresh) await refresh(transactionCode)
      return { ok: true }
    } catch (error) {
      return fail(error)
    }
  }

  const approve = async (
    arg: Omit<ApproveReviewArg, 'transactionCode'>
  ): Promise<ReviewActionResult> => {
    try {
      await approveReview({ transactionCode, ...arg }).unwrap()
      globalMessage.success('Đã duyệt, giao dịch được ghi có vào ví.')
      return { ok: true }
    } catch (error) {
      return fail(error)
    }
  }

  const reject = async (
    arg: Omit<RejectReviewArg, 'transactionCode'>
  ): Promise<ReviewActionResult> => {
    try {
      const result = await rejectReview({ transactionCode, ...arg }).unwrap()
      globalMessage.success(
        arg.option === ReviewRejectOption.REFUND && result.refundCode
          ? `Đã hủy giao dịch, sinh bản ghi Thất bại hoàn tiền ${result.refundCode}.`
          : 'Đã hủy giao dịch.'
      )
      return { ok: true }
    } catch (error) {
      return fail(error)
    }
  }

  return {
    mark,
    approve,
    reject,
    isMarking: marking.isLoading,
    isApproving: approving.isLoading,
    isRejecting: rejecting.isLoading
  }
}
