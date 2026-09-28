import { Can } from '@/app/permissions'
import { DeleteOutlined, EditOutlined } from '@components/icons'
import { TagComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'

import { AccessActionButton } from '../components/AccessActionButton'
import type {
  AccessMerchant,
  MerchantRole,
  MerchantUser
} from '../types/merchantAccess.types'
import { formatAccessDate, roleCount } from '../utils/merchantAccess.utils'

interface MerchantRoleColumnOptions {
  page: number
  pageSize: number
  users: readonly MerchantUser[]
  getMerchant: (id: string) => AccessMerchant | undefined
  canManageSystemGroups: boolean
  onView: (role: MerchantRole) => void
  onEdit: (role: MerchantRole) => void
  onDelete: (role: MerchantRole) => void
}

export const createMerchantRoleColumns = ({
  page,
  pageSize,
  users,
  getMerchant,
  canManageSystemGroups,
  onView,
  onEdit,
  onDelete
}: MerchantRoleColumnOptions): NonNullable<
  TableComponentProps<MerchantRole>['columns']
> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _role, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Tên nhóm quyền',
    width: 260,
    render: (_, role) => (
      <div className='min-w-0'>
        <button
          className='max-w-60 truncate text-left font-semibold text-foreground hover:text-primary'
          onClick={() => onView(role)}
          type='button'
        >
          {role.name}
        </button>
        <p
          className='max-w-60 truncate text-xs text-muted-foreground'
          title={role.description}
        >
          {role.description}
        </p>
        <p className='whitespace-normal break-words text-xs font-medium text-primary lg:hidden'>
          {role.merchantId
            ? (getMerchant(role.merchantId)?.name ?? 'Merchant không xác định')
            : 'Dùng chung'}
        </p>
      </div>
    )
  },
  {
    title: 'Merchant',
    width: 190,
    render: (_, role) =>
      role.merchantId ? (
        <div>
          <span className='block truncate font-medium text-foreground'>
            {getMerchant(role.merchantId)?.name ?? '—'}
          </span>
          <span className='text-xs text-muted-foreground'>
            {getMerchant(role.merchantId)?.code}
          </span>
        </div>
      ) : (
        <TagComponent color='gold'>Dùng chung</TagComponent>
      )
  },
  {
    title: 'Số quyền',
    width: 100,
    render: (_, role) => (
      <TagComponent color='cyan'>{role.permissions.length} quyền</TagComponent>
    )
  },
  {
    title: 'User trong trang',
    width: 130,
    render: (_, role) => (
      <TagComponent>{roleCount(users, role.id)} User</TagComponent>
    )
  },
  { title: 'Mã nhóm', dataIndex: 'code', width: 140 },
  {
    title: 'Ngày tạo',
    width: 170,
    render: (_, role) => (
      <span className='text-xs text-muted-foreground'>
        {formatAccessDate(role.createdAt)}
      </span>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 112,
    render: (_, role) => (
      <div className='flex items-center justify-center gap-1'>
        {role.system ? (
          canManageSystemGroups && (
            <AccessActionButton
              icon={<EditOutlined aria-hidden />}
              label={`Sửa nhóm ${role.name}`}
              onClick={() => onEdit(role)}
            />
          )
        ) : (
          <Can
            screen='MERCHANT_ROLE'
            action='edit'
          >
            <AccessActionButton
              icon={<EditOutlined aria-hidden />}
              label={`Sửa nhóm ${role.name}`}
              onClick={() => onEdit(role)}
            />
          </Can>
        )}
        {!role.system && (
          <Can
            screen='MERCHANT_ROLE'
            action='delete'
          >
            <AccessActionButton
              danger
              icon={<DeleteOutlined aria-hidden />}
              label={`Xóa nhóm ${role.name}`}
              onClick={() => onDelete(role)}
            />
          </Can>
        )}
      </div>
    )
  }
]
