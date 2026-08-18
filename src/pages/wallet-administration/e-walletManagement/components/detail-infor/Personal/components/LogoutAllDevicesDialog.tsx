import { useRef, useState } from 'react'
import { WarningIcon } from '@components/icons'
import { DialogModal } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useLogoutAllCustomerDevicesMutation } from '@services/apiUserDevices'
import type { AdminTrustedDevice } from '../../../../schemas/Security.schema'

interface LogoutAllDevicesDialogProps {
  userId: string
  devices: AdminTrustedDevice[]
  open: boolean
  onClose: () => void
}

const getLogoutErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    if (error.status === 'FETCH_ERROR') {
      return 'Không kết nối được máy chủ. Kiểm tra kết nối rồi thử lại.'
    }
    if (error.status === 403) {
      return 'Bạn không có quyền đăng xuất thiết bị của người dùng này.'
    }
  }
  return 'Không thể đăng xuất các thiết bị. Vui lòng thử lại.'
}

export const LogoutAllDevicesDialog = ({
  userId,
  devices,
  open,
  onClose
}: LogoutAllDevicesDialogProps) => {
  const submittingRef = useRef(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { successMess } = useMessage()
  const [logoutAllDevices, { isLoading }] =
    useLogoutAllCustomerDevicesMutation()
  const activeDeviceCount = devices.filter(
    (device) => device.status === 'ACTIVE' && !device.expired
  ).length

  const handleClose = (): void => {
    if (isLoading) return
    setSubmitError(null)
    onClose()
  }

  const handleConfirm = async (): Promise<void> => {
    if (submittingRef.current || isLoading) return

    submittingRef.current = true
    setSubmitError(null)
    try {
      const result = await logoutAllDevices(userId).unwrap()
      successMess(
        result.revokedDeviceCount > 0
          ? `Đã đăng xuất và thu hồi ${result.revokedDeviceCount} thiết bị`
          : 'Đã xóa phiên đăng nhập hiện tại'
      )
      onClose()
    } catch (error) {
      setSubmitError(getLogoutErrorMessage(error))
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <DialogModal
      mode='DELETE'
      open={open}
      title='Xác nhận đăng xuất tất cả thiết bị'
      okText='Đăng xuất tất cả'
      confirmLoading={isLoading}
      cancelButtonProps={{ disabled: isLoading }}
      onOk={handleConfirm}
      onCancel={handleClose}
      content={
        <div className='space-y-4 py-1'>
          <div className='flex items-start gap-3'>
            <span className='inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700'>
              <WarningIcon size={22} weight='fill' aria-hidden />
            </span>
            <div className='min-w-0'>
              <p className='font-semibold text-slate-900'>
                Thu hồi phiên đăng nhập trên mọi thiết bị?
              </p>
              <p className='mt-1 text-sm leading-6 text-slate-600'>
                {activeDeviceCount} thiết bị đang tin cậy sẽ bị thu hồi. Người
                dùng phải đăng nhập và xác thực OTP lại trên thiết bị tiếp theo.
              </p>
            </div>
          </div>

          <div className='rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900'>
            Đăng ký FaceID được giữ nguyên, nhưng không thể sử dụng cho đến khi
            thiết bị được tin cậy lại.
          </div>

          {submitError && (
            <p
              className='rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800'
              role='alert'
            >
              {submitError}
            </p>
          )}
        </div>
      }
    />
  )
}
