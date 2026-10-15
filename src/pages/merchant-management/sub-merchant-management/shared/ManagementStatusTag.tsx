import {
  StatusToneBadge,
  type StatusTone
} from '@components/status-badge/StatusToneBadge'

import type { EntityStatus, ManagementStatusTagProps } from './management.types'

const STATUS_PRESENTATION: Record<
  EntityStatus,
  { label: string; tone: StatusTone }
> = {
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  INACTIVE: { label: 'Đã khóa', tone: 'warning' },
  TERMINATED: { label: 'Đã chấm dứt', tone: 'danger' },
  LOCKED: { label: 'Đã khóa', tone: 'warning' },
  SUSPENDED_BY_PARENT: { label: 'Tạm ngưng theo cấp cha', tone: 'danger' },
  SUSPENDED_BY_SUB: { label: 'Tạm ngưng theo cấp cha', tone: 'danger' }
}

export function ManagementStatusTag({
  status,
  className
}: ManagementStatusTagProps) {
  const presentation = STATUS_PRESENTATION[status]

  return (
    <StatusToneBadge
      className={className}
      tone={presentation.tone}
    >
      {presentation.label}
    </StatusToneBadge>
  )
}
