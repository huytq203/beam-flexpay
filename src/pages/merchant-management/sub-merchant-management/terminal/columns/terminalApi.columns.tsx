import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import type {
  ApiTerminalSummary,
  ApiTerminalType,
  HierarchyStatus
} from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LockFilled,
  LockKeyOpenIcon
} from '@components/icons'
import { TagComponent } from '@components/index'
import { TerminalActionButton } from '../components/TerminalActionButton'

type Columns = NonNullable<TableProps<ApiTerminalSummary>['columns']>

export const typeOptions: { value: ApiTerminalType; label: string }[] = [
  { value: 'QR', label: 'QR' },
  { value: 'POS', label: 'POS' },
  { value: 'ONLINE', label: 'Trực tuyến' }
]
export const statusOptions: { value: HierarchyStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'INACTIVE', label: 'Không hoạt động' },
  { value: 'TERMINATED', label: 'Đã kết thúc' }
]

interface TerminalColumnOptions {
  page: number
  size: number
  onView: (row: ApiTerminalSummary) => void
  onEdit: (row: ApiTerminalSummary) => void
  onLock: (row: ApiTerminalSummary) => void
  onDelete: (row: ApiTerminalSummary) => void
}

export const createTerminalApiColumns = ({
  page,
  size,
  onView,
  onEdit,
  onLock,
  onDelete
}: TerminalColumnOptions): Columns => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (page - 1) * size + index + 1
  },
  { title: 'TID', dataIndex: 'tid' },
  { title: 'Tên Terminal', dataIndex: 'name' },
  {
    title: 'Sub-merchant',
    dataIndex: 'subMerchantName',
    render: (value?: string) => value || '—'
  },
  {
    title: 'Loại',
    dataIndex: 'terminalType',
    render: (value: ApiTerminalType) =>
      typeOptions.find((item) => item.value === value)?.label ?? value
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (value: HierarchyStatus) => (
      <TagComponent
        color={
          value === 'ACTIVE'
            ? 'success'
            : value === 'INACTIVE'
              ? 'warning'
              : 'default'
        }
      >
        {statusOptions.find((item) => item.value === value)?.label ?? value}
      </TagComponent>
    )
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    render: (value?: string) => formatUTCToLocalDateTime(value) || '—'
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    width: 160,
    align: 'center',
    render: (_, row) => (
      <div className='flex justify-center gap-1'>
        <Can
          screen='MERCHANT_TERMINAL'
          action='viewDetail'
        >
          <TerminalActionButton
            label={`Xem Terminal ${row.name}`}
            title='Xem chi tiết'
            icon={<EyeOutlined aria-hidden />}
            onClick={() => onView(row)}
          />
        </Can>
        {row.status === 'ACTIVE' && (
          <Can
            screen='MERCHANT_TERMINAL'
            action='edit'
          >
            <TerminalActionButton
              label={`Sửa Terminal ${row.name}`}
              title='Sửa Terminal'
              icon={<EditOutlined aria-hidden />}
              onClick={() => onEdit(row)}
            />
          </Can>
        )}
        {row.status !== 'TERMINATED' && row.lockSource !== 'CASCADE' && (
          <Can
            screen='MERCHANT_TERMINAL'
            action={row.status === 'ACTIVE' ? 'lock' : 'unlock'}
          >
            <TerminalActionButton
              label={`${row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} Terminal ${row.name}`}
              title={
                row.status === 'ACTIVE' ? 'Khóa Terminal' : 'Mở khóa Terminal'
              }
              icon={
                row.status === 'ACTIVE' ? (
                  <LockFilled aria-hidden />
                ) : (
                  <LockKeyOpenIcon
                    aria-hidden
                    size={16}
                  />
                )
              }
              danger={row.status === 'ACTIVE'}
              unlock={row.status !== 'ACTIVE'}
              onClick={() => onLock(row)}
            />
          </Can>
        )}
        <Can
          screen='MERCHANT_TERMINAL'
          action='delete'
        >
          <TerminalActionButton
            label={`Xóa Terminal ${row.name}`}
            title='Xóa Terminal'
            icon={<DeleteOutlined aria-hidden />}
            danger
            onClick={() => onDelete(row)}
          />
        </Can>
      </div>
    )
  }
]
