import { CardComponent } from '@components/index'
import type { ReactNode } from 'react'

interface FeeSettingCardProps {
  children: ReactNode
  totalRows?: number
  /** Hành động ở góc phải tiêu đề. */
  action?: ReactNode
  /** Mặc định là tiêu đề của tab ví; khối trong chi tiết merchant truyền tiêu đề riêng. */
  title?: string
}

const WALLET_CARD_TITLE = 'Quy tắc phí dành riêng cho ví này'
const WALLET_EMPTY_MESSAGE =
  'Ví này chưa có quy tắc phí riêng — đang áp dụng biểu phí chung.'

export const FeeSettingCard = ({
  children,
  totalRows,
  action,
  title = WALLET_CARD_TITLE
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
            {title}
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
  /** Câu hiển thị khi chưa có quy tắc nào; mặc định là câu của ví. */
  message?: string
}

export const FeeRulesEmptyState = ({
  filtered = false,
  message = WALLET_EMPTY_MESSAGE
}: FeeRulesEmptyStateProps) => (
  <div
    role='status'
    className='flex min-h-44 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-muted/30 px-4 text-center'
  >
    <p className='font-medium text-foreground'>
      {filtered ? 'Không có quy tắc phí khớp bộ lọc' : message}
    </p>
    {filtered ? (
      <p className='max-w-[52ch] text-sm text-muted-foreground'>
        Nới một điều kiện áp dụng hoặc bấm Xóa lọc để xem lại toàn bộ quy tắc
        của ví.
      </p>
    ) : null}
  </div>
)
