import ButtonComponent from '@components/ui/button-component'
import { formatOtpTime } from './format-otp-time'

export interface OtpResendButtonProps {
  cooldown: number
  resendRemaining: number
  isResending: boolean
  onResend: () => void
}

export function OtpResendButton({
  cooldown,
  resendRemaining,
  isResending,
  onResend
}: OtpResendButtonProps) {
  if (resendRemaining <= 0) {
    return (
      <p className='text-center text-[12px] leading-5 text-gray-500'>
        Bạn đã dùng hết số lần gửi lại mã.
      </p>
    )
  }

  const isCoolingDown = cooldown > 0
  const label = isCoolingDown
    ? `Gửi lại mã sau ${formatOtpTime(cooldown)} · còn ${resendRemaining} lượt`
    : `Gửi lại mã · còn ${resendRemaining} lượt`

  return (
    <ButtonComponent
      type='link'
      htmlType='button'
      className='h-auto! w-full! p-0! text-[12px]! font-medium! text-teal-700! disabled:text-gray-500!'
      content={label}
      disabled={isCoolingDown}
      loading={isResending}
      onClick={onResend}
    />
  )
}
