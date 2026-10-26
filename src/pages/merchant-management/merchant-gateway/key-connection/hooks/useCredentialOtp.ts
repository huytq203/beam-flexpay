import { useEffect, useRef, useState } from 'react'
import type {
  CredentialOtpChallenge,
  CredentialPrecheckResult,
  SensitiveOtpConfirmation
} from '@/app/services/merchantGatewayApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { isOtpStepError, readApiErrorCode } from '../utils/credential.utils'

/** Một lệnh ghi cần OTP riêng của bộ khóa (không dùng OTP chung). */
export interface CredentialOtpCommand<T> {
  /** Gửi lệnh không kèm OTP để BE kiểm tra nghiệp vụ trước khi tốn SMS. */
  precheck: () => Promise<CredentialPrecheckResult>
  /** Xin OTP với body khớp từng trường với lệnh chính. */
  challenge: () => Promise<CredentialOtpChallenge>
  submit: (otp: SensitiveOtpConfirmation) => Promise<T>
  onDone: (result: T) => void
}

export interface CredentialOtpState {
  challenge: CredentialOtpChallenge | null
  code: string
  setCode: (value: string) => void
  /** Lỗi trong hộp thoại OTP (mã sai, hết hạn...). */
  error: string
  /** Lỗi nghiệp vụ trả về trước hoặc sau bước OTP, hiện trên form gốc. */
  formError: string
  secondsLeft: number
  resendIn: number
  isPreparing: boolean
  isSubmitting: boolean
  confirm: () => Promise<void>
  resend: () => Promise<void>
  cancel: () => void
}

const secondsUntil = (deadline: number, now: number): number =>
  Math.max(0, Math.ceil((deadline - now) / 1000))

export const useCredentialOtp = <T>() => {
  const command = useRef<CredentialOtpCommand<T> | null>(null)
  const [challenge, setChallenge] = useState<CredentialOtpChallenge | null>(
    null
  )
  const [deadlines, setDeadlines] = useState({ expiresAt: 0, resendAt: 0 })
  const [now, setNow] = useState(() => Date.now())
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [isPreparing, setIsPreparing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Đồng hồ đếm ngược chỉ chạy khi hộp thoại OTP đang mở.
  useEffect(() => {
    if (!challenge) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [challenge])

  const close = () => {
    setChallenge(null)
    setCode('')
    setError('')
  }

  const issue = async (isOpen: boolean): Promise<void> => {
    if (!command.current) return
    try {
      const next = await command.current.challenge()
      const issuedAt = Date.now()
      setDeadlines({
        expiresAt: issuedAt + next.expiresInSeconds * 1000,
        resendAt: issuedAt + next.canResendAfterSeconds * 1000
      })
      setNow(issuedAt)
      setChallenge(next)
      setCode('')
      setError('')
    } catch (failure) {
      const detail = getApiErrorDetail(failure, 'Không thể gửi mã OTP')
      if (isOpen) setError(detail)
      else setFormError(detail)
    }
  }

  const begin = async (next: CredentialOtpCommand<T>): Promise<void> => {
    command.current = next
    setFormError('')
    setIsPreparing(true)
    try {
      const checked = await next.precheck()
      // BE luôn đòi OTP; nhánh này chỉ phòng khi BE bỏ yêu cầu OTP.
      if (!checked.otpRequired) next.onDone(checked.data as T)
      else await issue(false)
    } catch (failure) {
      setFormError(getApiErrorDetail(failure, 'Không thể thực hiện thao tác'))
    } finally {
      setIsPreparing(false)
    }
  }

  const secondsLeft = challenge ? secondsUntil(deadlines.expiresAt, now) : 0
  const resendIn = challenge ? secondsUntil(deadlines.resendAt, now) : 0

  const confirm = async (): Promise<void> => {
    const current = command.current
    const otp = code.trim()
    if (!current || !challenge) return
    if (!otp) return setError('Vui lòng nhập mã OTP')
    if (secondsLeft === 0)
      return setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã.')
    setIsSubmitting(true)
    try {
      const result = await current.submit({
        otpSessionId: challenge.otpSessionId,
        otp
      })
      close()
      current.onDone(result)
    } catch (failure) {
      const detail = getApiErrorDetail(failure, 'Không thể xác nhận thao tác')
      if (isOtpStepError(readApiErrorCode(failure))) {
        setCode('')
        setError(detail)
      } else {
        close()
        setFormError(detail)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const state: CredentialOtpState = {
    challenge,
    code,
    setCode: (value) => {
      setCode(value)
      if (error) setError('')
    },
    error,
    formError,
    secondsLeft,
    resendIn,
    isPreparing,
    isSubmitting,
    confirm,
    resend: () => issue(true),
    cancel: close
  }

  return { otp: state, begin }
}
