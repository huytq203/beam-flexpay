import { PERMISSION, useAccess } from '@/app/permissions'
import { useAppSelector } from '@hooks/hook'

export interface TransactionPermissions {
  /** Hoàn tiền, cập nhật treo, kiểm tra lại trạng thái: BE chỉ mở cho `EWALLET:FULL`. */
  canFull: boolean
  /** Đánh dấu, duyệt, từ chối Review: `EWALLET:FULL` hoặc `TRANSACTION:REVIEW`. */
  canReview: boolean
  username: string
}

/**
 * Không dùng `can('review')` của registry: `actions.full` của màn này là
 * `TRANSACTION:FULL`, quyền mà BE không chấp nhận cho API Review.
 */
export const useTransactionPermissions = (): TransactionPermissions => {
  const { has, hasAny } = useAccess()
  const username = useAppSelector((state) => state.auth.profile.username)
  return {
    canFull: has(PERMISSION.EWALLET_FULL),
    canReview: hasAny([PERMISSION.EWALLET_FULL, PERMISSION.TRANSACTION_REVIEW]),
    username: username ?? ''
  }
}
