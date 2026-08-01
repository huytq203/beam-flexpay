export interface OtpCountdownBarProps {
  secondsLeft: number
  totalSeconds: number
}

export function OtpCountdownBar({
  secondsLeft,
  totalSeconds
}: OtpCountdownBarProps) {
  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0
  const isUrgent = secondsLeft > 0 && secondsLeft <= 30
  const announcement =
    secondsLeft === 60
      ? 'Mã xác thực còn một phút'
      : secondsLeft === 10
        ? 'Mã xác thực còn mười giây'
        : ''

  return (
    <div
      className={`mx-auto w-full max-w-[420px] rounded-xl px-3 py-2.5 transition-colors ${
        isUrgent ? 'bg-amber-50' : 'bg-teal-50'
      }`}
    >
      <div className='mb-2 flex items-center justify-between gap-3'>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
            isUrgent ? 'text-amber-800' : 'text-teal-800'
          }`}
        >
          <ClockCircleOutlined aria-hidden />
          Thời gian hiệu lực
        </span>
        <span
          aria-live='off'
          className={`text-[13px] font-bold tabular-nums ${
            isUrgent ? 'text-amber-900' : 'text-teal-900'
          }`}
        >
          {formatOtpTime(secondsLeft)}
        </span>
      </div>

      <div
        role='progressbar'
        aria-label='Thời gian hiệu lực của mã xác thực'
        aria-valuemin={0}
        aria-valuemax={totalSeconds}
        aria-valuenow={secondsLeft}
        className={`h-2 overflow-hidden rounded-full ${
          isUrgent ? 'bg-amber-200' : 'bg-teal-100'
        }`}
      >
        <div
          className={`relative h-full rounded-full transition-[width,background-color] duration-300 ${
            isUrgent ? 'bg-amber-500' : 'bg-teal-500'
          }`}
          style={{ width: `${progress}%` }}
        >
          <span
            aria-hidden
            className='absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-white/90'
          />
        </div>
      </div>
      <span className='sr-only' aria-live='polite'>
        {announcement}
      </span>
    </div>
  )
}
import { ClockCircleOutlined } from '@ant-design/icons'
import { formatOtpTime } from './format-otp-time'
