import type { ReactNode } from 'react'

interface DetailSectionTitleProps {
  children: ReactNode
}

/** Tiêu đề khối ở chi tiết giao dịch: chữ đậm cùng vạch teal để tách các khối khi lướt nhanh. */
export const DetailSectionTitle = ({ children }: DetailSectionTitleProps) => (
  <h3 className='m-0 border-l-4 border-primary pl-2 text-base font-semibold text-foreground'>
    {children}
  </h3>
)
