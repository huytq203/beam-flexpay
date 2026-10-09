import { useNavigate } from 'react-router-dom'
import { ButtonComponent, CardComponent } from '@components/index'
import { SkeletonText } from '@components/ui/skeletons/Skeleton'
import { walletLimitPaths } from '../utils/walletLimit.paths'

interface WalletLimitDetailFallbackProps {
  isLoading: boolean
  error?: unknown
  onRetry: () => void
}

const isNotFound = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === 404

/** Trạng thái loading / 404 / lỗi dùng chung cho màn Chi tiết và Lịch sử. */
export function WalletLimitDetailFallback({
  isLoading,
  error,
  onRetry
}: WalletLimitDetailFallbackProps) {
  const navigate = useNavigate()

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      {isLoading ? (
        <div
          aria-busy='true'
          aria-label='Đang tải dữ liệu'
        >
          <SkeletonText lines={6} />
        </div>
      ) : isNotFound(error) ? (
        <div
          role='alert'
          className='flex flex-col items-start gap-3'
        >
          <p className='font-semibold'>Không tìm thấy cấu hình hạn mức</p>
          <ButtonComponent
            type='default'
            content='Về danh sách hạn mức'
            onClick={() => navigate(walletLimitPaths.list)}
          />
        </div>
      ) : (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải dữ liệu hạn mức.
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={onRetry}
          />
        </div>
      )}
    </CardComponent>
  )
}
