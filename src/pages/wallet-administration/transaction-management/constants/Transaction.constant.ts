export const TransactionType = {
  WALLET_CREDIT: 'Nạp tiền ví',
  DEBIT: 'Rút tiền',
  CREDIT: 'Nạp tiền',
} as const;

export type TransactionKey = keyof typeof TransactionType;


export const StatusType={
    SUCCESS:'Thành công',
    ERROR:'Thất bại',
    WAITTING:'Chờ xử lý',
    REVIEW:'Review',
    PROCESSING:'Đang xử lý',
}
export type StatusKey = keyof typeof StatusType;
