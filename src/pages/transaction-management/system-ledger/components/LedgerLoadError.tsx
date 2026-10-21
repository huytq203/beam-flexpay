import { ButtonComponent } from '@components/index'

interface LedgerLoadErrorProps {
  onRetry: () => void
  isRetrying?: boolean
}

/**
 * Lỗi tải nằm ngay trên bảng: bảng trống lúc này không có nghĩa là sổ cái rỗng.
 * Thông báo lỗi HTTP chi tiết đã do `fetchBaseQueryCustom` hiện, ở đây không lặp lại.
 */
export const LedgerLoadError = ({
  onRetry,
  isRetrying
}: LedgerLoadErrorProps) => (
  <div
    role='alert'
    className='mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-danger-strong bg-danger/10 px-3 py-2'
  >
    <p className='m-0 text-sm'>
      <span className='font-semibold text-danger-strong'>
        Không tải được sổ cái.
      </span>{' '}
      Bảng và số tổng bên dưới chưa có dữ liệu, hãy tải lại.
    </p>
    <ButtonComponent
      size='small'
      type='default'
      content='Thử lại'
      loading={isRetrying}
      onClick={onRetry}
    />
  </div>
)
