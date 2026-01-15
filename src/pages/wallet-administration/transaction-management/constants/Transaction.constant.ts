export const TransactionType = {
  WALLET_CREDIT: 'Nạp tiền ví',
  DEBIT: 'Rút tiền',
  CREDIT: 'Nạp tiền',
} as const;

export type TransactionKey = keyof typeof TransactionType;


export const StatusType = {
  SUCCESS: 'Thành công',
  ERROR: 'Thất bại',
  WAITTING: 'Chờ xử lý',
  REVIEW: 'Review',
  PROCESSING: 'Đang xử lý',

}
export type StatusKey = keyof typeof StatusType;

export const StatusConstants={
  SUCCESS:'SUCCESS',
  ERROR:'ERROR',
  WAITTING:'WAITTING',
  REVIEW:'REVIEW',
  PROCESSING:'PROCESSING',
}as const 

export const TransactionConstants={
  WALLET_CREDIT:'WALLET_CREDIT',
  DEBIT:'DEBIT',
  CREDIT:'CREDIT',
}as const