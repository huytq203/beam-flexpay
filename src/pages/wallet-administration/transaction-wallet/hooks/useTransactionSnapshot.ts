import { useEffect } from 'react'
import { useRefreshTransactionMutation } from '@services/apiTransactionSnapshot'
import { getRefundErrorText } from '@pages/transaction-management/refund-management/utils/refund.utils'

/**
 * Khoá cache chung theo mã giao dịch: hộp thoại và nút Cập nhật treo cùng đọc một
 * snapshot mà không phải truyền qua props hay copy vào state.
 */
export const snapshotCacheKey = (transactionCode: string): string =>
  `transaction-snapshot:${transactionCode}`

export const useTransactionSnapshot = (transactionCode: string) => {
  const [refresh, refreshState] = useRefreshTransactionMutation({
    fixedCacheKey: snapshotCacheKey(transactionCode)
  })

  return {
    snapshot: refreshState.data,
    isRefreshing: refreshState.isLoading,
    refreshError: refreshState.error
      ? getRefundErrorText(refreshState.error)
      : null,
    refresh: () => refresh(transactionCode)
  }
}

/**
 * Gọi một lần ở màn chi tiết: xoá snapshot còn lại trong cache từ lần xem trước, để
 * quay lại màn không hiện dữ liệu cũ. Không đặt trong `useTransactionSnapshot` vì
 * nhiều component dùng chung khoá và mount/unmount lệch nhau.
 */
export const useResetTransactionSnapshot = (
  transactionCode: string | undefined
): void => {
  const code = transactionCode ?? ''
  const [, refreshState] = useRefreshTransactionMutation({
    fixedCacheKey: snapshotCacheKey(code)
  })
  const { reset } = refreshState

  useEffect(() => {
    if (!code) return
    reset()
  }, [code, reset])
}
