import { StatusToneBadge, type StatusTone } from './StatusToneBadge'
import { StatusKey } from './statusBadge.constants'

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; className: string; shimmerColor: string }
> = {
  [StatusKey.ACTIVE]: {
    label: 'Hoạt động',
    className: 'success-status',
    shimmerColor: 'rgba(0, 229, 160, 0.1)'
  },
  [StatusKey.INACTIVE]: {
    label: 'Ngừng hoạt động',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)'
  },
  [StatusKey.LOCKED]: {
    label: 'Khóa',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)'
  },
  [StatusKey.CLOSED]: {
    label: 'Đã hủy',
    className: 'normal-status',
    shimmerColor: 'rgba(107, 114, 128, 0.1)'
  },
  [StatusKey.FROZEN]: {
    label: 'Đóng băng',
    className: 'info-status',
    shimmerColor: 'rgba(59, 130, 246, 0.1)'
  },

  [StatusKey.SUCCESS]: {
    label: 'Thành công',
    className: 'success-status',
    shimmerColor: 'rgba(0, 229, 160, 0.1)'
  },
  [StatusKey.FAILED]: {
    label: 'Thất bại',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)'
  },
  [StatusKey.PENDING]: {
    label: 'Chờ xử lý',
    className: 'warning-status',
    shimmerColor: 'rgba(245, 158, 11, 0.1)'
  },
  [StatusKey.CANCELLED]: {
    label: 'Đã hủy',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)'
  },
  [StatusKey.CAPTURED]: {
    label: 'Đã thu',
    className: 'info-status',
    shimmerColor: 'rgba(59, 130, 246, 0.1)'
  },
  [StatusKey.RELEASED]: {
    label: 'Đã mở băng',
    className: 'normal-status',
    shimmerColor: 'rgba(107, 114, 128, 0.1)'
  },
  [StatusKey.EXPIRED]: {
    label: 'Hết hạn',
    className: 'warning-status',
    shimmerColor: 'rgba(245, 158, 11, 0.1)'
  }
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

const toneFromClassName = (className: string): StatusTone => {
  if (/success/.test(className)) return 'success'
  if (/danger|error/.test(className)) return 'danger'
  if (/warning/.test(className)) return 'warning'
  if (/info/.test(className)) return 'info'
  return 'normal'
}

export default function StatusBadge({
  status,
  config,
  className
}: StatusBadgeProps) {
  const currentConfig = config?.[status] || STATUS_CONFIG[status as StatusKey]

  if (!currentConfig) return <span>{status}</span>

  return (
    <StatusToneBadge
      tone={toneFromClassName(currentConfig.className)}
      className={className}
    >
      {currentConfig.label || '--'}
    </StatusToneBadge>
  )
}
