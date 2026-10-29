import type {
  EscrowConfigApprovalStatus,
  EscrowConfigSource,
  EscrowContributionForm,
  EscrowLedgerKind,
  EscrowOrderStatus,
  EscrowOverdueAction,
  EscrowPieceStatus,
  EscrowRequirementMode,
  EscrowReturnReason,
  EscrowReviewCycle,
  EscrowRisk,
  EscrowState
} from '../types/merchantEscrow.types'

// Nhãn lấy theo cột "Ý nghĩa" của spec FE-API-GAP-merchant-2026-10-22 §3.9–3.11.
// Chưa có hằng loại chứng từ (ESCROW_DOCUMENT_TYPE): chờ BA chốt ở Task 5.

export const ESCROW_STATE_LABEL: Record<EscrowState, string> = {
  NOT_CONFIGURED: 'Chưa cấu hình',
  SHORT: 'Thiếu',
  MET: 'Đủ',
  SURPLUS: 'Dư',
  UNKNOWN: 'Chưa đọc được số dư'
}

export const ESCROW_RISK_LABEL: Record<EscrowRisk, string> = {
  HIGH: 'Cao (dưới 30%)',
  MEDIUM: 'Trung bình (30% đến dưới 80%)',
  LOW: 'Thấp (từ 80%)'
}

export const ESCROW_ORDER_STATUS_LABEL: Record<EscrowOrderStatus, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  RETURNED: 'Đã trả lại người lập',
  APPROVING: 'Đã duyệt, đang ghi sổ',
  APPROVED: 'Đã ghi sổ',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Đã hủy'
}

export const ESCROW_RETURN_REASON_LABEL: Record<EscrowReturnReason, string> = {
  REQUIREMENT_REDUCED: 'Mức yêu cầu giảm',
  CONTRACT_TERMINATED: 'Chấm dứt hợp đồng',
  AGREEMENT_TO_END: 'Hai bên thỏa thuận chấm dứt ký quỹ',
  OTHER: 'Khác'
}

export const ESCROW_LEDGER_KIND_LABEL: Record<EscrowLedgerKind, string> = {
  DEPOSIT_TRANSFER: 'Nạp bằng chuyển khoản',
  DEPOSIT_SUB_REVENUE: 'Nạp từ doanh thu của Sub',
  WITHDRAWAL_SETOFF: 'Cấn trừ vào lệnh rút của Sub',
  RETURN: 'Hoàn trả ký quỹ cho Merchant',
  TERMINATION_DEDUCTION: 'Khấu trừ khi chấm dứt hợp tác',
  ADJUSTMENT: 'Điều chỉnh'
}

export const ESCROW_PIECE_STATUS_LABEL: Record<EscrowPieceStatus, string> = {
  RESERVING: 'Đang chờ giữ chỗ',
  RESERVED: 'Đã giữ chỗ, chờ thực hiện',
  SETTLING: 'Đang ghi có / chờ ngân hàng',
  DONE: 'Hoàn tất',
  TRANSFER_FAILED: 'Chuyển khoản lỗi, cần Kế toán xử lý',
  RELEASING: 'Đang trả về ký quỹ',
  RELEASED: 'Đã trả về ký quỹ',
  CANCELLED: 'Đã hủy'
}

/** Tối đa chứng từ đính kèm mỗi lệnh. */
export const ESCROW_MAX_DOCUMENTS = 5
/** Dung lượng tối đa mỗi chứng từ: 10 MiB. */
export const ESCROW_MAX_DOCUMENT_BYTES = 10_485_760
/** Độ dài tối đa của mã tham chiếu chuyển khoản. */
export const ESCROW_TRANSFER_REF_MAX = 50

/** Khóa `byForm` của bảng đóng góp (khác với `EscrowLedgerKind`). Thứ tự = thứ tự cột. */
export const ESCROW_CONTRIBUTION_FORM_LABEL: Record<
  EscrowContributionForm,
  string
> = {
  TRANSFER: 'Chuyển khoản',
  SUB_REVENUE: 'Từ doanh thu Sub',
  SETOFF: 'Cấn trừ lệnh rút'
}

export const ESCROW_CONFIG_APPROVAL_LABEL: Record<
  EscrowConfigApprovalStatus,
  string
> = {
  PENDING_APPROVAL: 'Đề xuất chờ duyệt',
  APPROVED: 'Đã áp dụng',
  REJECTED: 'Bị từ chối',
  CANCELLED: 'Người cấu hình đã huỷ'
}

export const ESCROW_CONFIG_SOURCE_LABEL: Record<EscrowConfigSource, string> = {
  MANUAL: 'Do người dùng lưu',
  REVIEW: 'Do job soát xét định kỳ đề xuất'
}

/** Cách xác định mức ký quỹ (spec §3.9, bảng giá trị enum). */
export const ESCROW_REQUIREMENT_MODE_LABEL: Record<
  EscrowRequirementMode,
  string
> = {
  FIXED: 'Số tiền cố định',
  AVERAGE_REVENUE: 'Theo doanh thu bình quân'
}

/** Chu kỳ job soát xét tự đề xuất lại mức theo doanh thu (chỉ khi AVERAGE_REVENUE). */
export const ESCROW_REVIEW_CYCLE_LABEL: Record<EscrowReviewCycle, string> = {
  MONTHLY: 'Hằng tháng',
  QUARTERLY: 'Hằng quý',
  NONE: 'Không soát xét tự động'
}

export const ESCROW_OVERDUE_ACTION_LABEL: Record<EscrowOverdueAction, string> =
  {
    WARN_ONLY: 'Chỉ cảnh báo',
    BLOCK_PAYMENTS: 'Chặn thanh toán'
  }
