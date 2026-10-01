import { useResendMerchantUserActivationMutation } from '@/app/services/merchantAccessApi'
import { DialogModal, feedback } from '@components/index'
import type { MerchantUser } from '../types/merchantAccess.types'

interface Props {
  user: MerchantUser
  onClose: () => void
}

const isNotPendingError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object' || !('data' in error)) return false
  const data = error.data
  return Boolean(
    data &&
      typeof data === 'object' &&
      'detail' in data &&
      data.detail === 'Activation can only be resent for a pending user'
  )
}

export function UserResendActivationDialog({ user, onClose }: Props) {
  const [resendActivation, { isLoading }] =
    useResendMerchantUserActivationMutation()
  const confirmResend = async (): Promise<void> => {
    try {
      await resendActivation(user.id).unwrap()
      feedback.success(
        'Đã tiếp nhận yêu cầu gửi lại liên kết kích hoạt. Liên kết cũ sẽ hết hiệu lực khi liên kết mới được gửi.'
      )
      onClose()
    } catch (error) {
      feedback.error(
        isNotPendingError(error)
          ? 'Trạng thái User đã thay đổi: chỉ có thể gửi lại liên kết kích hoạt cho User đang chờ kích hoạt. Hãy làm mới danh sách.'
          : 'Không thể gửi lại liên kết kích hoạt. Vui lòng thử lại.'
      )
    }
  }
  return (
    <DialogModal
      open
      title='Xác nhận gửi lại liên kết kích hoạt'
      okText='Gửi liên kết'
      okButtonProps={{ loading: isLoading }}
      onCancel={() => onClose()}
      onOk={() => void confirmResend()}
    >
      <div className='space-y-3 text-sm text-foreground'>
        <p>
          Gửi lại liên kết kích hoạt tài khoản cho <strong>{user.name}</strong>{' '}
          ({user.email})?
        </p>
        <p className='text-muted-foreground'>
          Liên kết cũ sẽ không còn dùng được khi liên kết mới được gửi.
        </p>
      </div>
    </DialogModal>
  )
}
