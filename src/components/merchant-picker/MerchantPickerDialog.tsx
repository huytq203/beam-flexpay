import type { ColumnsType } from 'antd/es/table'
import {
  useGetHierarchyParentsQuery,
  type ApiParentMerchant
} from '@/app/services/merchantHierarchyApi'
import {
  EntityPickerContent,
  EntityPickerModal,
  type PickerSelection
} from './EntityPickerDialog'
import { usePickerSearch } from './usePickerSearch'
import { PickerStatusTag } from './pickerStatusTag'

type MerchantPickerDialogProps = PickerSelection<ApiParentMerchant> & {
  open: boolean
  title?: string
  /** Bỏ trống để tra cứu cả Merchant không còn hoạt động (dùng cho bộ lọc). */
  status?: string
  onCancel: () => void
}

const columns: ColumnsType<ApiParentMerchant> = [
  {
    title: 'Merchant',
    render: (_, merchant) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {merchant.name}
        </div>
        <div className='text-xs text-muted-foreground'>{merchant.code}</div>
      </div>
    )
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'contactPhone',
    width: 150,
    render: (phone?: string) => (
      <span className='text-sm tabular-nums text-foreground'>
        {phone || '—'}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 140,
    render: (status?: string) => <PickerStatusTag status={status} />
  }
]

export function MerchantPickerDialog(props: MerchantPickerDialogProps) {
  const { open, title = 'Chọn Merchant' } = props
  return (
    <EntityPickerModal
      open={open}
      title={title}
      onCancel={props.onCancel}
    >
      <MerchantPickerDialogBody {...props} />
    </EntityPickerModal>
  )
}

function MerchantPickerDialogBody(props: MerchantPickerDialogProps) {
  const { status } = props
  const search = usePickerSearch()
  const query = useGetHierarchyParentsQuery({ ...search.params, status })

  return (
    <EntityPickerContent<ApiParentMerchant>
      {...props}
      entityLabel='Merchant'
      note={
        status === 'ACTIVE'
          ? 'Chỉ hiển thị Merchant đang hoạt động.'
          : undefined
      }
      columns={columns}
      search={search}
      query={{
        rows: query.data?.content ?? [],
        total: query.data?.totalElements ?? 0,
        isFetching: query.isFetching,
        isError: query.isError,
        refetch: query.refetch
      }}
    />
  )
}
