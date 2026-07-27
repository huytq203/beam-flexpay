import { useCallback, useEffect, useRef, useState } from 'react'
import { useUserVerifyTokenMutation } from '@services/cmsService'
import { isNetworkError, type ResetMutationError } from '../reset-error'
import { IS_TOKEN_VERIFY_ENABLED } from '../constant/constants'
import { ResetPasswordStatus } from '../constant/reset-status'

/** Quá thời gian này mà máy chủ chưa trả lời thì coi như không kết nối được. */
const VERIFY_TIMEOUT = 20000

/** Trạng thái xuất phát khi vào màn, tuỳ theo BE đã có API verify hay chưa. */
const getInitialStatus = (token: string): ResetPasswordStatus => {
  if (!IS_TOKEN_VERIFY_ENABLED) return ResetPasswordStatus.READY
  return token ? ResetPasswordStatus.VERIFYING : ResetPasswordStatus.INVALID
}

export interface UseVerifyResetTokenResult {
  verifyStatus: ResetPasswordStatus
  retryVerify: () => void
}

/** Hỏi BE xem token trong link email còn hiệu lực không. */
export function useVerifyResetToken(token: string): UseVerifyResetTokenResult {
  const [verifyToken] = useUserVerifyTokenMutation()
  const [verifyStatus, setVerifyStatus] = useState<ResetPasswordStatus>(() =>
    getInitialStatus(token)
  )
  const [retryCount, setRetryCount] = useState(0)
  const verifiedTokenRef = useRef<string | null>(null)

  // URL đổi token giữa chừng: nắn trạng thái ngay trong render, không qua effect.
  const [trackedToken, setTrackedToken] = useState(token)
  if (token !== trackedToken) {
    setTrackedToken(token)
    setVerifyStatus(getInitialStatus(token))
  }

  // Verify là POST chạy một lần khi vào màn nên phải kích hoạt trong effect.
  useEffect(() => {
    if (!IS_TOKEN_VERIFY_ENABLED) return
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

    verifyToken({ token })
      .unwrap()
      // Endpoint trả boolean: `false` cũng là token không dùng được.
      .then((isValid) =>
        settle(
          isValid === false
            ? ResetPasswordStatus.INVALID
            : ResetPasswordStatus.READY
        )
      )
      .catch((error: ResetMutationError) =>
        settle(
          isNetworkError(error)
            ? ResetPasswordStatus.UNREACHABLE
            : ResetPasswordStatus.INVALID
        )
      )

    return () => {
      isSettled = true
      window.clearTimeout(timeoutId)
    }
  }, [token, verifyToken, retryCount])

  const retryVerify = useCallback((): void => {
    verifiedTokenRef.current = null
    setVerifyStatus(getInitialStatus(token))
    setRetryCount((count) => count + 1)
  }, [token])

  return { verifyStatus, retryVerify }
}
