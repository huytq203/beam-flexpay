export enum StatusKey {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    POSTED = 'POSTED',
    ARCHIVED = 'ARCHIVED',
}



export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.SUCCESS]: 'Thành công',
    [StatusKey.FAILED]: 'Thất bại',
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.CANCELLED]: 'Đã hủy',
    [StatusKey.POSTED]: 'Thành công',
    [StatusKey.ARCHIVED]: 'Đã lưu trữ',
} as const

export const STATUS_CONFIG={
   
    [StatusKey.FAILED]: {
        label: 'Thất bại',
        className: 'danger-status',
    },
    [StatusKey.PENDING]: {
        label: 'Chờ xử lý',
        className: 'warning-status',
    },
    [StatusKey.CANCELLED]: {
        label: 'Đã hủy',
        className: 'danger-status',
    },
    [StatusKey.POSTED]: {
        label: 'Thành công',
        className: 'success-status',
    },
    [StatusKey.ARCHIVED]: {
        label: 'Đã lưu trữ',
        className: 'info-status',
    },
}

export const TransactionType = {
    WALLET_CREDIT: 'Nạp tiền ví',
    WALLET_TRANSFER: 'Giao dịch ví',
    DEBIT: 'Rút tiền',
    
} as const;

export enum TransactionEnum{
    P2P_TRANSFER = 'P2P_TRANSFER',
    CASH_OUT = 'CASH_OUT',
    CASH_IN = 'CASH_IN',
}

export const TransactionLabel: Record<TransactionEnum, string> = {
    [TransactionEnum.CASH_OUT]: 'Rút tiền',
    [TransactionEnum.CASH_IN]: 'Nạp tiền',
    [TransactionEnum.P2P_TRANSFER]: 'Chuyển tiền nội bộ',
} as const;
export type TransactionKey = keyof typeof TransactionType;

export enum BankEnum{
    VCB='VCB',
}

export const BankLabel: Record<BankEnum, string> = {
    [BankEnum.VCB]: 'Vietcombank',
} as const;

export enum PaymentMethodEnum{
    WALLET_BALANCE='WALLET_BALANCE',
    BANK_TRANSFER='BANK_TRANSFER',
    CASH_OUT='CASH_OUT',
    CASH_IN='CASH_IN',
}

export const PaymentMethodLabel: Record<PaymentMethodEnum, string> = {
    [PaymentMethodEnum.WALLET_BALANCE]: 'Số dư ví',
    [PaymentMethodEnum.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
    [PaymentMethodEnum.CASH_OUT]: 'Rút tiền',
    [PaymentMethodEnum.CASH_IN]: 'Nạp tiền',
} as const;