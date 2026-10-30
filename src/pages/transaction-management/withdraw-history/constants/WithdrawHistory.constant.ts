export enum StatusKey {
    PENDING = 'PENDING',
    POSTED = 'POSTED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
}



export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.POSTED]: 'Đã thành công',
    [StatusKey.CANCELLED]: 'Đã hủy',
    [StatusKey.FAILED]: 'Thất bại',
} as const

export const STATUS_CONFIG = {

    [StatusKey.PENDING]: {
        label: 'Chờ xử lý',
        className: 'warning-status',
        shimmerColor: 'rgba(252, 186, 3, 0.2)',
    },
    [StatusKey.CANCELLED]: {
        label: 'Đã hủy',
        className: 'danger-status',
        shimmerColor: 'rgba(255, 86, 59, 0.2)',
    },
    [StatusKey.POSTED]: {
        label: 'Đã thành công',
        className: 'success-status',
        shimmerColor: 'rgba(0, 229, 160, 0.2)',
    },
    [StatusKey.FAILED]: {
        label: 'Thất bại',
        className: 'danger-status',
        shimmerColor: 'rgba(255, 86, 59, 0.2)',
    },
}
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

export enum SourceDomain {
    EWALLET = 'EWALLET',

}

export const SourceDomainLabel: Record<SourceDomain, string> = {
    [SourceDomain.EWALLET]: 'Ví điện tử',

} as const;

/**
 * Hai loại lệnh rút mà lưới này nhận. Lọc rỗng là cả hai — màn luôn ghim
 * `transactionType` về nhóm rút, không bao giờ mở sang loại giao dịch khác.
 * `REFUND_BANK_PAYOUT` là journal của lệnh chi hoàn nạp ra ngân hàng (wallet-core
 * tạo từ lúc tạo lệnh chi), nên key phải đúng mã đó — mã `REFUND` không khớp journal nào.
 */
export const WithdrawTransactionType = {
    CASH_OUT: 'Rút tiền',
    REFUND_BANK_PAYOUT: 'Hoàn tiền'
} as const

export type WithdrawTransactionTypeKey = keyof typeof WithdrawTransactionType

/**
 * Giá trị mặc định khi người dùng chưa chọn loại lệnh rút cụ thể: cả hai loại, gửi
 * dạng danh sách phân cách dấu phẩy (wallet-core lọc IN) cho cả lưới lẫn file xuất.
 */
export const DEFAULT_WITHDRAW_TRANSACTION_TYPE = (
    Object.keys(WithdrawTransactionType) as WithdrawTransactionTypeKey[]
).join(',')

