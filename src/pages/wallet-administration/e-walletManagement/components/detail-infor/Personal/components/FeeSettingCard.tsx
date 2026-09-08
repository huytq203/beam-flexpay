import { CardComponent } from '@components/index'
import type { ReactNode } from 'react'

interface FeeSettingCardProps {
  children: ReactNode
  totalRows?: number
  /** Hành động ở góc phải tiêu đề. */
  action?: ReactNode
}

export const FeeSettingCard = ({
  children,
  totalRows,
  action
}: FeeSettingCardProps) => (
  <CardComponent
    className='mt-3'
    content={
      <section aria-labelledby='applicable-fee-rules-title'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <h2
            id='applicable-fee-rules-title'
            className='text-base font-semibold text-foreground'
          >
            Quy tắc phí đang áp dụng
          </h2>
          <div className='flex items-center gap-3'>
            {totalRows !== undefined ? (
              <span className='text-xs text-muted-foreground'>
                {totalRows} dòng quy tắc
              </span>
            ) : null}
            {action}
          </div>
        </div>
        {children}
      </section>
    }
  />
)

interface FeeRulesEmptyStateProps {
  /** Rỗng vì bộ lọc, không phải vì ví chưa có quy tắc — hai việc khác nhau. */
  filtered?: boolean
}

export const FeeRulesEmptyState = ({
  filtered = false
}: FeeRulesEmptyStateProps) => (
  <div
    role='status'
    className='flex min-h-44 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted/30 px-4 text-center'
  >
    <p className='font-medium text-foreground'>
      {filtered
        ? 'Không có quy tắc phí khớp bộ lọc'
        : 'Chưa có quy tắc phí đang áp dụng'}
    </p>
    <p className='max-w-[52ch] text-sm text-muted-foreground'>
      {filtered
        ? 'Nới một điều kiện áp dụng hoặc bấm Xóa lọc để xem lại toàn bộ quy tắc của ví.'
        : 'Ví này chưa có quy tắc riêng hoặc quy tắc áp dụng chung phù hợp.'}
    </p>
  </div>
)
