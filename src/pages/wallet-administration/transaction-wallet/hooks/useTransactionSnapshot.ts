import { useEffect } from 'react'
import {
  useMarkTransactionReviewMutation,
  useRefreshTransactionMutation
} from '@services/apiTransactionReview'
import { getRefundErrorText } from '@pages/transaction-management/refund-management/utils/refund.utils'

/**
 * Khoá cache chung theo mã giao dịch: panel, hộp thoại và nút Cập nhật treo cùng đọc
 * một snapshot / người đánh dấu mà không phải truyền qua props hay copy vào state.
 */
export const snapshotCacheKey = (transactionCode: string): string =>
  `transaction-snapshot:${transactionCode}`
export const markCacheKey = (transactionCode: string): string =>
  `transaction-review-mark:${transactionCode}`

export const useTransactionSnapshot = (transactionCode: string) => {
  const [refresh, refreshState] = useRefreshTransactionMutation({
    fixedCacheKey: snapshotCacheKey(transactionCode)
  })
  const [, markState] = useMarkTransactionReviewMutation({
    fixedCacheKey: markCacheKey(transactionCode)
  })

  return {
    snapshot: refreshState.data,
    isRefreshing: refreshState.isLoading,
    refreshError: refreshState.error
      ? getRefundErrorText(refreshState.error)
      : null,
    /** Chỉ biết khi chính phiên này đánh dấu; BE không trả lại trong snapshot. */
    markedBy: markState.data?.updatedBy,
    hasMarked: markState.data !== undefined,
    refresh: () => refresh(transactionCode)
  }
}

/**
 * Gọi một lần ở màn chi tiết: xoá snapshot/người đánh dấu còn lại trong cache từ lần xem
 * trước, để quay lại màn không hiện dữ liệu cũ. Không đặt trong `useTransactionSnapshot`
 * vì nhiều component dùng chung khoá và mount/unmount lệch nhau.
 */
export const useResetTransactionSnapshot = (
  transactionCode: string | undefined
): void => {
  const code = transactionCode ?? ''
  const [, refreshState] = useRefreshTransactionMutation({
    fixedCacheKey: snapshotCacheKey(code)
  })
  const [, markState] = useMarkTransactionReviewMutation({
    fixedCacheKey: markCacheKey(code)
  })
  const { reset: resetRefresh } = refreshState
  const { reset: resetMark } = markState

  useEffect(() => {
    if (!code) return
    resetRefresh()
    resetMark()
  }, [code, resetRefresh, resetMark])
}
