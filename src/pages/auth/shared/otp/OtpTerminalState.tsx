import { LockOutlined } from '@ant-design/icons'
import ButtonComponent from '@components/ui/button-component'
import { AuthColumn, StateDisc } from '../../reset-password/components/AuthColumn'

export interface OtpTerminalStateProps {
  message: string
  onBack: () => void
}

export function OtpTerminalState({
  message,
  onBack
}: OtpTerminalStateProps) {
  return (
    <AuthColumn>
      <StateDisc>
        <LockOutlined />
      </StateDisc>
      <div className='mb-6 text-center'>
        <h1 className='mb-1 text-[24px] font-extrabold tracking-tight text-gray-900'>
          Phiên xác thực đã kết thúc
        </h1>
        <p className='text-[13px] leading-5 text-gray-500'>{message}</p>
      </div>
      <ButtonComponent
        className='h-[42px]! w-full! rounded-[10px]! font-semibold!'
        content='Quay lại bước đầu'
        onClick={onBack}
      />
    </AuthColumn>
  )
}
