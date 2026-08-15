import StatusBadge from '@components/status-badge/StatusBadge'
import { Skeleton } from '@components/ui/skeletons/Skeleton'
import type { StatusDisplayConfig } from '../constants/CommonInfor.constant'

interface AsyncStatusValueProps {
  status: string
  config: Record<string, StatusDisplayConfig>
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  onRetry: () => void
  /** Mô tả trường dữ liệu, dùng cho nhãn thử lại của trình đọc màn hình. */
  fieldLabel: string
}

/**
 * Bốn trạng thái của một ô trạng thái lấy từ API: loading / error / empty / data.
 * Lỗi nêu đúng vấn đề và cách khắc phục ngay tại chỗ thay vì nuốt thành "--".
 */
const AsyncStatusValue = ({
  status,
  config,
  isLoading,
  isError,
  isEmpty,
  onRetry,
  fieldLabel
}: AsyncStatusValueProps) => {
  if (isLoading) return <Skeleton className='h-5 w-24 rounded-md' />

  if (isError) {
    return (
      <button
        type='button'
        onClick={onRetry}
        aria-label={`Tải lại ${fieldLabel}`}
        className='danger-status inline-flex w-fit cursor-pointer items-center gap-1 rounded-md text-[12px] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger'
      >
        Không tải được · Thử lại
      </button>
    )
  }

  if (isEmpty) return <span className='font-medium text-muted-foreground'>--</span>

  return <StatusBadge status={status} config={config} />
}

export default AsyncStatusValue
