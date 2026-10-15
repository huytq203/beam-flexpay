import { useState } from 'react'
import {
  useChallengeBankAccountOtpMutation,
  type SensitiveOperation,
  type SensitiveOtpChallenge,
  type SensitiveOtpConfirmation
} from '@/app/services/merchantBankAccountApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'

export interface SensitiveOtpState {
  challenge: SensitiveOtpChallenge | null
  code: string
  isRequesting: boolean
  setCode: (value: string) => void
  request: (targetId?: string) => Promise<void>
  toConfirmation: () => SensitiveOtpConfirmation | null
  reset: () => void
}

export const useSensitiveOtp = (
  operation: SensitiveOperation = 'BANK_ACCOUNT_CHANGE'
): SensitiveOtpState => {
  const [challenge, setChallenge] = useState<SensitiveOtpChallenge | null>(null)
  const [code, setCode] = useState('')
  const [challengeOtp, challengeState] = useChallengeBankAccountOtpMutation()

  return {
    challenge,
    code,
    isRequesting: challengeState.isLoading,
    setCode,
    request: async (targetId) => {
      try {
        setChallenge(await challengeOtp({ targetId, operation }).unwrap())
        setCode('')
      } catch (error) {
        feedback.error(getApiErrorDetail(error, 'Không thể gửi mã OTP'))
      }
    },
    toConfirmation: () => {
      if (!challenge || !code.trim()) {
        feedback.warning('Vui lòng nhập mã OTP')
        return null
      }
      return { otpSessionId: challenge.otpSessionId, otp: code.trim() }
    },
    reset: () => {
      setChallenge(null)
      setCode('')
    }
  }
}
