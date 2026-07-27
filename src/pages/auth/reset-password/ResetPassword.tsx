/**
 * THESIS: đặt lại mật khẩu là một thủ tục bảo mật có điều kiện, không phải hai ô
 * input — điều kiện hiện ngay từ ký tự đầu, tình trạng liên kết luôn nói rõ.
 * OWN-WORLD: kế thừa thế giới auth đang có — nền trắng, cột 420px, teal #2bd9d0,
 * chữ teal đậm trên nút sáng, bo 10px.
 * FIRST VIEWPORT: đĩa khóa teal → tiêu đề → hai ô mật khẩu → bảng 5 điều kiện
 * tick trực tiếp → nút chính chiếm hết chiều ngang.
 * FORM: năm trạng thái trong một cột duy nhất, mở rộng surface auth sẵn có.
 */

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'
import { useResetPassword, ResetPasswordStatus } from './hooks/useResetPassword'
import { useEntranceAnimation } from './hooks/useEntranceAnimation'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import {
  InvalidLinkState,
  SuccessState,
  UnreachableState,
  VerifyingState
} from './components/ResetPasswordStates'

/** Số giây đếm ngược trước khi tự đưa người dùng về trang đăng nhập. */
const REDIRECT_SECONDS = 5

export function ResetPassword() {
  const navigate = useNavigate()
  const { status, isSubmitting, submitError, submit, clearSubmitError, retryVerify } =
    useResetPassword()

  const rootRef = useRef<HTMLDivElement>(null)
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  useEntranceAnimation(rootRef, status)

  useEffect(() => {
    if (status !== ResetPasswordStatus.SUCCESS) return

    const countdown = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)
    const redirect = window.setTimeout(
      () => navigate(PATHS.AUTH.LOGIN, { replace: true }),
      REDIRECT_SECONDS * 1000
    )

    return () => {
      window.clearInterval(countdown)
      window.clearTimeout(redirect)
    }
  }, [status, navigate])

  const goToLogin = (): void => {
    void navigate(PATHS.AUTH.LOGIN, { replace: true })
  }
  const goToForgotPassword = (): void => {
    void navigate(PATHS.AUTH.FORGOT_PASSWORD)
  }

  return (
    <div ref={rootRef}>
      {status === ResetPasswordStatus.VERIFYING && <VerifyingState />}

      {status === ResetPasswordStatus.UNREACHABLE && (
        <UnreachableState onRetry={retryVerify} />
      )}

      {status === ResetPasswordStatus.INVALID && (
        <InvalidLinkState onRequestNewLink={goToForgotPassword} />
      )}

      {status === ResetPasswordStatus.SUCCESS && (
        <SuccessState secondsLeft={secondsLeft} onGoToLogin={goToLogin} />
      )}

      {status === ResetPasswordStatus.READY && (
        <ResetPasswordForm
          isSubmitting={isSubmitting}
          submitError={submitError}
          onSubmit={submit}
          onClearError={clearSubmitError}
        />
      )}
    </div>
  )
}

// Router lazy-load bằng default import nên page giữ cả default export.
export default ResetPassword
