export enum typeLock{
    ADMIN_LOCK='ADMIN_LOCK',
    PAYMENT='PAYMENT',
}
export const typeLockLabel: Record<typeLock, string> = {
    [typeLock.ADMIN_LOCK]: 'Đóng băng bởi Admin',
    [typeLock.PAYMENT]: 'Thanh toán',
}

export enum ownerType{
    USER='USER',
    MERCHANT='MERCHANT',
    SYSTEM='SYSTEM',
}
export const ownerTypeLabel: Record<ownerType, string> = {
    [ownerType.USER]: 'Người dùng',
    [ownerType.MERCHANT]: 'Doanh nghiệp',
    [ownerType.SYSTEM]: 'Hệ thống',
}
export const CONFIG_LABEL_OWNER_TYPE: Record<ownerType, {label: string, className: string}> = {
    [ownerType.USER]: {label: 'User',className: 'normal-status'},
    [ownerType.MERCHANT]: {label: 'Merchant', className: 'normal-status'},
    [ownerType.SYSTEM]: {label: 'System', className: 'normal-status'},
}
export enum StatusKey {
    ACTIVE = 'ACTIVE',
    CAPTURED = 'CAPTURED',
    RELEASED = 'RELEASED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export const STATUS_CONFIG: Record<StatusKey, { label: string; className: string, shimmerColor: string }> = {
    [StatusKey.ACTIVE]: { label: 'Đang đóng băng', className: 'info-status', shimmerColor: 'rgba(59, 130, 246, 0.15)' },
    [StatusKey.CAPTURED]: { label: 'Đã thu', className: 'success-status', shimmerColor: 'rgba(0, 229, 160, 0.15)' },
    [StatusKey.RELEASED]: { label: 'Đã giải tỏa', className: 'success-status', shimmerColor: 'rgba(0, 229, 160, 0.15)' },
    [StatusKey.EXPIRED]: { label: 'Hết hạn', className: 'warning-status', shimmerColor: 'rgba(245, 158, 11, 0.15)' },
    [StatusKey.CANCELLED]: { label: 'Đã hủy', className: 'error-status', shimmerColor: 'rgba(239, 68, 68, 0.15)' },
}