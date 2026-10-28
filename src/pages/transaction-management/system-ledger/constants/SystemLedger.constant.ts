export const DirectionConstants = {
  CREDIT: 'CREDIT',
  DEBIT: 'DEBIT'
} as const

export type DirectionKey = keyof typeof DirectionConstants

/**
 * Nhãn kế toán, không phải mã kỹ thuật. File CSV ghi "Nợ" / "Có" vì đưa cho kế
 * toán đọc — màn hình phải nói cùng một thứ tiếng với file.
 */
export const DirectionLabel: Record<DirectionKey, string> = {
  CREDIT: 'Có (CREDIT)',
  DEBIT: 'Nợ (DEBIT)'
}

/** Nhãn ngắn dùng trong ô bảng, không kèm mã. */
export const DirectionShortLabel: Record<DirectionKey, string> = {
  CREDIT: 'Có',
  DEBIT: 'Nợ'
}

export const FeeBearerLabel = {
  SENDER: 'Bên gửi',
  RECEIVER: 'Bên nhận',
  BOTH: 'Hai bên'
} as const

export const OwnerTypeConstants = {
  USER: 'USER',
  MERCHANT: 'MERCHANT',
  SYSTEM: 'SYSTEM'
} as const

export type OwnerTypeKey = keyof typeof OwnerTypeConstants

/**
 * Từ vựng `transactionType` của dòng sổ cái. wallet-core đã bỏ `transaction.type`
 * và chuyển sang trường này ở cấp bút toán, dùng chung bộ mã với màn Quản lý
 * giao dịch — nhãn phải khớp `TransactionType` bên đó để hai màn gọi cùng một
 * loại giao dịch bằng cùng một tên.
 */
export const LedgerTransactionType = {
  CASH_IN: 'Nạp tiền',
  CASH_OUT: 'Rút tiền',
  P2P_TRANSFER: 'Chuyển tiền'
} as const

export type LedgerTransactionTypeKey = keyof typeof LedgerTransactionType

/**
 * Nhãn chỉ để HIỂN THỊ, rộng hơn `LedgerTransactionType` (vốn còn làm lựa chọn
 * của ô lọc). Bút toán hoàn tiền — gồm `REFUND_BANK_PAYOUT`, journal chi hoàn ra
 * ngân hàng của lệnh nạp thành công (28/10) — thuộc nhóm `REVERSAL` "Hoàn tiền",
 * khớp nhãn của màn Quản lý giao dịch.
 */
const LEDGER_TRANSACTION_TYPE_DISPLAY: Record<string, string> = {
  ...LedgerTransactionType,
  REVERSAL: 'Hoàn tiền',
  REFUND_BANK_PAYOUT: 'Hoàn tiền'
}

/** Nhãn tiếng Việt của loại giao dịch; loại lạ giữ mã thô, thiếu thì `--`. */
export const getLedgerTransactionTypeLabel = (
  type: string | null | undefined
): string => (type ? (LEDGER_TRANSACTION_TYPE_DISPLAY[type] ?? type) : '--')

export enum StatusConstants {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED'
}

export type StatusKey = keyof typeof StatusConstants

export const StatusLabel: Record<string, string> = {
  SUCCESS: 'Thành công',
  ERROR: 'Lỗi',
  WAITING: 'Đang chờ',
  ACTIVE: 'Hoạt động',
  LOCKED: 'Khóa'
}

export const CONFIG_STATUS: Record<
  StatusConstants,
  { label: string; className: string; shimmerColor: string }
> = {
  [StatusConstants.SUCCESS]: {
    label: 'Thành công',
    className: 'success-status',
    shimmerColor: 'rgba(0, 229, 160, 0.2)'
  },
  [StatusConstants.ERROR]: {
    label: 'Lỗi',
    className: 'error-status',
    shimmerColor: 'rgba(255, 86, 59, 0.2)'
  },
  [StatusConstants.WAITING]: {
    label: 'Đang chờ',
    className: 'warning-status',
    shimmerColor: 'rgba(0, 229, 160, 0.2)'
  },
  [StatusConstants.ACTIVE]: {
    label: 'Hoạt động',
    className: 'success-status',
    shimmerColor: 'rgba(0, 229, 160, 0.2)'
  },
  [StatusConstants.LOCKED]: {
    label: 'Khóa',
    className: 'error-status',
    shimmerColor: 'rgba(255, 86, 59, 0.2)'
  }
}

export const GLCodeLabels: Record<string, string> = {
  REV_USER_FEE: 'Doanh thu phí người dùng',
  USER_WALLET_VND: 'Ví người dùng',
  SYS_BANK_SETTLEMENT_VND: 'Tài khoản thanh toán ngân hàng',
  SYSTEM: 'Hệ thống'
}

export const OwnerTypeLabels: Record<string, string> = {
  SYSTEM: 'Hệ thống',
  USER: 'Người dùng',
  MERCHANT: 'Merchant'
}

/**
 * Dòng sổ cái chỉ sinh ra khi bút toán đã hạch toán thành công — đúng theo mô
 * hình kế toán, không phải thiếu dữ liệu. Nói trước để người trực không báo là
 * mất dữ liệu khi không thấy giao dịch đang chờ hoặc đã hỏng.
 */

/**
 * Vai trò của dòng trong bút toán. wallet-core không trả vai trò nên suy từ chủ tài
 * khoản + chiều ghi: ví người dùng/merchant bị Nợ là người gửi, được Có là người nhận;
 * tài khoản doanh thu là phí, ghi rõ bên chịu. Các dòng còn lại (ví dụ tài khoản thanh
 * toán ngân hàng) tính là bên nhận. `feeOrder` là thứ tự ghi của dòng phí trong bút
 * toán, dùng khi hai bên chịu phí bằng nhau nên số tiền không phân biệt được.
 */
export const getLedgerEntryRole = (entry: {
  direction: string
  amount?: number
  feeBearer?: string
  senderFeeAmount?: number
  receiverFeeAmount?: number
  feeOrder?: number
  account?: { ownerType?: string; glCode?: string }
}): string => {
  if (entry.account?.glCode?.startsWith('REV_')) return getFeeRole(entry)
  const isSenderSide =
    entry.direction === DirectionConstants.DEBIT &&
    entry.account?.ownerType !== 'SYSTEM'
  return isSenderSide ? 'Người gửi' : 'Người nhận'
}

/** BE để trống `feeBearer` khi người gửi chịu phí. */
const getFeeRole = (entry: {
  amount?: number
  feeBearer?: string
  senderFeeAmount?: number
  receiverFeeAmount?: number
  feeOrder?: number
}): string => {
  if (entry.feeBearer === 'RECEIVER') return 'Phí (bên nhận)'
  if (entry.feeBearer !== 'BOTH') return 'Phí (bên gửi)'
  const { amount, senderFeeAmount, receiverFeeAmount } = entry
  if (senderFeeAmount === receiverFeeAmount) {
    if (entry.feeOrder === 0) return 'Phí (bên gửi)'
    return entry.feeOrder === 1 ? 'Phí (bên nhận)' : 'Phí'
  }
  if (amount === senderFeeAmount) return 'Phí (bên gửi)'
  if (amount === receiverFeeAmount) return 'Phí (bên nhận)'
  return 'Phí'
}
