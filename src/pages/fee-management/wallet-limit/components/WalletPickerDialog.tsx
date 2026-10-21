import {
  EntityPickerContent,
  EntityPickerModal,
  TagComponent,
  toPickedEntity,
  usePickerSearch,
  type PickedEntity
} from '@components/index'
import {
  useGetWalletLimitGroupsQuery,
  useGetWalletLimitProfilesQuery
} from '@services/apiWalletLimit'
import type { WalletLimitProfile } from '@type/walletLimit.type'
import type { ColumnsType } from 'antd/es/table'

interface WalletPickerDialogProps {
  open: boolean
  selectedId?: string
  onSelect: (entity: PickedEntity) => void
  onCancel: () => void
}

/** Hàng bảng chọn ví: `id` là `user_wallet_profiles.id`, cũng là `targetId`. */
interface WalletRow extends PickedEntity {
  status: string
  walletType: string
  groupName: string
}

const MAX_USERNAME_LENGTH = 100

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  LOCKED: 'Khóa'
}

const columns: ColumnsType<WalletRow> = [
  {
    title: 'Số điện thoại',
    dataIndex: 'name',
    render: (phone: string) => (
      <span className='tabular-nums text-foreground'>{phone}</span>
    )
  },
  {
    title: 'Trạng thái ví',
    dataIndex: 'status',
    width: 140,
    render: (status: string) => (
      <TagComponent color={status === 'ACTIVE' ? 'success' : 'default'}>
        {STATUS_LABELS[status] ?? status}
      </TagComponent>
    )
  },
  { title: 'Loại ví', dataIndex: 'walletType', width: 120 },
  {
    title: 'Nhóm hạn mức',
    dataIndex: 'groupName',
    render: (groupName: string) =>
      groupName || (
        <span className='text-muted-foreground'>Chưa thuộc nhóm</span>
      )
  }
]

const toWalletRow = (
  profile: WalletLimitProfile,
  groupNames: Map<string, string>
): WalletRow => ({
  id: profile.id,
  // Mã bỏ trống để ô chọn hiện đúng số điện thoại, không lặp "SĐT — SĐT".
  code: '',
  name: profile.username,
  status: profile.status,
  walletType: profile.walletType,
  groupName: profile.limitGroupId
    ? (groupNames.get(profile.limitGroupId) ?? 'Đã thuộc nhóm')
    : ''
})

export function WalletPickerDialog({
  open,
  selectedId,
  onSelect,
  onCancel
}: WalletPickerDialogProps) {
  return (
    <EntityPickerModal
      open={open}
      title='Chọn ví'
      onCancel={onCancel}
    >
      <WalletPickerBody
        selectedId={selectedId}
        onSelect={onSelect}
        onCancel={onCancel}
      />
    </EntityPickerModal>
  )
}

function WalletPickerBody({
  selectedId,
  onSelect,
  onCancel
}: Omit<WalletPickerDialogProps, 'open'>) {
  const search = usePickerSearch()
  const profiles = useGetWalletLimitProfilesQuery({
    username: search.params.name?.slice(0, MAX_USERNAME_LENGTH),
    page: search.page,
    size: search.size
  })
  const groups = useGetWalletLimitGroupsQuery()
  const groupNames = new Map(
    (groups.data ?? []).map((group) => [group.id, group.displayName])
  )

  return (
    <EntityPickerContent<WalletRow>
      framed
      entityLabel='ví'
      keywordOnly
      columns={columns}
      search={search}
      selectedId={selectedId}
      onSelect={(row) => onSelect(toPickedEntity(row))}
      onCancel={onCancel}
      query={{
        rows: (profiles.data?.content ?? []).map((profile) =>
          toWalletRow(profile, groupNames)
        ),
        total: profiles.data?.totalElements ?? 0,
        isFetching: profiles.isFetching,
        isError: profiles.isError,
        refetch: profiles.refetch
      }}
    />
  )
}
