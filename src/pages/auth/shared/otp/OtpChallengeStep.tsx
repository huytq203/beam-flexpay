import { useEffect, useRef } from 'react'
import { ArrowLeftOutlined, MailOutlined } from '@ant-design/icons'
import gsap from 'gsap'
import ButtonComponent from '@components/ui/button-component'
import { OtpInput } from '@components/ui/otp-input-component'
import { AuthColumn, StateDisc } from '../../reset-password/components/AuthColumn'
import { OtpCountdownBar } from './OtpCountdownBar'
import { OtpLockedState } from './OtpLockedState'
import { OtpResendButton } from './OtpResendButton'
import { OtpTerminalState } from './OtpTerminalState'
import { OtpFlowStatus, type OtpChallenge, type OtpVerifyPayload } from './types'
import { useOtpChallenge } from './useOtpChallenge'

export interface OtpChallengeStepProps {
  challenge: OtpChallenge
  verifyOtp: (payload: OtpVerifyPayload) => Promise<void>
  onVerified: () => void
  onBack: () => void
  onResetTokenInvalid?: (message: string) => void
  backLabel: string
}

export function OtpChallengeStep({
  challenge,
  verifyOtp,
  onVerified,
  onBack,
  onResetTokenInvalid,
  backLabel
}: OtpChallengeStepProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const flow = useOtpChallenge({
    initialChallenge: challenge,
    verifyOtp,
    onVerified,
    onResetTokenInvalid
  })

  useEffect(() => {
    const marker = { adminOtpStep: true }
    window.history.pushState(marker, '', window.location.href)
    const handlePopState = (): void => onBack()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onBack])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    headingRef.current?.focus()
    const focusTimer = window.setTimeout(() => {
      root.querySelector<HTMLInputElement>('#admin-otp')?.focus()
    }, reduceMotion ? 0 : 280)

    if (reduceMotion) return () => window.clearTimeout(focusTimer)
    const animation = gsap.fromTo(
      root,
      { x: 12, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }
    )
    return () => {
      window.clearTimeout(focusTimer)
      animation.revert()
    }
  }, [])

  const handleBack = (): void => {
    if (window.history.state?.adminOtpStep) {
      window.history.back()
      return
    }
    onBack()
  }
  if (flow.status === OtpFlowStatus.LOCKED) {
    return (
      <OtpLockedState
        secondsLeft={flow.lockedFor}
        message={flow.error ?? 'Tài khoản đang tạm khóa.'}
        onBack={handleBack}
      />
    )
  }
  if (
    flow.status === OtpFlowStatus.FLOW_EXPIRED ||
    flow.status === OtpFlowStatus.MAX_RESEND
  ) {
    return (
      <OtpTerminalState
        message={
          flow.error ?? 'Vui lòng thực hiện lại từ bước đầu để nhận mã mới.'
        }
        onBack={handleBack}
      />
    )
  }

  const isExpired = flow.status === OtpFlowStatus.EXPIRED
  const isSuccessful = flow.status === OtpFlowStatus.SUCCESS
  const isInputDisabled = isExpired || isSuccessful || flow.isVerifying

  return (
    <div ref={rootRef} className='w-full max-w-[420px]'>
      <AuthColumn>
        <StateDisc>
          <span className='relative flex items-center'>
            <MailOutlined />
            {/* <LockOutlined className='-ml-0.5 mt-3 text-[11px]' /> */}
          </span>
        </StateDisc>

        <div className='mb-6 text-center'>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className='mb-1 text-[26px] font-extrabold leading-tight tracking-tight text-gray-900 outline-hidden'
          >
            Nhập mã xác thực
          </h1>
          <p className='text-[13px] text-gray-500'>
            Mã gồm 6 chữ số vừa gửi tới
          </p>
          <p className='mt-1 text-[13px] font-semibold text-teal-700'>
            {flow.challenge.maskedRecipient}
          </p>
        </div>

        <div className='flex flex-col gap-4'>
          <OtpInput
            value={flow.otp}
            onChange={flow.setOtp}
            onComplete={flow.verify}
            isDisabled={isInputDisabled}
            isInvalid={Boolean(flow.error) && !isExpired}
            isSuccessful={isSuccessful}
            errorNonce={flow.errorNonce}
            describedBy={flow.error ? 'otp-error' : undefined}
          />

          {!isExpired && (
            <OtpCountdownBar
              secondsLeft={flow.expiresIn}
              totalSeconds={flow.challenge.expiresIn}
            />
          )}

          {flow.error && (
            <p
              id='otp-error'
              role='alert'
              className='rounded-[10px] bg-red-50 px-3 py-2.5 text-[12px] leading-5 text-red-700'
            >
              {flow.error}
            </p>
          )}

          <ButtonComponent
            className='h-[42px]! w-full! rounded-[10px]! text-[14px]! font-semibold!'
            content={isExpired ? 'Gửi mã mới' : 'Xác nhận'}
            htmlType='button'
            loading={flow.isVerifying || (isExpired && flow.isResending)}
            disabled={!isExpired && flow.otp.length !== 6}
            onClick={isExpired ? flow.resend : () => void flow.verify()}
          />

          {!isExpired && (
            <OtpResendButton
              cooldown={flow.cooldown}
              resendRemaining={flow.challenge.resendRemaining}
              isResending={flow.isResending}
              onResend={flow.resend}
            />
          )}

          <button
            type='button'
            className='mx-auto flex items-center gap-1.5 text-[12px] font-medium text-teal-700 outline-offset-4 transition-colors hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-teal-300'
            onClick={handleBack}
          >
            <ArrowLeftOutlined aria-hidden className='text-[11px]' />
            {backLabel}
          </button>
        </div>
      </AuthColumn>
    </div>
  )
}
