import { ButtonComponent, DialogModal, Input } from '@components/index'
import type { CredentialOtpState } from '../hooks/useCredentialOtp'
import { formatCountdown } from '../utils/credential.utils'

interface CredentialOtpDialogProps {
  otp: CredentialOtpState
}

// OTP riêng của bộ khóa: mã gắn với đúng nội dung thay đổi đã gửi khi xin mã.
export function CredentialOtpDialog({ otp }: CredentialOtpDialogProps) {
  const expired = otp.challenge !== null && otp.secondsLeft === 0

  return (
    <DialogModal
      open={otp.challenge !== null}
      title='Xác nhận bằng OTP'
      onCancel={otp.cancel}
      onOk={() => void otp.confirm()}
      okButtonProps={{ loading: otp.isSubmitting, disabled: expired }}
      okText='Xác nhận'
      zIndex={1100}
    >
      <div className='space-y-3'>
        <p className='text-sm text-muted-foreground'>
          Mã OTP đã gửi tới{' '}
          <strong className='text-foreground'>
            {otp.challenge?.maskedRecipient}
          </strong>
          .{' '}
          {expired
            ? 'Mã OTP đã hết hạn.'
            : `Mã hết hạn sau ${formatCountdown(otp.secondsLeft)}.`}
        </p>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='credential-otp'
          >
            Mã OTP
          </label>
          <Input
            id='credential-otp'
            value={otp.code}
            onChange={(event) => otp.setCode(event.target.value)}
            onPressEnter={() => void otp.confirm()}
            autoComplete='one-time-code'
            inputMode='numeric'
            maxLength={10}
            status={otp.error ? 'error' : undefined}
          />
        </div>
        {otp.error && (
          <p
            role='alert'
            className='text-xs text-danger-strong'
          >
            {otp.error}
          </p>
        )}
        <ButtonComponent
          type='link'
          size='small'
          className='px-0!'
          disabled={otp.resendIn > 0 || otp.isSubmitting}
          onClick={() => void otp.resend()}
          content={
            otp.resendIn > 0
              ? `Gửi lại mã sau ${otp.resendIn} giây`
              : 'Gửi lại mã OTP'
          }
        />
      </div>
    </DialogModal>
  )
}
