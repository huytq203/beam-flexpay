export enum StatusKey {
    PENDING = 'PENDING',
    POSTED = 'POSTED',
    AUTHORIZED = 'AUTHORIZED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
}



export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.POSTED]: 'Đã thành công',
    [StatusKey.AUTHORIZED]: 'Đã phê duyệt',
    [StatusKey.CANCELLED]: 'Đã hủy',
    [StatusKey.FAILED]: 'Thất bại',
} as const


export const TransactionType = {
    WALLET_CREDIT: 'Nạp tiền ví',
    WALLET_TRANSFER: 'Giao dịch ví',
    DEBIT: 'Rút tiền',
    CREDIT: 'Nạp tiền',
} as const;

export type TransactionKey = keyof typeof TransactionType;
