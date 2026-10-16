export const TransactionType = {
  CASH_IN: 'Nạp tiền',
  CASH_OUT: 'Rút tiền',
  P2P_TRANSFER: 'Chuyển tiền',
  MERCHANT_PAYMENT: 'Thanh toán',
  REVERSAL: 'Hoàn tiền'
} as const

export type TransactionKey = keyof typeof TransactionType

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
  POSTED = 'POSTED',
  FAILED = 'FAILED',
  /**
   * Chỉ là `displayStatus` / giá trị lọc: sổ cái vẫn ghi `FAILED`. Màu, lọc nhanh và
   * logic nút luôn dựa trên `status`, không dựa trên giá trị này.
   */
  FAILED_REFUND = 'FAILED_REFUND'
}

export const StatusType: Record<StatusEnum, string> = {
  [StatusEnum.PENDING]: 'Chờ xử lý',
  [StatusEnum.PENDING_APPROVAL]: 'Chờ phê duyệt',
  [StatusEnum.POSTED]: 'Đã thành công',
  [StatusEnum.FAILED]: 'Thất bại',
  [StatusEnum.FAILED_REFUND]: 'Thất bại hoàn tiền'
}
export type StatusKey = keyof typeof StatusType

export const CONFIG_STATUS: Record<
  StatusEnum,
  { label: string; className: string; shimmerColor: string }
> = {
  [StatusEnum.PENDING]: {
    label: 'Chờ xử lý',
    className: 'warning-status',
    shimmerColor: 'rgba(252, 186, 3, 0.2)'
  },
  [StatusEnum.PENDING_APPROVAL]: {
    label: 'Chờ phê duyệt',
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
