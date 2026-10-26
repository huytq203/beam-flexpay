import {
  ACCESS_TYPE_LABEL,
  SCOPE_LABEL
} from '../constants/rolePermissionMatrix.constants'
import type { AdminRolePermissionCell } from '../types/rolePermissionMatrix.types'

interface Props {
  cell?: AdminRolePermissionCell
}

/** Ô hiển thị đúng chữ cái SRS; ô "Không" là dấu gạch, ô Assigned kèm nhãn phạm vi. */
export function MatrixCellBadge({ cell }: Props) {
  if (!cell?.granted || !cell.accessType)
    return (
      <span
        aria-label='Không có quyền'
        className='text-muted-foreground'
      >
        -
      </span>
    )
  const assigned = cell.scope === 'ASSIGNED'
  const title = `${ACCESS_TYPE_LABEL[cell.accessType]} - ${SCOPE_LABEL[cell.scope ?? 'ALL']}`
  return (
    <span
      title={title}
      className='inline-flex items-center gap-1 text-xs font-semibold text-foreground'
    >
      <span className='rounded bg-primary/10 px-1.5 py-0.5'>{cell.symbol}</span>
      {assigned && (
        <span className='font-normal text-warning-strong'>(Assigned)</span>
      )}
    </span>
  )
}
