import { UnlockOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useUnlockCustomerMutation } from '@services/apiUserDevices'

interface DialogUnlockLoginProps {
  ownerId?: string
  ownerName?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const DialogUnlockLogin = ({
  ownerId,
  ownerName,
  onSuccess,
  onCancel
}: DialogUnlockLoginProps) => {
  const { successMess } = useMessage()
  const [unlockCustomer, { isLoading }] = useUnlockCustomerMutation()

  const handleConfirm = async () => {
    if (!ownerId) return
    try {
      await unlockCustomer(ownerId).unwrap()
      successMess('Mở khóa đăng nhập thành công')
      onSuccess?.()
    } catch {
      // Base query đã hiển thị thông báo lỗi.
    }
  }

  return (
    <div>
      <div className='flex-between mb-3 rounded-md border border-green-200 bg-green-50 p-3'>
        <span className='flex items-center gap-2 font-medium text-green-700'>
          <UnlockOutlined />
          Mở khóa đăng nhập: <strong>{ownerName ?? '--'}</strong>
        </span>
      </div>

      <div className='rounded-md bg-blue-50 p-3 text-sm text-blue-700'>
        Dùng khi người dùng bị khóa đăng nhập do nhập sai mật khẩu hoặc OTP
        nhiều lần. Sau khi mở khóa, <strong>{ownerName ?? '--'}</strong> có thể
        đăng nhập lại trên app và bộ đếm nhập sai được đặt về 0. Thao tác này
        không ảnh hưởng đến trạng thái khóa ví.
      </div>

      <div className='mt-4 flex justify-end gap-2'>
        <ButtonComponent
          type='default'
          content='Hủy'
          onClick={onCancel}
        />
        <ButtonComponent
          loading={isLoading}
          content='Xác nhận mở khóa'
          onClick={handleConfirm}
        />
      </div>
    </div>
  )
}

export default DialogUnlockLogin
