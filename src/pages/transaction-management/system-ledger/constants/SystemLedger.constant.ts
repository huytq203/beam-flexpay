export const DirectionConstants = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT'
} as const

export type DirectionKey = keyof typeof DirectionConstants

/**
 * Nhãn kế toán, không phải mã kỹ thuật. File CSV ghi "Nợ" / "Có" vì đưa cho kế
 * toán đọc — màn hình phải nói cùng một thứ tiếng với file.
 */
export const DirectionLabel: Record<DirectionKey, string> = {
    CREDIT: 'Có (CREDIT)',
    DEBIT: 'Nợ (DEBIT)'
}

/** Nhãn ngắn dùng trong ô bảng, không kèm mã. */
export const DirectionShortLabel: Record<DirectionKey, string> = {
    CREDIT: 'Có',
    DEBIT: 'Nợ'
}

export const OwnerTypeConstants = {
    USER: 'USER',
    MERCHANT: 'MERCHANT',
    SYSTEM: 'SYSTEM'
} as const

export type OwnerTypeKey = keyof typeof OwnerTypeConstants

/**
 * Từ vựng `transactionType` RIÊNG của bảng `transactions` mà sổ cái móc vào.
 * KHÁC hẳn bộ mã của màn Quản lý giao dịch (`CASH_IN`, `CASH_OUT`,
 * `P2P_TRANSFER`…) — dùng nhầm bộ mã cho ra bảng rỗng chứ không báo lỗi, nên ô
 * lọc phải là danh sách chọn, không để người dùng tự gõ.
 */
export const LedgerTransactionType = {
    WALLET_CREDIT: 'Ghi có ví',
    WALLET_TRANSFER: 'Chuyển tiền ví',
    MERCHANT_WALLET_CREDIT: 'Ghi có ví merchant',
    MERCHANT_WALLET_DEBIT: 'Ghi nợ ví merchant',
    JOURNAL_REVERSAL: 'Bút toán đảo'
} as const

export type LedgerTransactionTypeKey = keyof typeof LedgerTransactionType

export enum StatusConstants {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WAITING = 'WAITING',
    ACTIVE = 'ACTIVE',
    LOCKED = 'LOCKED'
}

export type StatusKey = keyof typeof StatusConstants

export const StatusLabel: Record<string, string> = {
    SUCCESS: 'Thành công',
    ERROR: 'Lỗi',
    WAITING: 'Đang chờ',
    ACTIVE: 'Hoạt động',
    LOCKED: 'Khóa'
}

export const CONFIG_STATUS: Record<StatusConstants, { label: string, className: string, shimmerColor: string, }> = {
    [StatusConstants.SUCCESS]: { label: 'Thành công', className: 'success-status', shimmerColor:'rgba(0, 229, 160, 0.2)'  },
    [StatusConstants.ERROR]: { label: 'Lỗi', className: 'error-status', shimmerColor: 'rgba(255, 86, 59, 0.2)'},
    [StatusConstants.WAITING]: { label: 'Đang chờ', className: 'warning-status', shimmerColor:'rgba(0, 229, 160, 0.2)' },
    [StatusConstants.ACTIVE]: { label: 'Hoạt động', className: 'success-status', shimmerColor: 'rgba(0, 229, 160, 0.2)' },
    [StatusConstants.LOCKED]: { label: 'Khóa', className: 'error-status', shimmerColor: 'rgba(255, 86, 59, 0.2)' },
}

export const GLCodeLabels: Record<string, string> = {
    'REV_USER_FEE': 'Doanh thu phí người dùng',
    'USER_WALLET_VND': 'Ví người dùng VND',
    'SYS_BANK_SETTLEMENT_VND': 'Tài khoản thanh toán ngân hàng VND',
    'SYSTEM': 'Hệ thống'
}

export const OwnerTypeLabels: Record<string, string> = {
    'SYSTEM': 'Hệ thống',
    'USER': 'Người dùng',
    'MERCHANT': 'Merchant'
}

/**
 * Dòng sổ cái chỉ sinh ra khi bút toán đã hạch toán thành công — đúng theo mô
 * hình kế toán, không phải thiếu dữ liệu. Nói trước để người trực không báo là
 * mất dữ liệu khi không thấy giao dịch đang chờ hoặc đã hỏng.
 */
export const LEDGER_POSTED_ONLY_NOTE =
    'Sổ cái chỉ ghi bút toán đã hạch toán thành công. Giao dịch đang chờ, thất bại hoặc đã huỷ không có ở đây — đối chiếu những giao dịch đó ở màn Quản lý giao dịch.'
