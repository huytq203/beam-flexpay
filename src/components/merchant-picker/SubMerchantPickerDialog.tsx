import type { ColumnsType } from 'antd/es/table'
import {
  useGetSubMerchantPageQuery,
  type ApiSubMerchantSummary,
  type HierarchyStatus
} from '@/app/services/merchantHierarchyApi'
import {
  EntityPickerContent,
  EntityPickerModal,
  type PickerSelection
} from './EntityPickerDialog'
import { usePickerSearch } from './usePickerSearch'
import { PickerStatusTag } from './pickerStatusTag'

type SubMerchantPickerDialogProps = PickerSelection<ApiSubMerchantSummary> & {
  open: boolean
  title?: string
  /** Giới hạn trong một Merchant cha; bỏ trống để tìm trên mọi Merchant. */
  merchantId?: string
  /** Bỏ trống để tra cứu cả Sub-merchant đã khóa (dùng cho bộ lọc). */
  status?: HierarchyStatus
  onCancel: () => void
}

const columns: ColumnsType<ApiSubMerchantSummary> = [
  {
    title: 'Sub-merchant',
    render: (_, sub) => (
      <div className='min-w-0'>
        <div className='truncate text-sm font-medium text-foreground'>
          {sub.name}
        </div>
        <div className='text-xs text-muted-foreground'>{sub.code}</div>
      </div>
    )
  },
  {
    title: 'Merchant cha',
    render: (_, sub) => (
      <div className='min-w-0'>
        <div className='truncate text-sm text-foreground'>
          {sub.merchantName || '—'}
        </div>
        <div className='text-xs text-muted-foreground'>{sub.merchantCode}</div>
      </div>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 140,
    render: (status?: string) => <PickerStatusTag status={status} />
  }
]

export function SubMerchantPickerDialog(props: SubMerchantPickerDialogProps) {
  const { open, title = 'Chọn Sub-merchant' } = props
  return (
    <EntityPickerModal
      open={open}
      title={title}
      onCancel={props.onCancel}
    >
      <SubMerchantPickerDialogBody {...props} />
    </EntityPickerModal>
  )
}

function SubMerchantPickerDialogBody(props: SubMerchantPickerDialogProps) {
  const { merchantId, status } = props
  const search = usePickerSearch()
  const query = useGetSubMerchantPageQuery({
    ...search.params,
    merchantId,
    status
  })

  return (
    <EntityPickerContent<ApiSubMerchantSummary>
      {...props}
      entityLabel='Sub-merchant'
      note={
        status === 'ACTIVE'
          ? 'Chỉ hiển thị Sub-merchant đang hoạt động.'
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
