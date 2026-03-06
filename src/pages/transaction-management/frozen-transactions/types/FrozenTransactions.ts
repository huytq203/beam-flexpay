export enum FreezeStatus {
    ACTIVE = 'ACTIVE',
    CAPTURED = 'CAPTURED',
    RELEASED = 'RELEASED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export enum FreezeType {
    MANUAL = 'MANUAL',
    EXPIRED = 'EXPIRED',
    CAPTURED = 'CAPTURED',
}

export enum ReleaseType {
    ADMIN_LOCK = 'ADMIN_LOCK',
    PAYMENT = 'PAYMENT',
    COMPLIANCE_FREEZE = 'COMPLIANCE_FREEZE',
}

export const StatusLabel: Record<FreezeStatus, string> = {
    [FreezeStatus.ACTIVE]: 'Đang đóng băng',
    [FreezeStatus.CAPTURED]: 'Đã thu',
    [FreezeStatus.RELEASED]: 'Đã giải tỏa',
    [FreezeStatus.EXPIRED]: 'Hết hạn',
    [FreezeStatus.CANCELLED]: 'Đã hủy',
} as const

export const FreezeTypeLabel: Record<FreezeType, string> = {
    [FreezeType.MANUAL]: 'Admin mở thủ công',
    [FreezeType.EXPIRED]: 'Hết hạn tự mở',
    [FreezeType.CAPTURED]: 'Hệ thống capture',
} as const

export const ReleaseTypeLabel: Record<ReleaseType, string> = {
    [ReleaseType.ADMIN_LOCK]: 'Thủ công',
    [ReleaseType.PAYMENT]: 'Hệ thống hold thanh toán',
    [ReleaseType.COMPLIANCE_FREEZE]: 'Tuân thủ pháp luật',
} as const
