/**
 * `POST /transactions/{transactionCode}/update-status` — chốt kết quả cuối cho
 * một giao dịch nạp / rút / chuyển **đang treo** (đã gửi sang ngân hàng nhưng
 * chưa có kết quả trong hệ thống).
 *
 * Khoá theo `transactionCode` vì đó là khoá nối giữa màn chi tiết giao dịch của
 * wallet-core và bảng lệnh của user-wallet — FE không cần biết giao dịch thuộc
 * loại nào. Lệnh rút đang chờ duyệt (`PENDING_APPROVAL`) **không** thuộc
 * endpoint này; xem `@type/withdrawalApproval.type`.
 */
export const StuckTransactionOutcome = {
  /** Ghi bút toán thật vào sổ cái, số dư các tài khoản liên quan thay đổi. */
  POSTED: 'POSTED',
  /** Chấm dứt bút toán và giải phóng khoản tiền đang bị giữ. */
  FAILED: 'FAILED'
} as const

export type StuckTransactionOutcome =
  (typeof StuckTransactionOutcome)[keyof typeof StuckTransactionOutcome]

export interface StuckTransactionOutcomeCopy {
  label: string
  /** Hậu quả thật của lựa chọn, nói trước khi người dùng bấm. */
  consequence: string
}

export const STUCK_TRANSACTION_OUTCOME: Record<
  StuckTransactionOutcome,
  StuckTransactionOutcomeCopy
> = {
  [StuckTransactionOutcome.POSTED]: {
    label: 'Thành công',
    consequence:
      'Ngân hàng đã xử lý xong. Hệ thống ghi bút toán thật vào sổ cái và số dư các tài khoản liên quan thay đổi theo.'
  },
  [StuckTransactionOutcome.FAILED]: {
    label: 'Thất bại',
    consequence:
      'Chấm dứt bút toán và giải phóng khoản tiền đang bị giữ về lại chủ tài khoản.'
  }
}

/** Ràng buộc theo `AdminUpdateTransactionRequest` của user-wallet. */
export const STUCK_UPDATE_NOTE_MIN_LENGTH = 10
export const STUCK_UPDATE_NOTE_MAX_LENGTH = 500
export const STUCK_UPDATE_CODE_MAX_LENGTH = 50

export interface StuckTransactionUpdateArg {
  transactionCode: string
  newStatus: StuckTransactionOutcome
  /** Mã chuẩn chi ngân hàng. Bắt buộc khi chốt POSTED. */
  authCode?: string
  /** Mã đối soát / ID settlement. Bắt buộc khi chốt POSTED. */
  settlementId?: string
  note: string
}

export interface StuckTransactionUpdateResult {
  transactionCode: string
  transactionType: string | null
  previousStatus: string | null
  newStatus: string
  authCode: string | null
  settlementId: string | null
  note: string | null
  updatedBy: string | null
  updatedAt: string | null
}
