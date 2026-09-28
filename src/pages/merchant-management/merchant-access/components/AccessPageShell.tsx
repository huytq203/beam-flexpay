import type { ReactNode } from 'react'

import { FunnelIcon } from '@components/icons'
import { CardComponent } from '@components/index'

interface Props {
  title: string
  count?: number
  actions: ReactNode
  toolbar: ReactNode
  children: ReactNode
}

export function AccessPageShell({
  title,
  count,
  actions,
  toolbar,
  children
}: Props) {
  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <section aria-labelledby='access-filter-title'>
          <header className='mb-4 flex items-center gap-2 border-b border-border pb-3'>
            <FunnelIcon
              aria-hidden
              size={18}
              className='text-secondary-foreground'
            />
            <h2
              id='access-filter-title'
              className='font-display text-base font-semibold text-foreground'
            >
              Bộ lọc tìm kiếm
            </h2>
          </header>
          {toolbar}
        </section>
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <section aria-labelledby='access-list-title'>
          <header className='mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3'>
            <h2
              id='access-list-title'
              className='font-display text-base font-semibold text-foreground'
            >
              {title}
            </h2>
            <div className='flex flex-wrap items-center justify-end gap-2'>
              {count !== undefined && (
                <span
                  aria-live='polite'
                  className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
                >
                  {count} bản ghi
                </span>
              )}
              {actions}
            </div>
          </header>
          {children}
        </section>
      </CardComponent>
    </main>
  )
}
