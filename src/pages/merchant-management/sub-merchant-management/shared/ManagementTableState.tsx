import { ArrowsCounterClockwiseIcon, WarningIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { cn } from '@lib/utils/cn'

import type { ManagementTableStateProps } from './management.types'

const getEmptyCopy = (entityName: string, kind: 'initial' | 'filtered') =>
  kind === 'initial'
    ? {
        title: `Chưa có ${entityName}`,
        description: `Hãy thêm ${entityName} đầu tiên để bắt đầu quản lý.`
      }
    : {
        title: 'Không tìm thấy kết quả',
        description: `Không có ${entityName} phù hợp với bộ lọc hiện tại.`
      }

export function ManagementTableState({
  state,
  entityName,
  onRetry,
  emptyKind = 'initial',
  children
}: ManagementTableStateProps) {
  if (state === 'success') return <>{children}</>

  if (state === 'loading') {
    return (
      <div
        aria-label={`Đang tải danh sách ${entityName}`}
        className='min-w-0'
        role='status'
      >
        <span className='sr-only'>Đang tải dữ liệu</span>
        <SkeletonTable columns={7} noContainer rows={5} />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <section
        aria-label={`Không tải được danh sách ${entityName}`}
        className='flex min-h-56 flex-col items-center justify-center gap-3 px-4 text-center'
        role='status'
      >
        <span className='flex size-10 items-center justify-center rounded-lg bg-danger/10 text-danger-strong'>
          <WarningIcon aria-hidden size={22} />
        </span>
        <div className='space-y-1'>
          <h2 className='font-display text-base font-semibold text-foreground'>
            Không tải được danh sách {entityName}
          </h2>
          <p className='text-sm text-muted-foreground'>
            Vui lòng kiểm tra kết nối và thử tải lại dữ liệu.
          </p>
        </div>
        {onRetry && (
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />}
            onClick={onRetry}
            type='default'
          />
        )}
      </section>
    )
  }

  const copy = getEmptyCopy(entityName, emptyKind)

  return (
    <section
      aria-label={copy.title}
      className={cn(
        'flex min-h-56 flex-col items-center justify-center gap-3 px-4 text-center',
        'border border-dashed border-border bg-muted/30'
      )}
      role='status'
    >
      <div className='space-y-1'>
        <h2 className='font-display text-base font-semibold text-foreground'>{copy.title}</h2>
        <p className='text-sm text-muted-foreground'>{copy.description}</p>
      </div>
      {onRetry && (
        <ButtonComponent
          content='Làm mới dữ liệu'
          htmlType='button'
          icon={<ArrowsCounterClockwiseIcon aria-hidden size={18} />}
          onClick={onRetry}
          type='default'
        />
      )}
    </section>
  )
}
