export enum StatusKey {
    PENDING = 'PENDING',
    POSTED = 'POSTED',
    AUTHORIZED = 'AUTHORIZED',
    SETTLED = 'SETTLED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
}



export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.POSTED]: 'Đã thành công',
    [StatusKey.AUTHORIZED]: 'Đã phê duyệt',
    [StatusKey.SETTLED]: 'Đã quyết toán',
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
