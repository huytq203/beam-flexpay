import { ButtonComponent } from '@components/index'

interface TransactionListErrorProps {
  /** `detail` tiếng Việt của BE, hiển thị nguyên văn. */
  message: string
  onRetry: () => void
}

/**
 * Lỗi tải danh sách (kể cả 503 khi lọc theo hoàn tiền mà user-wallet không trả lời).
 * Phải là trạng thái lỗi riêng, tuyệt đối không được trông như "0 kết quả".
 */
export function TransactionListError({
  message,
  onRetry
}: TransactionListErrorProps) {
  return (
    <div
      role='alert'
      className='flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-danger/30 bg-danger/10 p-6 text-center'
    >
      <p className='font-medium text-danger-strong'>
        Không tải được danh sách giao dịch
      </p>
      <p className='max-w-xl text-sm text-danger-strong'>{message}</p>
      <ButtonComponent
        htmlType='button'
        type='default'
        content='Thử lại'
        onClick={onRetry}
      />
    </div>
  )
}
