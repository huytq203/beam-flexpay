import type { ReactNode } from 'react'

interface SectionHeadingProps {
  children: ReactNode
  /** Hành động của riêng khối, ví dụ nút thêm thành phần phí. */
  action?: ReactNode
  hint?: string
}

/**
 * Tiêu đề khối trong biểu mẫu, đặt ở bậc `label` của hệ thiết kế: 11px, hoa,
 * giãn chữ 0.12em. Đây là chính tiêu đề của khối, không phải nhãn phụ đặt trên
 * một tiêu đề khác.
 */
export const SectionHeading = ({
  children,
  action,
  hint
}: SectionHeadingProps) => (
  <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
    <div>
      <h2 className='font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary-foreground'>
        {children}
      </h2>
      {hint && (
        <p className='mt-1 max-w-[70ch] text-[13px] text-muted-foreground'>
          {hint}
        </p>
      )}
    </div>
    {action}
  </div>
)
