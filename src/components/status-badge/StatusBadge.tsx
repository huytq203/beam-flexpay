import { cn } from "@utils/cn";

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


const STATUS_CONFIG: Record<StatusKey, { label: string; className: string; shimmerColor: string }> = {
    [StatusKey.ACTIVE]: {
        label: 'Hoạt động',
        className: 'success-status',
        shimmerColor: 'rgba(0, 229, 160, 0.1)',
    },
    [StatusKey.INACTIVE]: {
        label: 'Ngừng hoạt động',
        className: 'danger-status',
        shimmerColor: 'rgba(239, 68, 68, 0.1)',
    },
    [StatusKey.LOCKED]: {
        label: 'Khóa',
        className: 'danger-status',
        shimmerColor: 'rgba(239, 68, 68, 0.1)',
    },
    [StatusKey.FROZEN]: {
        label: 'Đóng băng',
        className: 'info-status',
        shimmerColor: 'rgba(59, 130, 246, 0.1)',
    },

    [StatusKey.SUCCESS]: {
        label: 'Thành công',
        className: 'success-status',
        shimmerColor: 'rgba(0, 229, 160, 0.1)',
    },
    [StatusKey.FAILED]: {
        label: 'Thất bại',
        className: 'danger-status',
        shimmerColor: 'rgba(239, 68, 68, 0.1)',
    },
    [StatusKey.PENDING]: {
        label: 'Chờ xử lý',
        className: 'warning-status',
        shimmerColor: 'rgba(245, 158, 11, 0.1)',
    },
    [StatusKey.CANCELLED]: {
        label: 'Đã hủy',
        className: 'danger-status',
        shimmerColor: 'rgba(239, 68, 68, 0.1)',
    },
    [StatusKey.CAPTURED]: {
        label: 'Đã thu',
        className: 'info-status',
        shimmerColor: 'rgba(59, 130, 246, 0.1)',
    },
    [StatusKey.RELEASED]: {
        label: 'Đã giải tỏa',
        className: 'normal-status',
        shimmerColor: 'rgba(107, 114, 128, 0.1)',
    },
    [StatusKey.EXPIRED]: {
        label: 'Hết hạn',
        className: 'warning-status',
        shimmerColor: 'rgba(245, 158, 11, 0.1)',
    },
}

interface StatusConfig {
    label: string | React.ReactNode
    className: string
    shimmerColor?: string
}

interface StatusBadgeProps {
    status: string | number
    config?: Record<string | number, StatusConfig>
    className?: string
}

export default function StatusBadge({ status, config, className }: StatusBadgeProps) {
    const defaultStatusConfig = STATUS_CONFIG[status as StatusKey]
    const currentConfig = config?.[status] || defaultStatusConfig

    if (!currentConfig) return <span>{status}</span>

    return (
        <span
            className={cn(`inline-flex px-2 text-[12px] w-fit items-center whitespace-nowrap rounded-md relative overflow-hidden ${currentConfig.className}${!!currentConfig.shimmerColor ? ` before:absolute before:inset-y-0 before:-left-full before:w-[60%] before:bg-[linear-gradient(90deg,transparent,var(--shimmer-color,rgba(0,229,160,0.15)),transparent)] before:animate-shimmer` : ''}`, className)}
            style={{ '--shimmer-color': currentConfig.shimmerColor } as React.CSSProperties}
        >
            {currentConfig.label || '--'}
        </span>
    )
}
