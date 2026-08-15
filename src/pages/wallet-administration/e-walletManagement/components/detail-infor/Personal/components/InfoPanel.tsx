import type { ReactNode } from 'react'
import { cn } from '@utils/cn'

interface InfoSectionHeaderProps {
  icon: ReactNode
  title: string
}

/** Đầu thẻ thông tin: chip icon dùng tông primary, tiêu đề dùng màu foreground. */
export const InfoSectionHeader = ({ icon, title }: InfoSectionHeaderProps) => (
  <div className='flex items-center gap-2'>
    <span className='flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary'>
      {icon}
    </span>
    <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
  </div>
)

interface InfoSubHeadingProps {
  children: ReactNode
}

export const InfoSubHeading = ({ children }: InfoSubHeadingProps) => (
  <h3 className='pt-2 text-sm font-semibold text-foreground'>{children}</h3>
)

const EMPHASIS_CLASS = {
  default: 'font-medium text-foreground',
  strong: 'font-semibold text-foreground',
  amount: 'font-bold tabular-nums text-foreground'
} as const

interface InfoRowProps {
  label: string
  value: ReactNode
  emphasis?: keyof typeof EMPHASIS_CLASS
  /** Tông riêng cho giá trị, ví dụ text-success cho số dư khả dụng. */
  valueClassName?: string
}

/**
 * Một dòng nhãn — giá trị. Dùng dt/dd để trình đọc màn hình ghép đúng cặp,
 * và tabular-nums cho số tiền để các dòng thẳng cột.
 */
export const InfoRow = ({ label, value, emphasis = 'default', valueClassName }: InfoRowProps) => (
  <div className='-mx-2 flex items-start justify-between gap-4 rounded-sm px-2 py-1.5 transition-colors hover:bg-muted'>
    <dt className='min-w-[124px] shrink-0 text-muted-foreground'>{label}</dt>
    <dd className={cn('text-right', EMPHASIS_CLASS[emphasis], valueClassName)}>{value}</dd>
  </div>
)

interface InfoListProps {
  children: ReactNode
  className?: string
}

export const InfoList = ({ children, className }: InfoListProps) => (
  <dl className={cn('flex flex-col', className)}>{children}</dl>
)

export const InfoDivider = () => <hr className='my-3 border-border' />
