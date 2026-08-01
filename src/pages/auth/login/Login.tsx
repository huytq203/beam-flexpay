import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  useUserLoginMutation,
  useVerifyLoginOtpMutation
} from '@services/authEndpoints'
import { TRANSACTIONMANAGEMENT } from '@constants/routersConstant'
import type { AdminLoginOtpResponse } from '@type/auth'
import type { DataLogin } from '@type/application'
import {
  OtpChallengeStep,
  OtpErrorKind,
  parseOtpError,
  type OtpVerifyPayload
} from '../shared/otp'
import { LoginCredentialsStep } from './LoginCredentialsStep'
import type { LoginFormData } from './schema'

const isLegacyLoginResponse = (
  response: DataLogin | AdminLoginOtpResponse
): response is DataLogin =>
  'accessToken' in response && Boolean(response.accessToken)

const isOtpLoginResponse = (
  response: DataLogin | AdminLoginOtpResponse
): response is AdminLoginOtpResponse =>
  'otpRequired' in response && response.otpRequired && Boolean(response.requestId)

export function Login() {
  const navigate = useNavigate()
  const transitionRef = useRef<HTMLDivElement>(null)
  const [challenge, setChallenge] = useState<AdminLoginOtpResponse | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [login, { isLoading: isLoggingIn }] = useUserLoginMutation()
  const [verifyLoginOtp] = useVerifyLoginOtpMutation()

  const navigateToCms = useCallback((): void => {
    void navigate(`${TRANSACTIONMANAGEMENT}/transaction-wallet`)
  }, [navigate])

  const showOtpStep = (nextChallenge: AdminLoginOtpResponse): void => {
    const root = transitionRef.current
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (!root || reduceMotion) {
      setChallenge(nextChallenge)
      return
    }
    gsap.to(root, {
      x: -12,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => setChallenge(nextChallenge)
    })
  }

  const handleCredentialsSubmit = async (
    values: LoginFormData,
    captchaToken: string
  ): Promise<void> => {
    setSubmitError(null)
    try {
      const response = await login({
        userLoginDto: { ...values, captchaToken }
      }).unwrap()

      if (isLegacyLoginResponse(response)) {
        navigateToCms()
      } else if (isOtpLoginResponse(response)) {
        showOtpStep(response)
      } else {
        setSubmitError('Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.')
      }
    } catch (error) {
      const parsed = parseOtpError(error)
      setSubmitError(
        parsed.kind === OtpErrorKind.RECIPIENT_UNAVAILABLE
          ? parsed.message
          : 'Đăng nhập không thành công. Vui lòng kiểm tra thông tin.'
      )
    }
  }

  const handleVerifyOtp = useCallback(
    async (payload: OtpVerifyPayload): Promise<void> => {
      await verifyLoginOtp(payload).unwrap()
    },
    [verifyLoginOtp]
  )

  const handleBack = useCallback((): void => {
    setChallenge(null)
    setSubmitError(null)
  }, [])

  if (challenge) {
    return (
      <OtpChallengeStep
        challenge={challenge}
        verifyOtp={handleVerifyOtp}
        onVerified={navigateToCms}
        onBack={handleBack}
        backLabel='Quay lại đăng nhập'
      />
    )
  }

  return (
    <div ref={transitionRef} className='w-full max-w-[420px]'>
      <LoginCredentialsStep
        isSubmitting={isLoggingIn}
        submitError={submitError}
        onSubmit={handleCredentialsSubmit}
      />
    </div>
  )
}

export default Login
