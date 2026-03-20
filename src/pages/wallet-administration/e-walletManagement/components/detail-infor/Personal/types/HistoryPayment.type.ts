export enum StatusKey {
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    POSTED = 'POSTED',
    ARCHIVED = 'ARCHIVED',
}



export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.CANCELLED]: 'Đã hủy',
    [StatusKey.POSTED]: 'Thành công',
    [StatusKey.ARCHIVED]: 'Đã lưu trữ',
} as const

export const STATUS_CONFIG = {

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

export enum TransactionEnum {
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

export enum BankEnum {
    VCB = 'VCB',
}

export const BankLabel: Record<BankEnum, string> = {
    [BankEnum.VCB]: 'Vietcombank',
} as const;

export enum PaymentMethodEnum {
    ATM = 'ATM',
    CC = 'CC',
    VA = 'VA',
    QR_CODE = 'QR_CODE',
    WALLET_BALANCE = 'WALLET_BALANCE',
    LINKED_ACCOUNT = 'LINKED_ACCOUNT',
}

export const PaymentMethodLabel: Record<PaymentMethodEnum, string> = {
    [PaymentMethodEnum.ATM]: 'Thẻ ATM',
    [PaymentMethodEnum.CC]: 'Thẻ tín dụng',
    [PaymentMethodEnum.VA]: 'Tài khoản ảo',
    [PaymentMethodEnum.QR_CODE]: 'QR Code',
    [PaymentMethodEnum.WALLET_BALANCE]: 'Tài khoản ví',
    [PaymentMethodEnum.LINKED_ACCOUNT]: 'Tài khoản liên kết'
} as const;


export enum SourceDomain {
  EWALLET = 'EWALLET',
  
} 

export const SourceDomainLabel: Record<SourceDomain, string> = {
  [SourceDomain.EWALLET]: 'Ví điện tử',

} as const;
