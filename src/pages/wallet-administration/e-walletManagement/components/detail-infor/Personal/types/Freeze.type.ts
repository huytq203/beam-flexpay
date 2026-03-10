

export enum FreezeStatus {
    ACTIVE = 'ACTIVE',
    CAPTURED = 'CAPTURED',
    RELEASED = 'RELEASED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export const FreezeStatusLabel: Record<FreezeStatus, string> = {
    [FreezeStatus.ACTIVE]: 'Đang đóng băng',
    [FreezeStatus.CAPTURED]: 'Đã thu',
    [FreezeStatus.RELEASED]: 'Đã giải tỏa',
    [FreezeStatus.EXPIRED]: 'Hết hạn',
    [FreezeStatus.CANCELLED]: 'Đã hủy',
}
export const FreezeStatusConfig: Record<FreezeStatus, { label: string; className: string }> = {
    [FreezeStatus.ACTIVE]: {
        label: 'Đang đóng băng',
        className: 'info-status',
    },
    [FreezeStatus.CAPTURED]: {
        label: 'Đã thu',
        className: 'success-status',
    },
    [FreezeStatus.RELEASED]: {
        label: 'Đã giải tỏa',
        className: 'normal-status',
    },
    [FreezeStatus.EXPIRED]: {
        label: 'Hết hạn',
        className: 'warning-status',
    },
    [FreezeStatus.CANCELLED]: {
        label: 'Đã hủy',
        className: 'danger-status',
    },
}