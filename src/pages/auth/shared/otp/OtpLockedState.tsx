import { LockOutlined } from '@ant-design/icons'
import ButtonComponent from '@components/ui/button-component'
import { AuthColumn, StateDisc } from '../../reset-password/components/AuthColumn'
import { formatOtpTime } from './format-otp-time'

export interface OtpLockedStateProps {
  secondsLeft: number
  message: string
  onBack: () => void
}

export function OtpLockedState({
  secondsLeft,
  message,
  onBack
}: OtpLockedStateProps) {
  return (
    <AuthColumn>
      <StateDisc>
        <LockOutlined />
      </StateDisc>
      <div className='mb-6 text-center'>
        <h1 className='mb-1 text-[24px] font-extrabold tracking-tight text-gray-900'>
          Tạm khóa xác thực
        </h1>
        <p className='text-[13px] leading-5 text-gray-500'>{message}</p>
        {secondsLeft > 0 && (
          <p className='mt-2 text-[13px] font-semibold text-amber-700 tabular-nums'>
            Thử lại sau {formatOtpTime(secondsLeft)}
          </p>
        )}
      </div>
      <ButtonComponent
        className='h-[42px]! w-full! rounded-[10px]! font-semibold!'
        content='Quay lại bước đầu'
        onClick={onBack}
      />
    </AuthColumn>
  )
}
