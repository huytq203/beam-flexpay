import {
  EntityPickerContent,
  EntityPickerModal,
  toPickedEntity,
  usePickerSearch,
  type PickedEntity
} from '@components/index'
import { useGetWalletLimitGroupsQuery } from '@services/apiWalletLimit'
import type { ColumnsType } from 'antd/es/table'

interface GroupPickerDialogProps {
  open: boolean
  selectedId?: string
  onSelect: (entity: PickedEntity) => void
  onCancel: () => void
}

const columns: ColumnsType<PickedEntity> = [
  { title: 'Mã nhóm', dataIndex: 'code' },
  { title: 'Tên nhóm', dataIndex: 'name' }
]

const matches = (row: PickedEntity, keyword: string): boolean =>
  !keyword ||
  `${row.code} ${row.name}`.toLowerCase().includes(keyword.toLowerCase())

export function GroupPickerDialog({
  open,
  selectedId,
  onSelect,
  onCancel
}: GroupPickerDialogProps) {
  return (
    <EntityPickerModal
      open={open}
      title='Chọn nhóm hạn mức'
      onCancel={onCancel}
    >
      <GroupPickerBody
        selectedId={selectedId}
        onSelect={onSelect}
        onCancel={onCancel}
      />
    </EntityPickerModal>
  )
}

/** BE trả nguyên mảng nhóm nên tìm kiếm và phân trang làm ở client. */
function GroupPickerBody({
  selectedId,
  onSelect,
  onCancel
}: Omit<GroupPickerDialogProps, 'open'>) {
  const search = usePickerSearch()
  const groups = useGetWalletLimitGroupsQuery()
  const filtered: PickedEntity[] = (groups.data ?? [])
    .map((group) => ({
      id: group.id,
      code: group.code,
      name: group.displayName
    }))
    .filter((row) => matches(row, search.name.trim()))
  const start = (search.page - 1) * search.size

  return (
    <EntityPickerContent<PickedEntity>
      framed
      entityLabel='nhóm'
      note='Tìm theo mã hoặc tên nhóm.'
      keywordOnly
      columns={columns}
      search={search}
      selectedId={selectedId}
      onSelect={(row) => onSelect(toPickedEntity(row))}
      onCancel={onCancel}
      query={{
        rows: filtered.slice(start, start + search.size),
        total: filtered.length,
        isFetching: groups.isFetching,
        isError: groups.isError,
        refetch: groups.refetch
      }}
    />
  )
}
