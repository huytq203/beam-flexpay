import { Can } from '@/app/permissions'
import { DeleteOutlined } from '@components/icons'
import { TagComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { AccessActionButton } from '../../merchant-access/components/AccessActionButton'
import { formatOrderDateTime } from '../../merchant-order/utils/merchantOrder.utils'
import { AdminUserName } from '../components/AdminUserName'
import { AssigneeCell } from '../components/AssigneeCell'
import type { AdminAssignment } from '../types/merchantAssignment.types'

interface Options {
  onRemove: (assignment: AdminAssignment) => void
  /** `false` khi BE báo người xem không quản lý được phân công (`/merchant-assignments/me`). */
  canManage?: boolean
}

/** Không phân trang (BE trả cả mảng) nên `#` là số thứ tự trong danh sách. */
export const createAssignmentColumns = ({
  onRemove,
  canManage = true
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
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-1'>
        <AssigneeCell {...row} />
        {row.inheritedFromMaster && (
          <TagComponent color='blue'>Kế thừa từ Master</TagComponent>
        )}
      </div>
    )
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
    render: (_, row) =>
      // Dòng kế thừa thuộc Master: phải gỡ ở Master chứ không gỡ được ở Sub.
      canManage && !row.inheritedFromMaster ? (
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
      ) : null
  }
]
