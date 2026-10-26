import type { ColumnsType } from 'antd/es/table'
import { MatrixCellBadge } from '../components/MatrixCellBadge'
import { ROLE_LABEL } from '../constants/rolePermissionMatrix.constants'
import type {
  AdminRole,
  MatrixTableRow
} from '../types/rolePermissionMatrix.types'
import { findCell } from '../utils/matrixGroups.utils'

/** Dòng tiêu đề nhóm trải hết các cột, dòng chức năng giữ một ô cho mỗi cột. */
const spanOf =
  (total: number) =>
  (record: MatrixTableRow): { colSpan: number } => ({
    colSpan: record.rowType === 'group' ? total : 1
  })

const hiddenForGroup = (record: MatrixTableRow): { colSpan: number } => ({
  colSpan: record.rowType === 'group' ? 0 : 1
})

/** Cột dựng từ `roles` của BE (thứ tự cột), không cố định số vai trò. */
export const createMatrixColumns = (
  roles: AdminRole[]
): ColumnsType<MatrixTableRow> => [
  {
    title: '#',
    key: 'index',
    width: 56,
    onCell: spanOf(roles.length + 2),
    render: (_, record) =>
      record.rowType === 'group' ? (
        <span className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          {record.label} ({record.count})
        </span>
      ) : (
        record.index
      )
  },
  {
    title: 'Chức năng',
    key: 'function',
    onCell: hiddenForGroup,
    render: (_, record) =>
      record.rowType === 'function' ? (
        <div className='min-w-[220px]'>
          <div className='text-sm text-foreground'>
            {record.row.displayName}
          </div>
          <div className='text-xs text-muted-foreground'>{record.row.code}</div>
        </div>
      ) : null
  },
  ...roles.map((role) => ({
    title: ROLE_LABEL[role] ?? role,
    key: role,
    align: 'center' as const,
    width: 120,
    onCell: hiddenForGroup,
    render: (_: unknown, record: MatrixTableRow) =>
      record.rowType === 'function' ? (
        <MatrixCellBadge cell={findCell(record.row, role)} />
      ) : null
  }))
]
