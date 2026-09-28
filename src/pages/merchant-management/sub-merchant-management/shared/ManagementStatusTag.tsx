import { tv } from 'tailwind-variants'

import { cn } from '@lib/utils/cn'

import type { EntityStatus, ManagementStatusTagProps } from './management.types'

const statusTag = tv({
  base: 'inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs leading-4 font-semibold',
  variants: {
    tone: {
      success: 'border-success-strong/30 bg-success-strong/10 text-success-strong',
      warning: 'border-warning-strong/30 bg-warning-strong/10 text-warning-strong',
      danger: 'border-danger-strong/30 bg-danger-strong/10 text-danger-strong'
    }
  }
})

const STATUS_PRESENTATION: Record<
  EntityStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' }
> = {
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  INACTIVE: { label: 'Đã khóa', tone: 'warning' },
  TERMINATED: { label: 'Đã chấm dứt', tone: 'danger' },
  LOCKED: { label: 'Đã khóa', tone: 'warning' },
  SUSPENDED_BY_PARENT: { label: 'Tạm ngưng theo cấp cha', tone: 'danger' },
  SUSPENDED_BY_SUB: { label: 'Tạm ngưng theo cấp cha', tone: 'danger' }
}

export function ManagementStatusTag({ status, className }: ManagementStatusTagProps) {
  const presentation = STATUS_PRESENTATION[status]

  return (
    <span className={cn(statusTag({ tone: presentation.tone }), className)}>
      {presentation.label}
    </span>
  )
}
