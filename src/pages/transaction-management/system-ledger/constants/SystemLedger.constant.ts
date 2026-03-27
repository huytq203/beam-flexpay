export const DirectionConstants = {
    CREDIT: 'CREDIT',
    DEBIT: 'DEBIT'
} as const

export type DirectionKey = keyof typeof DirectionConstants

export const DirectionLabel: Record<DirectionKey, string> = {
    CREDIT: 'Credit',
    DEBIT: 'Debit'
}

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
