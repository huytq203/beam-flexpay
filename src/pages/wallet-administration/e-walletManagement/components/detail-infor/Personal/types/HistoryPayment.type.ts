export enum StatusKey {

    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
}



export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.SUCCESS]: 'Thành công',
    [StatusKey.FAILED]: 'Thất bại',
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.CANCELLED]: 'Đã hủy',
} as const


export const TransactionType = {
    WALLET_CREDIT: 'Nạp tiền ví',
    WALLET_TRANSFER: 'Giao dịch ví',
    DEBIT: 'Rút tiền',
} as const;

export type TransactionKey = keyof typeof TransactionType;
