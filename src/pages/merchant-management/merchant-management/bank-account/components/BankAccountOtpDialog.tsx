import { DialogModal, Input } from '@components/index'
import type { SensitiveOtpState } from '../hooks/useSensitiveOtp'

interface BankAccountOtpDialogProps {
  otp: SensitiveOtpState
  loading: boolean
  onConfirm: () => void
}

export function BankAccountOtpDialog({
  otp,
  loading,
  onConfirm
}: BankAccountOtpDialogProps) {
  return (
    <DialogModal
      open={otp.challenge !== null}
      title='Xác nhận bằng OTP'
      onCancel={otp.reset}
      onOk={onConfirm}
      okButtonProps={{ loading: loading || otp.isRequesting }}
      okText='Xác nhận'
    >
      <div className='space-y-3'>
        <p className='text-sm text-muted-foreground'>
          Mã OTP đã gửi tới {otp.challenge?.maskedRecipient}. Mã có hiệu lực{' '}
          {otp.challenge?.expiresInSeconds ?? 0} giây.
        </p>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='bank-otp'
          >
            Mã OTP
          </label>
          <Input
            id='bank-otp'
            value={otp.code}
            onChange={(event) => otp.setCode(event.target.value)}
            autoComplete='one-time-code'
            inputMode='numeric'
            maxLength={10}
          />
        </div>
      </div>
    </DialogModal>
  )
}
