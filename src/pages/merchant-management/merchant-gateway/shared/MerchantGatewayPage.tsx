import { Children, useId } from 'react'

import { Can } from '@/app/permissions'
import { ButtonComponent, CardComponent } from '@components/index'

import type { MerchantGatewayPageProps } from './merchantGateway.types'

export function MerchantGatewayPage({
  title,
  description,
  total,
  createLabel,
  screen,
  onCreate,
  children
}: MerchantGatewayPageProps) {
  const titleId = useId()
  const [toolbar, ...listContent] = Children.toArray(children)

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        {toolbar}
      </CardComponent>

      <CardComponent className='border border-border bg-background shadow-none'>
        <section aria-labelledby={titleId}>
          <header className='mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3'>
            <div className='min-w-0 space-y-1'>
              <h1
                id={titleId}
                className='font-display text-base font-semibold text-foreground'
              >
                {title}
              </h1>
              <p className='max-w-3xl text-xs leading-relaxed text-muted-foreground'>
                {description}
              </p>
            </div>

            <div className='flex flex-wrap items-center justify-end gap-2'>
              <span
                aria-live='polite'
                className='rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground tabular-nums'
              >
                {total} bản ghi
              </span>
              <Can screen={screen} action='create'>
                <ButtonComponent
                  content={createLabel}
                  htmlType='button'
                  onClick={onCreate}
                />
              </Can>
            </div>
          </header>

          {listContent}
        </section>
      </CardComponent>
    </main>
  )
}
