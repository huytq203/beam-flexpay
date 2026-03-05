export const TransactionType = {
  CASH_IN: 'Nạp tiền',
  CASH_OUT: 'Rút tiền',
  P2P_TRANSFER: 'Chuyển tiền',
  MERCHANT_PAYMENT: 'Thanh toán',
  REVERSAL: 'Hoàn tiền',
} as const;

export type TransactionKey = keyof typeof TransactionType;

export enum PaymentMethodEnum {
  ATM = 'ATM',
  CC = 'CC',
  VA = 'VA',
  QR_CODE = 'QR_CODE',
  WALLET_BALANCE = 'WALLET_BALANCE',
  LINKED_ACCOUNT = 'LINKED_ACCOUNT',
}

export type PaymentMethodKey = keyof typeof PaymentMethodEnum;


export const PaymentMethod = {
  [PaymentMethodEnum.ATM]: 'Thẻ ATM',
  [PaymentMethodEnum.CC]: 'Thẻ tín dụng',
  [PaymentMethodEnum.VA]: 'Tài khoản ảo',
  [PaymentMethodEnum.QR_CODE]: 'QR Code',
  [PaymentMethodEnum.WALLET_BALANCE]: 'Tài khoản ví',
  [PaymentMethodEnum.LINKED_ACCOUNT]: 'Tài khoản liên kết',
}


  export enum StatusEnum {
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  ARCHIVED = 'ARCHIVED',
}

export const StatusType = {
  [StatusEnum.PENDING]: 'Chờ xử lý',
  [StatusEnum.POSTED]: 'Thành công',
  [StatusEnum.ARCHIVED]: 'Đã lưu trữ',
}
export type StatusKey = keyof typeof StatusType;

export const StatusConstants = {
  PENDING: 'PENDING',
  POSTED: 'POSTED',
  ARCHIVED: 'ARCHIVED',
} as const

export enum TransactionConstants {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  P2P_TRANSFER = 'P2P_TRANSFER',
  MERCHANT_PAYMENT = 'MERCHANT_PAYMENT',
  REVERSAL = 'REVERSAL',
}

export const Transaction_Title = {
  [TransactionConstants.CASH_IN]: 'Cash In',
  [TransactionConstants.CASH_OUT]: 'Cash Out',
  [TransactionConstants.P2P_TRANSFER]: 'P2P Transfer',
  [TransactionConstants.MERCHANT_PAYMENT]: 'Merchant Payment',
  [TransactionConstants.REVERSAL]: 'Reversal',
} as const

export const CounterpartyType = {
  USER: { label: 'User', color: 'violet' },
  MERCHANT: { label: 'Merchant', color: 'purple' },
  BANK: { label: 'Bank', color: 'yellow' },
  SYSTEM: { label: 'System', color: 'gray' },
} as const

export type CounterpartyTypeKey = keyof typeof CounterpartyType
