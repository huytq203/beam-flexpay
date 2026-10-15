import { useResetMerchantUserPasswordMutation } from '@/app/services/merchantAccessApi'
import { DialogModal, feedback } from '@components/index'
import type {
  AccessMerchant,
  MerchantUser
} from '../types/merchantAccess.types'

interface Props {
  user: MerchantUser
  getMerchant: (id: string) => AccessMerchant | undefined
  onClose: () => void
}

export function UserResetPasswordDialog({ user, getMerchant, onClose }: Props) {
  const [resetPassword, { isLoading: isResetting }] =
    useResetMerchantUserPasswordMutation()
  const confirmReset = async (): Promise<void> => {
    try {
      await resetPassword(user.id).unwrap()
      feedback.success('Đã gửi hướng dẫn đặt lại mật khẩu cho User')
      onClose()
    } catch {
      feedback.error('Không thể đặt lại mật khẩu User. Vui lòng thử lại.')
    }
  }
  return (
    <DialogModal
      open
      title='Xác nhận đặt lại mật khẩu'
      okText='Gửi hướng dẫn'
      okButtonProps={{ loading: isResetting }}
      onCancel={() => onClose()}
      onOk={() => void confirmReset()}
    >
      <div className='space-y-3 text-sm text-foreground'>
        <p>
          Gửi hướng dẫn đặt lại mật khẩu cho <strong>{user.name}</strong> (
          {user.email})?
        </p>
        <p className='text-muted-foreground'>
          Merchant:{' '}
          {user.merchantIds
            .map((id) => getMerchant(id)?.name)
            .filter(Boolean)
            .join(', ') || 'Chưa gán'}
          .
        </p>
      </div>
    </DialogModal>
  )
}
