import { useCallback, useEffect, useRef, useState } from 'react'
import { useValidateAdminResetTokenMutation } from '@services/authEndpoints'
import {
  DEFAULT_INVALID_LINK_MESSAGE,
  isServerUnavailableError,
  toInvalidLinkMessage,
  type ResetMutationError
} from '../../password-reset-error'
import { ResetPasswordStatus } from '../constant/reset-status'

/** Quá thời gian này mà máy chủ chưa trả lời thì coi như không kết nối được. */
const VERIFY_TIMEOUT = 20000

/** Trạng thái xuất phát khi vào màn, luôn xác thực token trước khi mở form. */
const getInitialStatus = (token: string): ResetPasswordStatus => {
  return token ? ResetPasswordStatus.VERIFYING : ResetPasswordStatus.INVALID
}

export interface UseVerifyResetTokenResult {
  verifyStatus: ResetPasswordStatus
  maskedEmail: string | null
  invalidMessage: string
  retryVerify: () => void
}

/** Hỏi BE xem token trong link email còn hiệu lực không. */
export function useVerifyResetToken(token: string): UseVerifyResetTokenResult {
  const [verifyToken] = useValidateAdminResetTokenMutation()
  const [verifyStatus, setVerifyStatus] = useState<ResetPasswordStatus>(() =>
    getInitialStatus(token)
  )
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null)
  const [invalidMessage, setInvalidMessage] = useState(
    DEFAULT_INVALID_LINK_MESSAGE
  )
  const [retryCount, setRetryCount] = useState(0)
  const verifiedTokenRef = useRef<string | null>(null)

  // URL đổi token giữa chừng: nắn trạng thái ngay trong render, không qua effect.
  const [trackedToken, setTrackedToken] = useState(token)
  if (token !== trackedToken) {
    setTrackedToken(token)
    setVerifyStatus(getInitialStatus(token))
    setMaskedEmail(null)
    setInvalidMessage(DEFAULT_INVALID_LINK_MESSAGE)
  }

  // Verify chạy một lần khi vào màn nên phải kích hoạt trong effect.
  useEffect(() => {
    if (!token || verifiedTokenRef.current === token) return
    verifiedTokenRef.current = token

    let isSettled = false
    const settle = (next: ResetPasswordStatus): void => {
      if (isSettled) return
      isSettled = true
      setVerifyStatus(next)
    }

    // Máy chủ có thể treo request thay vì trả lỗi — đừng để người dùng ngồi mãi.
    const timeoutId = window.setTimeout(
      () => settle(ResetPasswordStatus.UNREACHABLE),
      VERIFY_TIMEOUT
    )

    verifyToken(token)
      .unwrap()
      .then((response) => {
        if (!response.valid) {
          settle(ResetPasswordStatus.INVALID)
          return
        }
        setMaskedEmail(response.maskedEmail)
        settle(ResetPasswordStatus.READY)
      })
      .catch((error: ResetMutationError) => {
        if (isServerUnavailableError(error)) {
          settle(ResetPasswordStatus.UNREACHABLE)
          return
        }
        setInvalidMessage(toInvalidLinkMessage(error))
        settle(ResetPasswordStatus.INVALID)
      })

    return () => {
      isSettled = true
      window.clearTimeout(timeoutId)
    }
  }, [token, verifyToken, retryCount])

  const retryVerify = useCallback((): void => {
    verifiedTokenRef.current = null
    setMaskedEmail(null)
    setInvalidMessage(DEFAULT_INVALID_LINK_MESSAGE)
    setVerifyStatus(getInitialStatus(token))
    setRetryCount((count) => count + 1)
  }, [token])

  return { verifyStatus, maskedEmail, invalidMessage, retryVerify }
}
