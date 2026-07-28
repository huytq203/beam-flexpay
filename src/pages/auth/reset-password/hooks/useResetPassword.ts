import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useResetAdminPasswordMutation } from '@services/authEndpoints'
import {
  isExpiredLinkError,
  toInvalidLinkMessage,
  toSubmitErrorMessage,
  type ResetMutationError
} from '../../password-reset-error'
import { ResetPasswordStatus } from '../constant/reset-status'
import { useVerifyResetToken } from './useVerifyResetToken'

export { ResetPasswordStatus } from '../constant/reset-status'

export interface UseResetPasswordResult {
  status: ResetPasswordStatus
  isSubmitting: boolean
  maskedEmail: string | null
  invalidMessage: string
  submitError: string | null
  submit: (newPassword: string, confirmPassword: string) => void
  clearSubmitError: () => void
  retryVerify: () => void
}

/**
 * Toàn bộ chỗ chạm API của luồng đặt lại mật khẩu. Component chỉ đọc `status`.
 * BE: `GET /auth/reset-password/validate?token=` và
 * `POST /auth/reset-password`.
 */
export function useResetPassword(): UseResetPasswordResult {
  const [searchParams, setSearchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const {
    verifyStatus,
    maskedEmail,
    invalidMessage: verifyInvalidMessage,
    retryVerify
  } = useVerifyResetToken(token)
  const [sendNewPassword, { isLoading: isSubmitting }] =
    useResetAdminPasswordMutation()

  // Kết quả gửi mật khẩu đè lên kết quả verify khi đã có.
  const [submitStatus, setSubmitStatus] = useState<ResetPasswordStatus | null>(
    null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitInvalidMessage, setSubmitInvalidMessage] =
    useState<string | null>(null)

  const submit = useCallback(
    (newPassword: string, confirmPassword: string): void => {
      if (!token) {
        setSubmitStatus(ResetPasswordStatus.INVALID)
        return
      }
      setSubmitError(null)

      sendNewPassword({ token, newPassword, confirmPassword })
        .unwrap()
        .then(() => {
          setSubmitStatus(ResetPasswordStatus.SUCCESS)
          setSearchParams({}, { replace: true })
        })
        .catch((error: ResetMutationError) => {
          if (isExpiredLinkError(error)) {
            setSubmitInvalidMessage(toInvalidLinkMessage(error))
            setSubmitStatus(ResetPasswordStatus.INVALID)
            return
          }
          setSubmitError(toSubmitErrorMessage(error))
        })
    },
    [sendNewPassword, setSearchParams, token]
  )

  const clearSubmitError = useCallback((): void => setSubmitError(null), [])

  return {
    status: submitStatus ?? verifyStatus,
    isSubmitting,
    maskedEmail,
    invalidMessage: submitInvalidMessage ?? verifyInvalidMessage,
    submitError,
    submit,
    clearSubmitError,
    retryVerify
  }
}
