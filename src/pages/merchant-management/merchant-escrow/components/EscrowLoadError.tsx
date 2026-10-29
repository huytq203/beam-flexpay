import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent } from '@components/index'

/**
 * Banner lỗi tải dữ liệu kèm nút "Thử lại". Các tab con dùng query suppress lỗi toàn cục, nên
 * nếu không tự hiện banner thì lỗi mạng/BE trông giống "chưa có dữ liệu" và kế toán đọc sai.
 */
export function EscrowLoadError({
  error,
  fallback,
  onRetry
}: {
  error: unknown
  fallback: string
  onRetry: () => void
}) {
  return (
    <div
      role='alert'
      className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
    >
      {getApiErrorDetail(error, fallback)}
      <ButtonComponent
        size='small'
        type='default'
        content='Thử lại'
        onClick={onRetry}
      />
    </div>
  )
}
