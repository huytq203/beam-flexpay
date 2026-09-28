import type { ReactNode } from 'react'
import { CardComponent } from '@components/index'

interface Props {
  id: string
  step: string
  title: string
  children: ReactNode
}

export function MerchantFormSection({ id, step, title, children }: Props) {
  return (
    <CardComponent
      className='overflow-hidden border-border bg-background! shadow-none'
      styles={{ body: { padding: 0 } }}
    >
      <section aria-labelledby={id}>
        <div className='flex items-center gap-3 border-b border-border bg-muted/60! px-4 py-3 sm:px-5'>
          <span
            aria-hidden='true'
            className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary! text-xs font-semibold text-primary-foreground'
          >
            {step}
          </span>
          <h2
            id={id}
            className='text-sm font-semibold text-foreground sm:text-base'
          >
            {title}
          </h2>
        </div>
        <div className='p-4 sm:p-5'>{children}</div>
      </section>
    </CardComponent>
  )
}
