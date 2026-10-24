import { useMemo } from 'react'
import type {
  AdminAccessScope,
  AdminAccessType,
  AdminRolePermissionMatrix,
  RoleDraft
} from '../types/rolePermissionMatrix.types'
import { groupMatrixRows } from '../utils/matrixGroups.utils'
import { RoleEditRow } from './RoleEditRow'

interface Props {
  matrix: AdminRolePermissionMatrix
  draft: RoleDraft
  changed: string[]
  onAccessType: (code: string, accessType: AdminAccessType | null) => void
  onScope: (code: string, scope: AdminAccessScope) => void
}

/** Mọi dòng BE trả về, gom nhóm; mỗi dòng có đúng một ô của vai trò đang sửa. */
export function RoleEditRows({
  matrix,
  draft,
  changed,
  onAccessType,
  onScope
}: Props) {
  const groups = useMemo(() => groupMatrixRows(matrix.functions), [matrix])
  return (
    <div className='flex flex-col gap-3'>
      {groups.map((group) => (
        <section
          key={group.key}
          aria-label={group.label}
        >
          <h3 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            {group.label}
          </h3>
          <ul>
            {group.rows.map((row) => (
              <RoleEditRow
                key={row.code}
                cell={draft[row.code] ?? { accessType: null, scope: 'ALL' }}
                changed={changed.includes(row.code)}
                onAccessType={(value) => onAccessType(row.code, value)}
                onScope={(scope) => onScope(row.code, scope)}
                row={row}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
