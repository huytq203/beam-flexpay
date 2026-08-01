import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useResetAdminPasswordMutation } from '@services/authEndpoints'
import { useVerifyResetPasswordOtpMutation } from '@services/authEndpoints'
import type { OtpChallengeResponse, VerifyAdminOtpRequest } from '@type/auth'
import {
  isExpiredLinkError,
  toInvalidLinkMessage,
  toSubmitErrorMessage,
  type ResetMutationError
} from '../../password-reset-error'
import { ResetPasswordStatus } from '../constant/reset-status'
import { useVerifyResetToken } from './useVerifyResetToken'
import { OtpErrorKind, parseOtpError } from '../../shared/otp'

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
  otpChallenge: OtpChallengeResponse | null
  verifyOtp: (payload: VerifyAdminOtpRequest) => Promise<void>
  completeOtp: () => void
  cancelOtp: () => void
  invalidateOtp: (message: string) => void
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
  const [verifyResetOtp] = useVerifyResetPasswordOtpMutation()

  // Kết quả gửi mật khẩu đè lên kết quả verify khi đã có.
  const [submitStatus, setSubmitStatus] = useState<ResetPasswordStatus | null>(
    null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitInvalidMessage, setSubmitInvalidMessage] =
    useState<string | null>(null)
  const [otpChallenge, setOtpChallenge] =
    useState<OtpChallengeResponse | null>(null)

  const submit = useCallback(
    (newPassword: string, confirmPassword: string): void => {
      if (!token) {
        setSubmitStatus(ResetPasswordStatus.INVALID)
        return
      }
      setSubmitError(null)

      sendNewPassword({ token, newPassword, confirmPassword })
        .unwrap()
        .then((response) => {
          if (response?.requestId) {
            setOtpChallenge(response)
            setSubmitStatus(ResetPasswordStatus.AWAITING_OTP)
            return
          }
          setSubmitStatus(ResetPasswordStatus.SUCCESS)
          setSearchParams({}, { replace: true })
        })
        .catch((error: ResetMutationError) => {
          if (isExpiredLinkError(error)) {
            setSubmitInvalidMessage(toInvalidLinkMessage(error))
            setSubmitStatus(ResetPasswordStatus.INVALID)
            return
          }
          const otpError = parseOtpError(error)
          if (otpError.kind === OtpErrorKind.RECIPIENT_UNAVAILABLE) {
            setSubmitError(otpError.message)
            return
          }
          setSubmitError(toSubmitErrorMessage(error))
        })
    },
    [sendNewPassword, setSearchParams, token]
  )

  const clearSubmitError = useCallback((): void => setSubmitError(null), [])

  const verifyOtp = useCallback(
    async (payload: VerifyAdminOtpRequest): Promise<void> => {
      await verifyResetOtp(payload).unwrap()
    },
    [verifyResetOtp]
  )

  const completeOtp = useCallback((): void => {
    setOtpChallenge(null)
    setSubmitStatus(ResetPasswordStatus.SUCCESS)
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const cancelOtp = useCallback((): void => {
    setOtpChallenge(null)
    setSubmitStatus(null)
    setSubmitError(null)
  }, [])

  const invalidateOtp = useCallback((message: string): void => {
    setOtpChallenge(null)
    setSubmitInvalidMessage(message)
    setSubmitStatus(ResetPasswordStatus.INVALID)
  }, [])

  return {
    status: submitStatus ?? verifyStatus,
    isSubmitting,
    maskedEmail,
    invalidMessage: submitInvalidMessage ?? verifyInvalidMessage,
    submitError,
    submit,
    clearSubmitError,
    retryVerify,
    otpChallenge,
    verifyOtp,
    completeOtp,
    cancelOtp,
    invalidateOtp
  }
}
