import { ArrowsCounterClockwiseIcon, WarningIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'

interface BusinessWalletFormStateProps {
  state: 'loading' | 'error' | 'not-found'
  onBack: () => void
  onRetry: () => void
}

export function BusinessWalletFormState({
  state,
  onBack,
  onRetry
}: BusinessWalletFormStateProps) {
  if (state === 'loading') {
    return (
      <CardComponent className='border border-border bg-background shadow-none'>
        <div role='status' aria-label='Đang tải hồ sơ ví doanh nghiệp'>
          <SkeletonTable rows={6} columns={2} noContainer />
        </div>
      </CardComponent>
    )
  }

  const isNotFound = state === 'not-found'
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div role='alert' className='flex flex-col items-center gap-3 py-10 text-center'>
        {!isNotFound && (
          <span className='flex size-10 items-center justify-center rounded-lg bg-danger/10 text-danger'>
            <WarningIcon aria-hidden size={22} />
          </span>
        )}
        <div className='space-y-1'>
          <h2 className='font-display text-base font-semibold text-foreground'>
            {isNotFound
              ? 'Không tìm thấy ví doanh nghiệp'
              : 'Không tải được hồ sơ ví doanh nghiệp'}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {isNotFound
              ? 'Ví này có thể đã bị xóa hoặc bạn truy cập nhầm đường dẫn.'
              : 'Vui lòng kiểm tra kết nối và thử tải lại dữ liệu.'}
          </p>
        </div>
        <ButtonComponent
          htmlType='button'
          type='default'
          content={isNotFound ? 'Về danh sách ví doanh nghiệp' : 'Thử lại'}
          icon={isNotFound ? undefined : <ArrowsCounterClockwiseIcon aria-hidden size={18} />}
          onClick={isNotFound ? onBack : onRetry}
        />
      </div>
    </CardComponent>
  )
}
