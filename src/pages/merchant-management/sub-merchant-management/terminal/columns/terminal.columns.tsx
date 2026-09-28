import { Can } from '@/app/permissions'
import {
  EditOutlined,
  EyeOutlined,
  LockFilled,
  LockKeyOpenIcon
} from '@components/icons'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'

import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import { TerminalActionButton } from '../components/TerminalActionButton'
import type { TerminalRow } from '../types/terminal.type'
import { getTerminalTypeLabel } from '../utils/terminal.utils'

export type TerminalColumns = NonNullable<
  TableComponentProps<TerminalRow>['columns']
>

interface TerminalColumnActions {
  onView: (row: TerminalRow) => void
  onEdit: (row: TerminalRow) => void
  onRequestStatusChange: (row: TerminalRow) => void
}

const createActionColumn = (
  actions: TerminalColumnActions
): TerminalColumns[number] => ({
  title: 'Thao tác',
  align: 'center',
  fixed: 'right',
  width: 100,
  render: (_, row) => (
    <div className='flex items-center justify-center gap-1'>
      <Can
        screen='MERCHANT_TERMINAL'
        action='viewDetail'
      >
        <TerminalActionButton
          label={`Xem Terminal ${row.name}`}
          title='Xem chi tiết'
          icon={<EyeOutlined aria-hidden />}
          onClick={() => actions.onView(row)}
        />
      </Can>
      {row.status !== 'SUSPENDED_BY_SUB' && (
        <Can
          screen='MERCHANT_TERMINAL'
          action='edit'
        >
          <TerminalActionButton
            label={`Sửa Terminal ${row.name}`}
            title='Sửa Terminal'
            icon={<EditOutlined aria-hidden />}
            onClick={() => actions.onEdit(row)}
          />
        </Can>
      )}
      <Can
        screen='MERCHANT_TERMINAL'
        action={row.status === 'ACTIVE' ? 'lock' : 'unlock'}
      >
        <TerminalActionButton
          danger={row.status === 'ACTIVE'}
          unlock={row.status !== 'ACTIVE'}
          label={`${row.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} Terminal ${row.name}`}
          title={row.status === 'ACTIVE' ? 'Khóa Terminal' : 'Mở khóa Terminal'}
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
          onClick={() => actions.onRequestStatusChange(row)}
        />
      </Can>
    </div>
  )
})

export const createTerminalColumns = (
  actions: TerminalColumnActions
): TerminalColumns => [
  {
    title: 'Terminal ID',
    dataIndex: 'tid',
    width: 150,
    render: (tid: string) => (
      <span className='font-medium tabular-nums text-foreground'>{tid}</span>
    )
  },
  { title: 'Tên Terminal', dataIndex: 'name', width: 190 },
  {
    title: 'Quan hệ quản lý',
    width: 220,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-0.5'>
        <span className='font-medium text-foreground'>
          {row.subMerchantName}
        </span>
        <span className='truncate text-xs text-muted-foreground'>
          {row.parentMerchantName} · {row.subMerchantCode}
        </span>
      </div>
    )
  },
  {
    title: 'Loại',
    dataIndex: 'type',
    width: 110,
    render: (type: TerminalRow['type']) => (
      <span className='rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-semibold text-foreground'>
        {getTerminalTypeLabel(type)}
      </span>
    )
  },
  {
    title: 'Địa điểm',
    dataIndex: 'address',
    width: 260,
    render: (address: string) => (
      <span
        className='block max-w-64 truncate'
        title={address}
      >
        {address}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 170,
    render: (status: TerminalRow['status']) => (
      <ManagementStatusTag status={status} />
    )
  },
  { title: 'Cập nhật', dataIndex: 'updatedAt', width: 155 },
  createActionColumn(actions)
]
