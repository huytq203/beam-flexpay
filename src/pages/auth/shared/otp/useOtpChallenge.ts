import { useState } from 'react'
import { useResendAdminOtpMutation } from '@services/authEndpoints'
import type { OtpChallenge, OtpVerifyPayload } from './types'
import { OtpFlowStatus } from './types'
import { OtpErrorKind, parseOtpError } from './otp-error'
import { useCountdown } from './useCountdown'

const VERIFY_SUCCESS_DELAY = 300
const VERIFY_CONFLICT_DELAY = 1000

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export interface UseOtpChallengeOptions {
  initialChallenge: OtpChallenge
  verifyOtp: (payload: OtpVerifyPayload) => Promise<void>
  onVerified: () => void
  onResetTokenInvalid?: (message: string) => void
}

export interface UseOtpChallengeResult {
  challenge: OtpChallenge
  otp: string
  error: string | null
  errorNonce: number
  status: OtpFlowStatus
  expiresIn: number
  cooldown: number
  lockedFor: number
  isVerifying: boolean
  isResending: boolean
  setOtp: (value: string) => void
  verify: (value?: string) => Promise<void>
  resend: () => Promise<void>
}

export function useOtpChallenge({
  initialChallenge,
  verifyOtp,
  onVerified,
  onResetTokenInvalid
}: UseOtpChallengeOptions): UseOtpChallengeResult {
  const [challenge, setChallenge] = useState(initialChallenge)
  const [otp, setOtpValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [errorNonce, setErrorNonce] = useState(0)
  const [terminalStatus, setTerminalStatus] = useState<OtpFlowStatus | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendOtp, { isLoading: isResending }] = useResendAdminOtpMutation()
  const expiry = useCountdown(initialChallenge.expiresIn)
  const resendCooldown = useCountdown(initialChallenge.canResendAfter)
  const lockCountdown = useCountdown(0)

  const status = terminalStatus ??
    (expiry.secondsLeft === 0 ? OtpFlowStatus.EXPIRED : OtpFlowStatus.INPUT)

  const setOtp = (value: string): void => {
    setOtpValue(value)
    if (error) setError(null)
  }

  const verify = async (value = otp): Promise<void> => {
    if (value.length !== 6 || isVerifying || status !== OtpFlowStatus.INPUT) {
      return
    }

    setIsVerifying(true)
    setError(null)
    try {
      await verifyOtp({ requestId: challenge.requestId, otp: value })
      setTerminalStatus(OtpFlowStatus.SUCCESS)
      await wait(VERIFY_SUCCESS_DELAY)
      onVerified()
    } catch (rawError) {
      const parsed = parseOtpError(rawError)

      switch (parsed.kind) {
        case OtpErrorKind.INVALID:
          setOtpValue('')
          setError(parsed.message)
          setErrorNonce((current) => current + 1)
          break
        case OtpErrorKind.SESSION_EXPIRED:
          setError(parsed.message)
          setTerminalStatus(OtpFlowStatus.EXPIRED)
          break
        case OtpErrorKind.FLOW_EXPIRED:
          setError(parsed.message)
          setTerminalStatus(OtpFlowStatus.FLOW_EXPIRED)
          break
        case OtpErrorKind.LOCKED:
          setError(parsed.message)
          lockCountdown.restart(parsed.retryAfter ?? 0)
          setTerminalStatus(OtpFlowStatus.LOCKED)
          break
        case OtpErrorKind.VERIFY_IN_PROGRESS:
          await wait(VERIFY_CONFLICT_DELAY)
          break
        case OtpErrorKind.RESET_TOKEN_INVALID:
          onResetTokenInvalid?.(parsed.message)
          break
        default:
          setError(parsed.message)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const resend = async (): Promise<void> => {
    if (isResending || resendCooldown.secondsLeft > 0) return

    setError(null)
    try {
      const nextChallenge = await resendOtp({
        requestId: challenge.requestId
      }).unwrap()
      setChallenge(nextChallenge)
      setOtpValue('')
      setTerminalStatus(null)
      expiry.restart(nextChallenge.expiresIn)
      resendCooldown.restart(nextChallenge.canResendAfter)
    } catch (rawError) {
      const parsed = parseOtpError(rawError)
      if (parsed.kind === OtpErrorKind.RESEND_COOLDOWN) {
        resendCooldown.restart(parsed.retryAfter ?? 0)
      } else if (parsed.kind === OtpErrorKind.MAX_RESEND) {
        setTerminalStatus(OtpFlowStatus.MAX_RESEND)
      } else if (parsed.kind === OtpErrorKind.FLOW_EXPIRED) {
        setTerminalStatus(OtpFlowStatus.FLOW_EXPIRED)
      } else if (parsed.kind === OtpErrorKind.RESET_TOKEN_INVALID) {
        onResetTokenInvalid?.(parsed.message)
      }
      setError(parsed.message)
    }
  }

  return {
    challenge,
    otp,
    error,
    errorNonce,
    status,
    expiresIn: expiry.secondsLeft,
    cooldown: resendCooldown.secondsLeft,
    lockedFor: lockCountdown.secondsLeft,
    isVerifying,
    isResending,
    setOtp,
    verify,
    resend
  }
}
