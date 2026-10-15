import { useState } from 'react'
import {
  useLockMerchantUserMutation,
  useUnlockMerchantUserMutation
} from '@/app/services/merchantAccessApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import type {
  AccessMerchant,
  MerchantUser
} from '../types/merchantAccess.types'

interface Props {
  user: MerchantUser
  getMerchant: (id: string) => AccessMerchant | undefined
  onClose: () => void
}

export function UserStatusDialog({ user, getMerchant, onClose }: Props) {
  const [lockReason, setLockReason] = useState('')
  const [lockUser, { isLoading: isLocking }] = useLockMerchantUserMutation()
  const [unlockUser, { isLoading: isUnlocking }] =
    useUnlockMerchantUserMutation()
  const confirmStatus = async (): Promise<void> => {
    if (user.status === 'ACTIVE' && lockReason.trim().length < 10) {
      feedback.warning('Lý do khóa cần tối thiểu 10 ký tự')
      return
    }
    try {
      if (user.status === 'ACTIVE')
        await lockUser({ id: user.id, reason: lockReason.trim() }).unwrap()
      else await unlockUser(user.id).unwrap()
      feedback.success('Đã cập nhật trạng thái User')
      onClose()
    } catch {
      feedback.error('Không thể cập nhật trạng thái User')
    }
  }
  return (
    <DialogModal
      onCancel={() => {
        onClose()
        setLockReason('')
      }}
      onOk={() => void confirmStatus()}
      okButtonProps={{ loading: isLocking || isUnlocking }}
      okText={user.status === 'ACTIVE' ? 'Khóa User' : 'Mở khóa User'}
      mode={user.status === 'ACTIVE' ? 'DELETE' : 'CONFIRM'}
      open
      title={`${user.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'} User`}
    >
      <p className='mb-3 text-sm text-foreground'>
        Xác nhận {user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'}{' '}
        <strong>{user.name}</strong> ({user.email}) thuộc{' '}
        {user.merchantIds
          .map((id) => {
            const merchant = getMerchant(id)
            return merchant ? `${merchant.name} (${merchant.code})` : null
          })
          .filter(Boolean)
          .join(', ')}
        ?
      </p>
      {user.status === 'ACTIVE' && (
        <>
          <p className='mb-2 text-sm text-danger-strong'>
            User sẽ không thể đăng nhập cho đến khi được mở khóa.
          </p>
          <label
            className='mb-1 block text-sm font-medium text-foreground'
            htmlFor='merchant-user-lock-reason'
          >
            Lý do khóa <span className='text-danger-strong'>*</span>
          </label>
          <TextArea
            id='merchant-user-lock-reason'
            aria-label='Lý do khóa User'
            maxLength={300}
            onChange={(event) => setLockReason(event.target.value)}
            placeholder='Lý do khóa User'
            rows={3}
            value={lockReason}
          />
        </>
      )}
    </DialogModal>
  )
}
