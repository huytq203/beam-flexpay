

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
export const FreezeStatusConfig: Record<FreezeStatus, { label: string; className: string, shimmerColor: string }> = {
    [FreezeStatus.ACTIVE]: {
        label: 'Đang đóng băng',
        className: 'info-status',
        shimmerColor: 'rgba(59, 130, 246, 0.1)',
    },
    [FreezeStatus.CAPTURED]: {
        label: 'Đã thu',
        className: 'success-status',
         shimmerColor: 'rgba(0, 229, 160, 0.2)',
    },
    [FreezeStatus.RELEASED]: {
        label: 'Đã giải tỏa',
        className: 'normal-status',
        shimmerColor: 'rgba(107, 114, 128, 0.2)',
    },
    [FreezeStatus.EXPIRED]: {
        label: 'Hết hạn',
        className: 'warning-status',
        shimmerColor: 'rgba(245, 158, 11, 0.2)',
    },
    [FreezeStatus.CANCELLED]: {
        label: 'Đã hủy',
        className: 'danger-status',
        shimmerColor: 'rgba(239, 68, 68, 0.2)',
    },
}