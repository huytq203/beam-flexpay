import { TagComponent } from '../ui/tag-component'

type TagColor = 'success' | 'warning' | 'error' | 'default'

const STATUS: Record<string, { label: string; color: TagColor }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', color: 'warning' },
  ACTIVE: { label: 'Hoạt động', color: 'success' },
  INACTIVE: { label: 'Đã khóa', color: 'warning' },
  REJECTED: { label: 'Từ chối', color: 'error' },
  LOCKED: { label: 'Bị khóa', color: 'error' },
  TERMINATED: { label: 'Đã kết thúc', color: 'default' }
}

export function PickerStatusTag({ status }: { status?: string }) {
  if (!status) return <span className='text-muted-foreground'>—</span>
  const preset = STATUS[status]
  return (
    <TagComponent color={preset?.color ?? 'default'}>
      {preset?.label ?? status}
    </TagComponent>
  )
}
