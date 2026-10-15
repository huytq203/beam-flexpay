import {
  StatusToneBadge,
  type StatusTone
} from '../status-badge/StatusToneBadge'

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  DRAFT: { label: 'Nháp', tone: 'normal' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', tone: 'warning' },
  ACTIVE: { label: 'Hoạt động', tone: 'success' },
  INACTIVE: { label: 'Đã khóa', tone: 'warning' },
  REJECTED: { label: 'Từ chối', tone: 'danger' },
  LOCKED: { label: 'Bị khóa', tone: 'danger' },
  TERMINATED: { label: 'Đã kết thúc', tone: 'normal' }
}

export function PickerStatusTag({ status }: { status?: string }) {
  if (!status) return <span className='text-muted-foreground'>—</span>
  const preset = STATUS[status]
  return (
    <StatusToneBadge tone={preset?.tone}>
      {preset?.label ?? status}
    </StatusToneBadge>
  )
}
