import { Can } from '@/app/permissions'
import {
  EditOutlined,
  EyeOutlined,
  LockFilled,
  LockKeyOpenIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@components/icons'
import { TagComponent, TooltipComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'

import { AccessActionButton } from '../components/AccessActionButton'
import { CompactTags } from '../components/CompactTags'
import type {
  AccessMerchant,
  AccessSubMerchant,
  MerchantRole,
  MerchantUser
} from '../types/merchantAccess.types'
import {
  formatAccessDate,
  getInitials,
  getRole,
  maskPhone
} from '../utils/merchantAccess.utils'
import {
  STATUS_COLORS,
  STATUS_LABELS
} from '../constants/merchantUserList.constants'

interface MerchantUserColumnOptions {
  page: number
  pageSize: number
  roles: readonly MerchantRole[]
  getMerchant: (id: string) => AccessMerchant | undefined
  getSubMerchant: (id: string) => AccessSubMerchant | undefined
  onView: (user: MerchantUser) => void
  onEdit: (user: MerchantUser) => void
  onAccess: (user: MerchantUser) => void
  onResetPassword: (user: MerchantUser) => void
  onStatus: (user: MerchantUser) => void
}

export const createMerchantUserColumns = ({
  page,
  pageSize,
  roles,
  getMerchant,
  getSubMerchant,
  onView,
  onEdit,
  onAccess,
  onResetPassword,
  onStatus
}: MerchantUserColumnOptions): NonNullable<
  TableComponentProps<MerchantUser>['columns']
> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _user, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Họ tên & Email',
    width: 235,
    render: (_, user) => (
      <button
        className='flex max-w-56 items-start gap-2 text-left'
        onClick={() => onView(user)}
        type='button'
      >
        <span
          aria-hidden
          className='flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'
        >
          {getInitials(user.name)}
        </span>
        <span className='min-w-0'>
          <span className='block truncate text-sm font-semibold text-foreground'>
            {user.name}
          </span>
          <span className='block truncate text-xs text-muted-foreground'>
            {user.email}
          </span>
          <span className='block whitespace-normal break-words text-xs font-medium text-primary lg:hidden'>
            {user.merchantIds
              .map((id) => getMerchant(id)?.name)
              .filter(Boolean)
              .join(' · ') || 'Chưa gán Merchant'}
          </span>
        </span>
      </button>
    )
  },
  {
    title: 'SĐT',
    width: 105,
    render: (_, user) => (
      <span className='font-mono text-xs text-muted-foreground'>
        {maskPhone(user.phone)}
      </span>
    )
  },
  {
    title: 'Merchant',
    width: 185,
    render: (_, user) =>
      user.merchantIds.length === 1 ? (
        <div>
          <span className='block max-w-40 truncate font-medium text-foreground'>
            {getMerchant(user.merchantIds[0])?.name ?? '—'}
          </span>
          <span className='text-xs text-muted-foreground'>
            {getMerchant(user.merchantIds[0])?.code}
          </span>
        </div>
      ) : (
        <CompactTags
          emptyLabel='Chưa gán Merchant'
          names={user.merchantIds
            .map((id) => getMerchant(id)?.name ?? '')
            .filter(Boolean)}
        />
      )
  },
  {
    title: 'Nhóm quyền',
    width: 180,
    render: (_, user) => (
      <CompactTags
        color='cyan'
        emptyLabel='Chưa phân quyền'
        names={user.roleIds
          .map((id) => getRole(roles, id)?.name ?? '')
          .filter(Boolean)}
      />
    )
  },
  {
    title: 'Sub-merchant',
    width: 180,
    render: (_, user) => (
      <CompactTags
        color='green'
        emptyLabel='Chưa gán Sub-MC'
        names={user.subMerchantIds
          .map((id) => getSubMerchant(id)?.name ?? '')
          .filter(Boolean)}
      />
    )
  },
  {
    title: 'Trạng thái',
    width: 130,
    render: (_, user) => (
      <TooltipComponent title={user.lockReason ?? STATUS_LABELS[user.status]}>
        <TagComponent color={STATUS_COLORS[user.status]}>
          {STATUS_LABELS[user.status]}
        </TagComponent>
      </TooltipComponent>
    )
  },
  {
    title: 'Ngày tạo',
    width: 150,
    render: (_, user) => (
      <span className='text-xs text-muted-foreground'>
        {formatAccessDate(user.createdAt)}
      </span>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 155,
    render: (_, user) => (
      <div className='flex items-center justify-center gap-1'>
        <Can
          screen='MERCHANT_USER'
          action='viewDetail'
        >
          <AccessActionButton
            icon={<EyeOutlined aria-hidden />}
            label={`Xem User ${user.name}`}
            onClick={() => onView(user)}
          />
        </Can>
        <Can
          screen='MERCHANT_USER'
          action='edit'
        >
          <AccessActionButton
            icon={<EditOutlined aria-hidden />}
            label={`Sửa User ${user.name}`}
            onClick={() => onEdit(user)}
          />
        </Can>
        <Can
          screen='MERCHANT_USER'
          action='update'
        >
          <AccessActionButton
            icon={
              <ShieldCheckIcon
                aria-hidden
                size={15}
              />
            }
            label={`Phân quyền User ${user.name}`}
            onClick={() => onAccess(user)}
          />
        </Can>
        <Can
          screen='MERCHANT_USER'
          action='resetPassword'
        >
          <AccessActionButton
            icon={
              <KeyIcon
                aria-hidden
                size={15}
              />
            }
            label={`Đặt lại mật khẩu User ${user.name}`}
            onClick={() => onResetPassword(user)}
          />
        </Can>
        {user.status !== 'PENDING' && (
          <Can
            screen='MERCHANT_USER'
            action='lock'
          >
            <AccessActionButton
              danger={user.status === 'ACTIVE'}
              icon={
                user.status === 'ACTIVE' ? (
                  <LockFilled aria-hidden />
                ) : (
                  <LockKeyOpenIcon
                    aria-hidden
                    size={15}
                  />
                )
              }
              label={`${user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} User ${user.name}`}
              onClick={() => onStatus(user)}
            />
          </Can>
        )}
      </div>
    )
  }
]
