import { Can } from '@/app/permissions'
import { DeleteOutlined } from '@components/icons'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import { formatOrderDateTime } from '../../merchant-order/utils/merchantOrder.utils'
import { AdminUserName } from '../components/AdminUserName'
import type { AdminAssignment } from '../types/merchantAssignment.types'

interface Options {
  onRemove: (assignment: AdminAssignment) => void
}

/** Không phân trang (BE trả cả mảng) nên `#` là số thứ tự trong danh sách. */
export const createAssignmentColumns = ({
  onRemove
}: Options): NonNullable<TableComponentProps<AdminAssignment>['columns']> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => index + 1
  },
  {
    title: 'Người phụ trách',
    width: 260,
    render: (_, row) => <AdminUserName userId={row.adminUserId} />
  },
  {
    title: 'Gán lúc',
    width: 180,
    render: (_, row) => formatOrderDateTime(row.assignedAt)
  },
  {
    title: 'Gán bởi',
    width: 220,
    render: (_, row) => <AdminUserName userId={row.assignedBy} />
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 100,
    render: (_, row) => (
      <Can
        screen='MERCHANT_ASSIGNMENT'
        action='delete'
      >
        <AccessActionButton
          danger
          label='Gỡ phụ trách'
          icon={<DeleteOutlined aria-hidden />}
          onClick={() => onRemove(row)}
        />
      </Can>
    )
  }
]
