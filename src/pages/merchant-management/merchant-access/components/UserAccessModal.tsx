import { useState } from 'react'

import { useAssignMerchantUserGroupsMutation } from '@/app/services/merchantAccessApi'
import {
  ButtonComponent,
  DialogModal,
  MultiPickerTrigger,
  feedback
} from '@components/index'

import { useAccessMerchants } from '../hooks/useAccessMerchants'
import type { MerchantRole, MerchantUser } from '../types/merchantAccess.types'
import { roleAvailableToUser } from '../utils/merchantAccess.utils'
import {
  MerchantGroupPickerDialog,
  type PickedGroup
} from './MerchantGroupPickerDialog'

interface UserAccessModalProps {
  user: MerchantUser
  roles: readonly MerchantRole[]
  onClose: () => void
}

// Nhóm đang gán có thể nằm ngoài trang nhóm quyền tải sẵn: khi đó hiện id.
const toInitialGroups = (
  user: MerchantUser,
  roles: readonly MerchantRole[]
): PickedGroup[] =>
  user.roleIds.flatMap((id) => {
    const role = roles.find((item) => item.id === id)
    if (role && !roleAvailableToUser(role, user)) return []
    return [
      {
        id,
        code: role?.code ?? '',
        name: role?.name ?? id,
        merchantId: role?.merchantId ?? null
      }
    ]
  })

/** Chỉ gán nhóm quyền; phạm vi Merchant/Sub-merchant đổi ở form Sửa User (qua duyệt). */
export function UserAccessModal({
  user,
  roles,
  onClose
}: UserAccessModalProps) {
  const { getMerchant } = useAccessMerchants()
  const [assignGroups, { isLoading }] = useAssignMerchantUserGroupsMutation()
  const [groups, setGroups] = useState(() => toInitialGroups(user, roles))
  const [isPicking, setIsPicking] = useState(false)
  const singleMerchantId =
    user.merchantIds.length === 1 ? user.merchantIds[0] : undefined

  const save = async (): Promise<void> => {
    try {
      await assignGroups({
        id: user.id,
        ids: groups.map((group) => group.id)
      }).unwrap()
      feedback.success('Đã cập nhật nhóm quyền User')
      onClose()
    } catch {
      feedback.error('Không thể cập nhật nhóm quyền User')
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
            loading={isLoading}
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
      <div className='space-y-4'>
        <div className='rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground'>
          {user.email} ·{' '}
          {user.merchantIds
            .map((id) => getMerchant(id)?.name)
            .filter(Boolean)
            .join(', ')}
        </div>
        <MultiPickerTrigger
          id='merchant-user-roles'
          label='Nhóm quyền'
          entityLabel='nhóm quyền'
          selected={groups}
          placeholder='Chưa gán nhóm quyền'
          onOpen={() => setIsPicking(true)}
          onRemove={(id) =>
            setGroups((current) => current.filter((item) => item.id !== id))
          }
        />
        {user.merchantIds.length > 1 && (
          <p className='text-xs text-muted-foreground'>
            User quản lý nhiều Merchant chỉ dùng nhóm quyền dùng chung.
          </p>
        )}
        <p className='text-xs text-muted-foreground'>
          Sub-merchant được truy cập đổi tại nút Sửa User; thay đổi phạm vi cần
          một quản trị viên khác duyệt.
        </p>
      </div>
      <MerchantGroupPickerDialog
        open={isPicking}
        merchantId={singleMerchantId}
        selected={groups}
        getMerchant={getMerchant}
        onCancel={() => setIsPicking(false)}
        onConfirm={(next) => {
          setGroups(next)
          setIsPicking(false)
        }}
      />
    </DialogModal>
  )
}
