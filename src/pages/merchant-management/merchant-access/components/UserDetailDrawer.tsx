import { useAccessMerchants } from '../hooks/useAccessMerchants'
import { DrawerComponent, TagComponent } from '@components/index'

import type { MerchantRole, MerchantUser } from '../types/merchantAccess.types'
import {
  formatAccessDate,
  getRole,
  maskPhone
} from '../utils/merchantAccess.utils'

export function UserDetailDrawer({
  user,
  roles,
  onClose
}: {
  user: MerchantUser
  roles: readonly MerchantRole[]
  onClose: () => void
}) {
  const { getMerchant, getSubMerchant } = useAccessMerchants()
  return (
    <DrawerComponent
      onClose={onClose}
      open
      title='Chi tiết User Merchant'
      width='min(100vw, 520px)'
    >
      <div className='space-y-6'>
        <div className='border-b border-border pb-4'>
          <h2 className='font-display text-lg font-semibold text-foreground'>
            {user.name}
          </h2>
          <p className='text-sm text-muted-foreground'>{user.email}</p>
        </div>
        <section className='space-y-3'>
          <h3 className='font-semibold text-foreground'>Thông tin tài khoản</h3>
          <dl className='grid grid-cols-[8rem_1fr] gap-2 text-sm'>
            <dt className='text-muted-foreground'>Số điện thoại</dt>
            <dd>{maskPhone(user.phone)}</dd>
            <dt className='text-muted-foreground'>Trạng thái</dt>
            <dd>
              {user.status === 'ACTIVE'
                ? 'Hoạt động'
                : user.status === 'LOCKED'
                  ? 'Bị khóa'
                  : 'Chờ kích hoạt'}
            </dd>
            <dt className='text-muted-foreground'>Ngày tạo</dt>
            <dd>{formatAccessDate(user.createdAt)}</dd>
          </dl>
        </section>
        <section className='space-y-2'>
          <h3 className='font-semibold text-foreground'>
            Merchant trong phạm vi
          </h3>
          <div className='flex flex-wrap gap-1'>
            {user.merchantIds.map((id) => (
              <TagComponent key={id}>
                {getMerchant(id)?.code} · {getMerchant(id)?.name}
              </TagComponent>
            ))}
          </div>
        </section>
        <section className='space-y-2'>
          <h3 className='font-semibold text-foreground'>Nhóm quyền</h3>
          <div className='flex flex-wrap gap-1'>
            {user.roleIds.length ? (
              user.roleIds.map((id) => (
                <TagComponent
                  key={id}
                  color='cyan'
                >
                  {getRole(roles, id)?.name ?? 'Nhóm không còn tồn tại'}
                </TagComponent>
              ))
            ) : (
              <p className='text-sm text-danger-strong'>Chưa phân quyền</p>
            )}
          </div>
        </section>
        <section className='space-y-2'>
          <h3 className='font-semibold text-foreground'>
            Sub-merchant được gán
          </h3>
          <div className='flex flex-wrap gap-1'>
            {user.subMerchantIds.length ? (
              user.subMerchantIds.map((id) => (
                <TagComponent key={id}>
                  {getSubMerchant(id)?.name ?? 'Sub-merchant không còn tồn tại'}
                </TagComponent>
              ))
            ) : (
              <p className='text-sm text-warning-strong'>
                Chưa gán Sub-merchant
              </p>
            )}
          </div>
        </section>
      </div>
    </DrawerComponent>
  )
}
