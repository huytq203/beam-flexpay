export const TransactionType = {
  CASH_IN: 'Nạp tiền',
  CASH_OUT: 'Rút tiền',
  P2P_TRANSFER: 'Chuyển tiền',
  MERCHANT_PAYMENT: 'Thanh toán',
  REVERSAL: 'Hoàn tiền'
} as const

export type TransactionKey = keyof typeof TransactionType

/**
 * Loại bút toán chi tiết của wallet-core được gộp vào một nhóm hiển thị.
 * `REFUND_BANK_PAYOUT` là journal chi hoàn ra ngân hàng của lệnh nạp thành công
 * (28/10): về nghiệp vụ vẫn là "Hoàn tiền", nên đi chung badge với `REVERSAL`
 * thay vì sinh thêm một loại mới trên màn hình.
 */
const TRANSACTION_TYPE_ALIASES: Record<string, TransactionKey> = {
  REFUND_BANK_PAYOUT: 'REVERSAL'
}

/** Mã loại → khoá hiển thị đã biết; `null` khi là loại FE chưa biết. */
export const toTransactionTypeKey = (
  type: string | null | undefined
): TransactionKey | null => {
  if (!type) return null
  if (type in TransactionType) return type as TransactionKey
  return TRANSACTION_TYPE_ALIASES[type] ?? null
}

/** Nhãn tiếng Việt; loại lạ giữ nguyên mã thô để người vận hành vẫn đối chiếu được. */
export const getTransactionTypeLabel = (
  type: string | null | undefined
): string => {
  const key = toTransactionTypeKey(type)
  return key ? TransactionType[key] : (type ?? '--')
}

export enum PaymentMethodEnum {
  ATM = 'ATM',
  CC = 'CC',
  VA = 'VA',
  QR_CODE = 'QR_CODE',
  WALLET_BALANCE = 'WALLET_BALANCE',
  LINKED_ACCOUNT = 'LINKED_ACCOUNT'
}

export type PaymentMethodKey = keyof typeof PaymentMethodEnum

export const PaymentMethod = {
  [PaymentMethodEnum.ATM]: 'Thẻ ATM',
  [PaymentMethodEnum.CC]: 'Thẻ tín dụng',
  [PaymentMethodEnum.VA]: 'Tài khoản ảo',
  [PaymentMethodEnum.QR_CODE]: 'QR Code',
  [PaymentMethodEnum.WALLET_BALANCE]: 'Tài khoản ví',
  [PaymentMethodEnum.LINKED_ACCOUNT]: 'Tài khoản liên kết'
}

export enum StatusEnum {
  PENDING = 'PENDING',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  /** Chỉ là `displayStatus` / giá trị lọc của lệnh rút: sổ cái lúc đó vẫn PENDING. */
  APPROVED = 'APPROVED',
  PAYING = 'PAYING',
  POSTED = 'POSTED',
  FAILED = 'FAILED',
  /**
   * Chỉ là `displayStatus` / giá trị lọc: sổ cái vẫn ghi `FAILED`. Màu, lọc nhanh và
   * logic nút luôn dựa trên `status`, không dựa trên giá trị này.
   */
  FAILED_REFUND = 'FAILED_REFUND'
}

/**
 * Bộ lọc `status` của BE hiểu theo `displayStatus`: dòng rút tiền còn dang dở mang trạng thái của lệnh rút
 * (chờ duyệt, đã duyệt, đang chi...), các dòng còn lại mang trạng thái sổ cái.
 */
export const StatusType: Record<StatusEnum, string> = {
  [StatusEnum.PENDING]: 'Chờ xử lý',
  [StatusEnum.PENDING_APPROVAL]: 'Chờ duyệt',
  [StatusEnum.APPROVED]: 'Đã duyệt chờ chi',
  [StatusEnum.PAYING]: 'Đang chi',
  [StatusEnum.POSTED]: 'Đã thành công',
  [StatusEnum.FAILED]: 'Thất bại',
  [StatusEnum.FAILED_REFUND]: 'Thất bại hoàn tiền'
}
export type StatusKey = keyof typeof StatusType

/**
 * Trạng thái trung gian của wallet-core (giao dịch treo). Chỉ để hiển thị badge, không
 * đưa vào `StatusType` vì đó là option lọc gửi BE.
 */
export const JournalProgressStatus = {
  AUTHORIZED: 'AUTHORIZED',
  POSTING: 'POSTING',
  CREDIT_PENDING: 'CREDIT_PENDING',
  PROCESSING: 'PROCESSING',
  CREDIT_FAILED: 'CREDIT_FAILED',
  RECONCILIATION_REQUIRED: 'RECONCILIATION_REQUIRED'
} as const
export type JournalProgressStatus =
  (typeof JournalProgressStatus)[keyof typeof JournalProgressStatus]

const WARNING_SHIMMER = 'rgba(252, 186, 3, 0.2)'
const DANGER_SHIMMER = 'rgba(255, 86, 59, 0.2)'

export const CONFIG_STATUS: Record<
  StatusEnum | JournalProgressStatus,
  { label: string; className: string; shimmerColor: string }
> = {
  [StatusEnum.PENDING]: {
    label: 'Chờ xử lý',
    className: 'warning-status',
    shimmerColor: 'rgba(252, 186, 3, 0.2)'
  },
  [StatusEnum.PENDING_APPROVAL]: {
    label: 'Chờ duyệt',
    className: 'warning-status',
    shimmerColor: 'rgba(252, 186, 3, 0.2)'
  },
  [StatusEnum.APPROVED]: {
    label: 'Đã duyệt chờ chi',
    className: 'warning-status',
    shimmerColor: 'rgba(252, 186, 3, 0.2)'
  },
  [StatusEnum.PAYING]: {
    label: 'Đang chi',
    className: 'warning-status',
    shimmerColor: 'rgba(252, 186, 3, 0.2)'
  },
  [StatusEnum.POSTED]: {
    label: 'Đã thành công',
    className: 'success-status',
    shimmerColor: 'rgba(0, 229, 160, 0.2)'
  },

  [StatusEnum.FAILED]: {
    label: 'Thất bại',
    className: 'danger-status',
    shimmerColor: 'rgba(255, 86, 59, 0.2)'
  },
  [StatusEnum.FAILED_REFUND]: {
    label: 'Thất bại hoàn tiền',
    className: 'danger-status',
    shimmerColor: 'rgba(255, 86, 59, 0.2)'
  },
  [JournalProgressStatus.AUTHORIZED]: {
    label: 'Đã cấp phép',
    className: 'warning-status',
    shimmerColor: WARNING_SHIMMER
  },
  [JournalProgressStatus.POSTING]: {
    label: 'Đang ghi sổ',
    className: 'warning-status',
    shimmerColor: WARNING_SHIMMER
  },
  [JournalProgressStatus.CREDIT_PENDING]: {
    label: 'Chờ ghi có',
    className: 'warning-status',
    shimmerColor: WARNING_SHIMMER
  },
  [JournalProgressStatus.PROCESSING]: {
    label: 'Đang xử lý',
    className: 'warning-status',
    shimmerColor: WARNING_SHIMMER
  },
  [JournalProgressStatus.RECONCILIATION_REQUIRED]: {
    label: 'Cần đối soát',
    className: 'warning-status',
    shimmerColor: WARNING_SHIMMER
  },
  [JournalProgressStatus.CREDIT_FAILED]: {
    label: 'Ghi có thất bại',
    className: 'danger-status',
    shimmerColor: DANGER_SHIMMER
  }
}

export const StatusConstants = {
  PENDING: 'PENDING',
  POSTED: 'POSTED',
  AUTHORIZED: 'AUTHORIZED'
} as const

export enum TransactionConstants {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  P2P_TRANSFER = 'P2P_TRANSFER',
  MERCHANT_PAYMENT = 'MERCHANT_PAYMENT',
  REVERSAL = 'REVERSAL'
}

export const Transaction_Title = {
  [TransactionConstants.CASH_IN]: 'Cash In',
  [TransactionConstants.CASH_OUT]: 'Cash Out',
  [TransactionConstants.P2P_TRANSFER]: 'P2P Transfer',
  [TransactionConstants.MERCHANT_PAYMENT]: 'Merchant Payment',
  [TransactionConstants.REVERSAL]: 'Reversal'
} as const

export const CounterpartyType = {
  USER: { label: 'User', color: 'violet' },
  MERCHANT: { label: 'Merchant', color: 'purple' },
  BANK: { label: 'Bank', color: 'yellow' },
  SYSTEM: { label: 'System', color: 'gray' }
} as const

export type CounterpartyTypeKey = keyof typeof CounterpartyType
export enum BankEnum {
  VCB = 'VCB',
  MB = 'MB',
  VPB = 'VPB'
}

export const BankLabel: Record<BankEnum, string> = {
  [BankEnum.VCB]: 'VietcomBank',
  [BankEnum.MB]: 'MB Bank',
  [BankEnum.VPB]: 'VPBank'
} as const

export enum SourceDomain {
  EWALLET = 'EWALLET'
}

export const SourceDomainLabel: Record<SourceDomain, string> = {
  [SourceDomain.EWALLET]: 'Ví điện tử'
} as const
