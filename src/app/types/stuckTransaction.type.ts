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
      'Hủy bút toán và giải phóng khoản tiền đang bị giữ về số dư khả dụng của tài khoản ví.'
  }
}

/** Ràng buộc theo `AdminUpdateTransactionRequest` của user-wallet. */
export const STUCK_UPDATE_NOTE_MAX_LENGTH = 500
export const STUCK_UPDATE_CODE_MAX_LENGTH = 50
export const STUCK_RECEIPT_MAX_BYTES = 2 * 1024 * 1024

/** Chỉ còn dùng cho các hộp thoại Review; cập nhật giao dịch treo không gửi nữa. */
export interface BankConfirmation {
  outcome: StuckTransactionOutcome
  confirmationChannel: string
  confirmationReference: string
  confirmedAt: string
  bankReference?: string
  valueDate?: string
  bankBookedAt?: string
}

export interface StuckTransactionUpdateArg {
  transactionCode: string
  newStatus: StuckTransactionOutcome
  note: string
  /** Mã chuẩn chi ngân hàng, không bắt buộc. */
  authCode?: string
  /** Mã đối soát / ID settlement, không bắt buộc. */
  settlementId?: string
  /** Chỉ khi `POSTED`; BE trả 400 nếu gửi kèm `FAILED`. */
  bankReference?: string
  /** Lấy từ API upload biên lai. Chỉ khi `POSTED`. */
  receiptKey?: string
  /** Chỉ lệnh nạp + `FAILED`: sinh thêm bản ghi "Thất bại hoàn tiền". */
  refund?: boolean
  refundAuthCode?: string
  refundSettlementId?: string
  /** Chỉ khi `refund = true`. */
  refundBankReference?: string
}

/** `POST /transactions/{code}/receipt`: file chỉ gắn vào giao dịch khi update-status thành công. */
export interface StuckReceiptUploadArg {
  transactionCode: string
  file: File
}

export interface StuckReceiptUploadResult {
  receiptKey: string
  contentType: string | null
  sizeBytes: number | null
}

/** `GET /transactions/{code}/receipt`: `receiptUrl` vắng khi giao dịch chưa có biên lai. */
export interface StuckReceiptLink {
  receiptUrl: string | null
}

export interface StuckTransactionUpdateResult {
  transactionCode: string
  transactionType: string | null
  previousStatus: string | null
  newStatus: string
  requestId: string | null
  journalId: string | null
  transactionId: string | null
  authCode: string | null
  settlementId: string | null
  bankReference: string | null
  receiptKey: string | null
  note: string | null
  updatedBy: string | null
  updatedAt: string | null
  /** Mã `RF-…` khi có bản ghi hoàn tiền. */
  refundCode: string | null
  refundBankReference: string | null
  /** `FAILED_REFUND` khi sinh bản ghi hoàn; còn lại bằng `newStatus`. */
  displayStatus: string | null
}
