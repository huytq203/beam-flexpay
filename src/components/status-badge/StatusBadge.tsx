
export enum StatusKey {
    ACTIVE = 'ACTIVE',
    FROZEN = 'FROZEN',
    INACTIVE = 'INACTIVE',
    LOCKED = 'LOCKED',

    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED',
    CAPTURED = 'CAPTURED',
    RELEASED = 'RELEASED',
    EXPIRED = 'EXPIRED',
}

export const StatusLabel: Record<StatusKey, string> = {
    [StatusKey.ACTIVE]: 'Hoạt động',
    [StatusKey.INACTIVE]: 'Ngừng hoạt động',
    [StatusKey.FROZEN]: 'Đóng băng',
    [StatusKey.LOCKED]: 'Khóa',
    [StatusKey.SUCCESS]: 'Thành công',
    [StatusKey.FAILED]: 'Thất bại',
    [StatusKey.PENDING]: 'Chờ xử lý',
    [StatusKey.CANCELLED]: 'Đã hủy',
    [StatusKey.CAPTURED]: 'Đã thu',
    [StatusKey.RELEASED]: 'Đã giải tỏa',
    [StatusKey.EXPIRED]: 'Hết hạn',
} as const


const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
    [StatusKey.ACTIVE]: {
        label: 'Hoạt động',
        className: 'success-status',
    },
    [StatusKey.INACTIVE]: {
        label: 'Ngừng hoạt động',
        className: 'danger-status',
    },
    [StatusKey.LOCKED]: {
        label: 'Khóa',
        className: 'danger-status',
    },
    [StatusKey.FROZEN]: {
        label: 'Đóng băng',
        className: 'info-status',
    },

    [StatusKey.SUCCESS]: {
        label: 'Thành công',
        className: 'success-status',
    },
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
    [StatusKey.CAPTURED]: {
        label: 'Đã thu',
        className: 'info-status',
    },
    [StatusKey.RELEASED]: {
        label: 'Đã giải tỏa',
        className: 'normal-status',
    },
    [StatusKey.EXPIRED]: {
        label: 'Hết hạn',
        className: 'warning-status',
    },
}

interface StatusConfig {
    label: string
    className: string
}

interface StatusBadgeProps {
    status: string | number
    config?: Record<string | number, StatusConfig>
}

export default function StatusBadge({ status, config }: StatusBadgeProps) {
    const defaultStatusConfig = STATUS_CONFIG[status as StatusKey]
    const currentConfig = config?.[status] || defaultStatusConfig

    if (!currentConfig) return <span>{status}</span>

    return (
        <span className={`inline-flex px-2 text-[12px] w-fit items-center whitespace-nowrap rounded-md ${currentConfig.className}`}>
            {currentConfig.label}
        </span>
    )
}
