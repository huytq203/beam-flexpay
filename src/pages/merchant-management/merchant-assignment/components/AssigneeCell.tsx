import { toAssigneeName } from '../utils/assignmentDisplay.utils'

interface Props {
  adminUserId: string
  adminFullName?: string | null
  adminUsername?: string | null
  adminEmail?: string | null
}

/** Tên/username/email do BE trả sẵn nên không phải tra từng người. */
export function AssigneeCell(props: Props) {
  const resolved = Boolean(props.adminFullName || props.adminUsername)
  return (
    <div className='min-w-0'>
      <div
        className={
          resolved
            ? 'truncate text-sm font-medium text-foreground'
            : 'truncate font-mono text-xs text-muted-foreground'
        }
        title={resolved ? undefined : 'Không tra được tên người này'}
      >
        {toAssigneeName(props)}
      </div>
      {resolved && (
        <div className='truncate text-xs text-muted-foreground'>
          {[props.adminUsername, props.adminEmail].filter(Boolean).join(' · ')}
        </div>
      )}
    </div>
  )
}
