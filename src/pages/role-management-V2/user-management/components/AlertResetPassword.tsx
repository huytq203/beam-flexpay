import { memo, useRef, useState } from 'react'
import { ButtonComponent } from '@components/index'
import {
  CheckCircleFilled,
  ClockIcon,
  EnvelopeIcon,
  KeyIcon,
  WarningIcon
} from '@components/icons'
import { useResetManagerPasswordMutation } from '@services/apiUserManagement'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'
import type { UserInfor } from '@type/userManagement'
import type { AdminResetPasswordResponse } from '../types/UserManagement.type'

interface Props {
  user: UserInfor
  onCancel: () => void
  onLoadingChange?: (loading: boolean) => void
}

const getResetErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    if (error.status === 'FETCH_ERROR') {
      return 'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
    }

    if (error.status === 429) {
      return 'Tài khoản này vừa được gửi liên kết đặt lại mật khẩu. Vui lòng chờ trước khi gửi lại.'
    }
  }

  return (
    getApiErrorDetail(error) ??
    'Không thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại.'
  )
}

const AlertResetPassword = ({ user, onCancel, onLoadingChange }: Props) => {
  const submittingRef = useRef(false)
  const [result, setResult] = useState<AdminResetPasswordResponse | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [resetManagerPassword, { isLoading }] =
    useResetManagerPasswordMutation()

  const displayName =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username

  const handleResetPassword = async (): Promise<void> => {
    if (submittingRef.current || isLoading) return

    submittingRef.current = true
    setSubmitError(null)
    onLoadingChange?.(true)

    try {
      const response = await resetManagerPassword(user.id).unwrap()
      setResult(response.data)
    } catch (error) {
      setSubmitError(getResetErrorMessage(error))
    } finally {
      submittingRef.current = false
      onLoadingChange?.(false)
    }
  }

  if (result) {
    return (
      <div
        className='flex flex-col gap-5 px-1 py-2 sm:px-2'
        aria-live='polite'
      >
        <div className='flex items-start gap-3'>
          <CheckCircleFilled
            className='mt-0.5 shrink-0 text-3xl text-emerald-600'
            aria-hidden
          />
          <div className='min-w-0'>
            <h3 className='m-0 text-base font-semibold text-slate-900'>
              Đã gửi liên kết đặt lại mật khẩu
            </h3>
            <p className='mt-1 break-words text-sm leading-6 text-slate-600'>
              Email đã được gửi tới <strong>{result.maskedEmail}</strong>. Liên
              kết có hiệu lực trong {result.expiresInHours} giờ.
            </p>
          </div>
        </div>

        <div className='rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900'>
          Các liên kết đặt lại trước đó không còn hiệu lực. Hệ thống cũng đã yêu
          cầu thu hồi các phiên đăng nhập hiện tại của tài khoản.
        </div>

        <div className='flex justify-end'>
          <ButtonComponent
            type='primary'
            content='Hoàn tất'
            onClick={onCancel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-5 px-1 py-2 sm:px-2'>
      <div className='flex items-start gap-3'>
        <span className='inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700'>
          <WarningIcon size={22} weight='fill' aria-hidden />
        </span>
        <div className='min-w-0'>
          <h3 className='m-0 text-base font-semibold text-slate-900'>
            Gửi liên kết mới cho {displayName}?
          </h3>
          <p className='mt-1 break-words text-sm leading-6 text-slate-600'>
            Người nhận sẽ đặt mật khẩu mới qua liên kết trong email và bước xác
            thực OTP. Mật khẩu chưa thay đổi ở bước này.
          </p>
        </div>
      </div>

      <dl className='grid grid-cols-1 gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm sm:grid-cols-2'>
        <div className='min-w-0'>
          <dt className='flex items-center gap-1.5 font-medium text-slate-600'>
            <EnvelopeIcon size={16} aria-hidden /> Email người nhận
          </dt>
          <dd className='mt-1 break-all font-semibold text-slate-900'>
            {user.email}
          </dd>
        </div>
        <div>
          <dt className='flex items-center gap-1.5 font-medium text-slate-600'>
            <ClockIcon size={16} aria-hidden /> Hiệu lực liên kết
          </dt>
          <dd className='mt-1 font-semibold text-slate-900'>24 giờ</dd>
        </div>
      </dl>

      <ul className='m-0 space-y-2 ps-5 text-sm leading-6 text-slate-700'>
        <li>Mọi liên kết đặt lại mật khẩu cũ sẽ bị vô hiệu hóa.</li>
        <li>Phiên đăng nhập hiện tại sẽ được thu hồi sau khi gửi email.</li>
        <li>Không thể dùng thao tác này cho chính tài khoản đang đăng nhập.</li>
      </ul>

      {submitError && (
        <p
          className='m-0 rounded-lg bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-800'
          role='alert'
        >
          {submitError}
        </p>
      )}

      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
        <ButtonComponent
          type='default'
          content='Hủy'
          className='w-full sm:w-auto'
          disabled={isLoading}
          onClick={onCancel}
        />
        <ButtonComponent
          aria-label='Gửi liên kết đặt lại'
          type='primary'
          content='Gửi liên kết đặt lại'
          icon={<KeyIcon aria-hidden />}
          className='w-full sm:w-auto'
          loading={isLoading}
          disabled={isLoading}
          onClick={handleResetPassword}
        />
      </div>
    </div>
  )
}

export default memo(AlertResetPassword)
