import { cn } from '@lib/utils/cn'
import type { ReactNode } from 'react'

export interface ChipTabGroupProps {
  /** `tablist` cho tab; `group` cho bộ lọc bật/tắt. */
  role?: 'tablist' | 'group'
  'aria-label'?: string
  className?: string
  children: ReactNode
}

export const ChipTabGroup = ({
  role = 'group',
  className,
  children,
  ...rest
}: ChipTabGroupProps) => (
  <div
    {...rest}
    role={role}
    className={cn('flex flex-wrap gap-2', className)}
  >
    {children}
  </div>
)
