import { ButtonComponent } from '@components/index'

interface LedgerUnavailableNoticeProps {
  message: string
  onRetry?: () => void
}

/**
 * Trạng thái "dịch vụ sổ cái chưa sẵn sàng": `run` trả 200 + UNAVAILABLE còn
 * `balance-report` trả 503, hai nhánh hiển thị chung một cách.
 */
export function LedgerUnavailableNotice({
  message,
  onRetry
}: LedgerUnavailableNoticeProps) {
  return (
    <div
      role='alert'
      className='flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm'
    >
      <p>{message}</p>
      {onRetry && (
        <div>
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={onRetry}
            size='small'
            type='default'
          />
        </div>
      )}
    </div>
  )
}
