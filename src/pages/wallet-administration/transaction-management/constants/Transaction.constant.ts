export const TransactionType = {
  WALLET_CREDIT: 'Nạp tiền ví',
  WALLET_TRANSFER: 'Giao dịch ví',
  DEBIT: 'Rút tiền',
  CREDIT: 'Nạp tiền',
} as const;

export type TransactionKey = keyof typeof TransactionType;

export enum StatusEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WAITTING = 'WAITTING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW'

}

export const StatusType = {
  [StatusEnum.SUCCESS]: 'Thành công',
  [StatusEnum.ERROR]: 'Thất bại',
  [StatusEnum.WAITTING]: 'Chờ xử lý',
  [StatusEnum.REVIEW]: 'Review',
  [StatusEnum.PROCESSING]: 'Đang xử lý',

}
export type StatusKey = keyof typeof StatusType;

export const StatusConstants = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  WAITTING: 'WAITTING',
  REVIEW: 'REVIEW',
  PROCESSING: 'PROCESSING',
} as const

export const TransactionConstants = {
  WALLET_CREDIT: 'WALLET_CREDIT',
  WALLET_TRANSFER: 'WALLET_TRANSFER',
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT',
} as const