import type { ColumnsType } from 'antd/es/table'
import {
  useListMerchantGroupsQuery,
  type MerchantGroupDto
} from '@/app/services/merchantAccessApi'
import {
  EntityPickerContent,
  EntityPickerModal,
  TagComponent,
  usePickerSearch,
  type PickedEntity
} from '@components/index'

import type { AccessMerchant } from '../types/merchantAccess.types'

/** Nhóm đã chọn kèm phạm vi để biết còn hợp lệ khi đổi Merchant của User. */
export interface PickedGroup extends PickedEntity {
  merchantId: string | null
}

interface MerchantGroupPickerDialogProps {
  open: boolean
  /** Đúng 1 Merchant thì lấy nhóm dùng chung + nhóm riêng; còn lại chỉ nhóm dùng chung. */
  merchantId?: string
  selected: readonly PickedGroup[]
  getMerchant: (id: string) => AccessMerchant | undefined
  onCancel: () => void
  onConfirm: (groups: PickedGroup[]) => void
}

const toPickedGroup = (row: PickedEntity | MerchantGroupDto): PickedGroup => ({
  id: row.id,
  code: row.code,
  name: row.name,
  merchantId: 'merchantId' in row ? (row.merchantId ?? null) : null
})

export function MerchantGroupPickerDialog({
  open,
  ...props
}: MerchantGroupPickerDialogProps) {
  return (
    <EntityPickerModal
      open={open}
      title='Chọn nhóm quyền'
      onCancel={props.onCancel}
    >
      <MerchantGroupPickerBody {...props} />
    </EntityPickerModal>
  )
}

function MerchantGroupPickerBody({
  merchantId,
  selected,
  getMerchant,
  onCancel,
  onConfirm
}: Omit<MerchantGroupPickerDialogProps, 'open'>) {
  const search = usePickerSearch()
  const query = useListMerchantGroupsQuery({
    page: search.params.page,
    size: search.params.size,
    query: search.params.name,
    merchantId,
    systemOnly: merchantId ? undefined : true
  })
  const columns: ColumnsType<MerchantGroupDto> = [
    {
      title: 'Nhóm quyền',
      render: (_, group) => (
        <div className='min-w-0'>
          <div className='truncate text-sm font-medium text-foreground'>
            {group.name}
          </div>
          <div className='text-xs text-muted-foreground'>{group.code}</div>
        </div>
      )
    },
    {
      title: 'Phạm vi',
      width: 200,
      render: (_, group) =>
        group.merchantId ? (
          <TagComponent>
            {getMerchant(group.merchantId)?.name ?? 'Nhóm riêng Merchant'}
          </TagComponent>
        ) : (
          <TagComponent color='processing'>Dùng chung</TagComponent>
        )
    },
    {
      title: 'Số quyền',
      width: 100,
      align: 'right',
      render: (_, group) => (
        <span className='tabular-nums'>{group.permissions?.length ?? 0}</span>
      )
    }
  ]

  return (
    <EntityPickerContent<MerchantGroupDto>
      mode='multiple'
      selected={selected}
      entityLabel='nhóm quyền'
      keywordOnly
      note={
        merchantId
          ? undefined
          : 'User quản lý nhiều Merchant chỉ dùng được nhóm quyền dùng chung.'
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
      onCancel={onCancel}
      onConfirm={(rows) => onConfirm(rows.map(toPickedGroup))}
    />
  )
}
