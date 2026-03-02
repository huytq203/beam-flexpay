export const DirectionConstants = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT'
} as const

export type DirectionKey = keyof typeof DirectionConstants

export const DirectionLabel: Record<DirectionKey, string> = {
    CREDIT: 'Credit',
    DEBIT: 'Debit'
}

export const StatusConstants = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    WAITING: 'WAITING',
    ACTIVE: 'ACTIVE',
    LOCKED: 'LOCKED'
} as const

export type StatusKey = keyof typeof StatusConstants

export const StatusLabel: Record<string, string> = {
    SUCCESS: 'Thành công',
    ERROR: 'Lỗi',
    WAITING: 'Đang chờ',
    ACTIVE: 'Hoạt động',
    LOCKED: 'Khóa'
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
