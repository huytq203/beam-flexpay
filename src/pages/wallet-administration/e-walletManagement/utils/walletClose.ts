import type { WalletClosureCheck } from '../types/WalletClose.type'

export type WalletCloseView = 'blocked' | 'retry' | 'form'

/**
 * - `form`: đủ điều kiện, cần nhập lý do.
 * - `retry`: ví đã hủy nhưng chưa khóa xong đăng nhập, bật nút xác nhận, không cần lý do.
 * - `blocked`: bị chặn, nút xác nhận disabled.
 */
export const getWalletCloseView = (
  check: WalletClosureCheck
): WalletCloseView => {
  if (check.eligible) return 'form'
  if (check.retryable) return 'retry'
  return 'blocked'
}

interface ApiErrorLike {
  status?: number | string
  data?: { message?: string; detail?: string; status?: number | string }
}

const asApiError = (error: unknown): ApiErrorLike =>
  typeof error === 'object' && error !== null ? (error as ApiErrorLike) : {}

/** `detail` là câu tiếng Việt BE trả để hiển thị thẳng. */
export const getCloseErrorDetail = (error: unknown): string | undefined =>
  asApiError(error).data?.detail || undefined

/** 504 `WALLET_CLOSE_RESULT_UNKNOWN` (4012): chưa biết ví đã hủy hay chưa. */
export const isCloseResultUnknown = (error: unknown): boolean => {
  const { status, data } = asApiError(error)
  return (
    data?.message === 'WALLET_CLOSE_RESULT_UNKNOWN' ||
    Number(data?.status) === 4012 ||
    status === 504
  )
}

/** 409 biến động số dư / giao dịch treo / sai trạng thái: phải vẽ lại trạng thái chặn. */
export const isCloseConflict = (error: unknown): boolean =>
  asApiError(error).status === 409
