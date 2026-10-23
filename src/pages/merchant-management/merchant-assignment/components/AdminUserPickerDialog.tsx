import type { ColumnsType } from 'antd/es/table'
import { useGetUserQuery } from '@services/apiUserManagement'
import {
  EntityPickerContent,
  EntityPickerModal,
  usePickerSearch
} from '@components/index'
import { ADMIN_PICKER_SORT_BY } from '../constants/merchantAssignment.constants'
import type { AdminUserOption } from '../types/merchantAssignment.types'
import { toAdminUserOption } from '../utils/merchantAssignment.utils'

interface Props {
  open: boolean
  selectedId?: string
  onCancel: () => void
  onSelect: (user: AdminUserOption) => void
}

const columns: ColumnsType<AdminUserOption> = [
  {
    title: 'Người dùng nội bộ',
    render: (_, user) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {user.name}
        </div>
        <div className='text-xs text-muted-foreground'>{user.code}</div>
      </div>
    )
  },
  {
    title: 'Email',
    dataIndex: 'email',
    render: (email: string | null) => (
      <span className='text-sm text-foreground'>{email || '—'}</span>
    )
  }
]

/** `adminUserId` không được BE kiểm tra tồn tại nên chỉ cho chọn từ danh bạ admin. */
export function AdminUserPickerDialog(props: Props) {
  return (
    <EntityPickerModal
      open={props.open}
      title='Chọn người phụ trách'
      onCancel={props.onCancel}
    >
      <AdminUserPickerBody {...props} />
    </EntityPickerModal>
  )
}

function AdminUserPickerBody({ selectedId, onCancel, onSelect }: Props) {
  const search = usePickerSearch()
  // `status: true` chỉ lấy tài khoản còn hoạt động.
  const query = useGetUserQuery({
    page: search.params.page,
    size: search.params.size,
    sortBy: ADMIN_PICKER_SORT_BY,
    sortDirection: 'DESC',
    status: true,
    ...(search.params.name ? { keyword: search.params.name } : {})
  })

  return (
    <EntityPickerContent<AdminUserOption>
      entityLabel='người dùng'
      keywordOnly
      note='Chỉ hiển thị tài khoản nội bộ đang hoạt động.'
      columns={columns}
      search={search}
      selectedId={selectedId}
      onSelect={onSelect}
      onCancel={onCancel}
      query={{
        rows: (query.data?.content ?? []).map(toAdminUserOption),
        total: query.data?.totalElements ?? 0,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch
      }}
    />
  )
}
