import { cn } from '@lib/utils/cn'

import type { ManagementPageHeaderProps } from './management.types'

export function ManagementPageHeader({
  title,
  description,
  total,
  primaryAction,
  actions
}: ManagementPageHeaderProps) {
  return (
    <header className='flex flex-col gap-3 border-b border-border pb-3 md:flex-row md:items-start md:justify-between'>
      <div className='min-w-0 space-y-1'>
        <h1 className='font-display text-base font-semibold text-foreground'>{title}</h1>
        {description && (
          <p className='max-w-[76ch] text-xs leading-5 text-muted-foreground'>{description}</p>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2 md:justify-end'>
        {typeof total === 'number' && (
          <span
            aria-live='polite'
            className={cn(
              'rounded-md border border-border bg-muted px-2 py-1',
              'text-xs font-medium text-muted-foreground tabular-nums'
            )}
          >
            {total} bản ghi
          </span>
        )}
        {actions}
        {primaryAction}
      </div>
    </header>
  )
}
