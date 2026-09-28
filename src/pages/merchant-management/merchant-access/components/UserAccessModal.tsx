import { useAccessLookups } from '../hooks/useAccessLookups'
import { useState } from 'react'

import {
  ButtonComponent,
  DialogModal,
  SelectComponent,
  feedback
} from '@components/index'
import {
  useAssignMerchantUserGroupsMutation,
  useAssignMerchantUserSubMerchantsMutation
} from '@/app/services/merchantAccessApi'

import type { MerchantRole, MerchantUser } from '../types/merchantAccess.types'
import { roleAvailableToUser } from '../utils/merchantAccess.utils'

export function UserAccessModal({
  user,
  roles,
  onClose
}: {
  user: MerchantUser
  roles: readonly MerchantRole[]
  onClose: () => void
}) {
  const { merchants, subMerchants } = useAccessLookups()
  const getMerchant = (id: string) =>
    merchants.find((merchant) => merchant.id === id)
  const [assignGroups, { isLoading: isAssigningGroups }] =
    useAssignMerchantUserGroupsMutation()
  const [assignSubs, { isLoading: isAssigningSubs }] =
    useAssignMerchantUserSubMerchantsMutation()
  const availableRoles = roles.filter((role) => roleAvailableToUser(role, user))
  const availableSubs = subMerchants.filter((sub) =>
    user.merchantIds.includes(sub.merchantId)
  )
  const [roleIds, setRoleIds] = useState(
    user.roleIds.filter((id) => availableRoles.some((role) => role.id === id))
  )
  const [subMerchantIds, setSubMerchantIds] = useState(
    user.subMerchantIds.filter((id) =>
      availableSubs.some((sub) => sub.id === id)
    )
  )

  const save = async (): Promise<void> => {
    try {
      await assignGroups({ id: user.id, ids: roleIds }).unwrap()
      await assignSubs({ id: user.id, ids: subMerchantIds }).unwrap()
      feedback.success('Đã cập nhật phân quyền User')
      onClose()
    } catch {
      feedback.error('Không thể cập nhật phân quyền User')
    }
  }

  return (
    <DialogModal
      footer={
        <div className='flex justify-end gap-2'>
          <ButtonComponent
            content='Hủy'
            htmlType='button'
            onClick={onClose}
            type='default'
          />
          <ButtonComponent
            loading={isAssigningGroups || isAssigningSubs}
            content='Lưu phân quyền'
            htmlType='button'
            onClick={() => void save()}
          />
        </div>
      }
      onCancel={onClose}
      onOk={() => void save()}
      open
      title={`Phân quyền · ${user.name}`}
      width={{ xs: 'calc(100vw - 24px)', md: 680 }}
    >
      <div className='space-y-5'>
        <div className='rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground'>
          {user.email} ·{' '}
          {user.merchantIds
            .map((id) => getMerchant(id)?.name)
            .filter(Boolean)
            .join(', ')}
        </div>
        <div className='space-y-2'>
          <label
            className='block text-sm font-medium text-foreground'
            htmlFor='merchant-user-roles'
          >
            Nhóm quyền
          </label>
          <SelectComponent<string[]>
            id='merchant-user-roles'
            mode='multiple'
            onChange={setRoleIds}
            options={availableRoles.map((role) => ({
              label: `${role.name}${role.merchantId ? ` · ${getMerchant(role.merchantId)?.name}` : ' · Dùng chung'}`,
              value: role.id
            }))}
            placeholder='Chọn nhóm quyền'
            value={roleIds}
            className='w-full'
          />
          {user.merchantIds.length > 1 && (
            <p className='text-xs text-muted-foreground'>
              User quản lý nhiều Merchant chỉ dùng nhóm quyền dùng chung.
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <label
            className='block text-sm font-medium text-foreground'
            htmlFor='merchant-user-subs'
          >
            Sub-merchant được truy cập
          </label>
          <SelectComponent<string[]>
            id='merchant-user-subs'
            mode='multiple'
            onChange={setSubMerchantIds}
            options={availableSubs.map((sub) => ({
              label: `${sub.name} · ${getMerchant(sub.merchantId)?.name}`,
              value: sub.id
            }))}
            placeholder='Chọn Sub-merchant'
            value={subMerchantIds}
            className='w-full'
          />
          <p className='text-xs text-muted-foreground'>
            Không chọn Sub-merchant nghĩa là User chưa được gán phạm vi dữ liệu.
          </p>
        </div>
      </div>
    </DialogModal>
  )
}
