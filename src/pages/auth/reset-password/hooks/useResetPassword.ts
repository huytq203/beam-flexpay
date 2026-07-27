import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useUserNewPasswordMutation } from '@services/cmsService'
import {
  isExpiredLinkError,
  toSubmitErrorMessage,
  type ResetMutationError
} from '../reset-error'
import { IS_TOKEN_VERIFY_ENABLED } from '../constant/constants'
import { ResetPasswordStatus } from '../constant/reset-status'
import { useVerifyResetToken } from './useVerifyResetToken'

export { ResetPasswordStatus } from '../constant/reset-status'

export interface UseResetPasswordResult {
  status: ResetPasswordStatus
  isSubmitting: boolean
  submitError: string | null
  submit: (newPassword: string) => void
  clearSubmitError: () => void
  retryVerify: () => void
}

/**
 * Toàn bộ chỗ chạm API của luồng đặt lại mật khẩu. Component chỉ đọc `status`.
 * BE: `POST /user/verify-token?token=` và `POST /user/new-password?token=`.
 */
export function useResetPassword(): UseResetPasswordResult {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const { verifyStatus, retryVerify } = useVerifyResetToken(token)
  const [sendNewPassword, { isLoading: isSubmitting }] =
    useUserNewPasswordMutation()

  // Kết quả gửi mật khẩu đè lên kết quả verify khi đã có.
  const [submitStatus, setSubmitStatus] = useState<ResetPasswordStatus | null>(
    null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const submit = useCallback(
    (newPassword: string): void => {
      // Khi chưa bật verify, cứ để BE trả lỗi thay vì chặn ở client.
      if (IS_TOKEN_VERIFY_ENABLED && !token) {
        setSubmitStatus(ResetPasswordStatus.INVALID)
        return
      }
      setSubmitError(null)

      sendNewPassword({ token, userNewPassword: { newPassword } })
        .unwrap()
        .then(() => setSubmitStatus(ResetPasswordStatus.SUCCESS))
        .catch((error: ResetMutationError) => {
          // Token có thể hết hạn ngay giữa lúc người dùng đang gõ.
          if (isExpiredLinkError(error)) {
            setSubmitStatus(ResetPasswordStatus.INVALID)
            return
          }
          setSubmitError(toSubmitErrorMessage(error))
        })
    },
    [sendNewPassword, token]
  )

  const clearSubmitError = useCallback((): void => setSubmitError(null), [])

  return {
    status: submitStatus ?? verifyStatus,
    isSubmitting,
    submitError,
    submit,
    clearSubmitError,
    retryVerify
  }
}
