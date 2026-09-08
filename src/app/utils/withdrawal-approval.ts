import {
  WITHDRAWAL_STATUS_PRESENTATION,
  WithdrawalStatus,
  type WithdrawalStatusPresentation
} from '@type/withdrawalApproval.type'

const KNOWN_STATUSES = new Set<string>(Object.values(WithdrawalStatus))

/** BE có thể thêm trạng thái mới trước FE — narrow trước khi tra bảng nhãn. */
export const isWithdrawalStatus = (
  status: string | null | undefined
): status is WithdrawalStatus =>
  typeof status === 'string' && KNOWN_STATUSES.has(status)

export const getWithdrawalStatusPresentation = (
  status: string | null | undefined
): WithdrawalStatusPresentation | null =>
  isWithdrawalStatus(status) ? WITHDRAWAL_STATUS_PRESENTATION[status] : null

export const isWithdrawalPendingApproval = (
  status: string | null | undefined
): boolean => status === WithdrawalStatus.PENDING_APPROVAL

/**
 * Lệnh đã duyệt nhưng tiền chưa ra khỏi ngân hàng. Job nền của user-wallet quét
 * mỗi 30 giây, nên đây là khoảng FE cần theo dõi tiếp thay vì coi là đã xong.
 */
export const isWithdrawalSettling = (
  status: string | null | undefined
): boolean =>
  status === WithdrawalStatus.APPROVED || status === WithdrawalStatus.PAYING

export type WithdrawalDecision = 'approve' | 'reject'

/**
 * Bộ bắt lỗi chung của user-wallet nuốt mất câu mô tả cụ thể: mọi nguyên nhân
 * đều trả về `BUSINESS_ERROR` / "Lỗi nghiệp vụ". Vì vậy sau khi lệnh hỏng ta đọc
 * lại trạng thái thật và diễn giải từ đó, thay vì đoán từ response.
 */
export const getWithdrawalDecisionFailureMessage = (
  freshStatus: string | null | undefined,
  decision: WithdrawalDecision
): string => {
  if (isWithdrawalSettling(freshStatus) || freshStatus === WithdrawalStatus.POSTED) {
    return 'Lệnh rút đã được người khác duyệt. Màn hình đã cập nhật trạng thái mới nhất.'
  }

  if (freshStatus === WithdrawalStatus.FAILED) {
    return 'Lệnh rút đã bị người khác từ chối. Màn hình đã cập nhật trạng thái mới nhất.'
  }

  if (freshStatus === WithdrawalStatus.RECONCILIATION_REQUIRED) {
    return 'Lệnh rút đã chuyển sang chờ đối soát, không còn duyệt hay từ chối được.'
  }

  if (isWithdrawalPendingApproval(freshStatus)) {
    return decision === 'approve'
      ? 'Không duyệt được lệnh rút. Lệnh vẫn đang chờ duyệt — vui lòng thử lại.'
      : 'Không từ chối được lệnh rút. Tiền của khách vẫn bị khoá nguyên trạng — vui lòng thử lại.'
  }

  return 'Không thực hiện được thao tác. Vui lòng tải lại chi tiết giao dịch và thử lại.'
}
