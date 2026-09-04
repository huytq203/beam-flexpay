import type { ReactNode } from 'react'

import { CardComponent } from '@components/index'

interface BusinessWalletFormSectionProps {
  id: string
  step: string
  title: string
  children: ReactNode
}

export function BusinessWalletFormSection({
  id,
  step,
  title,
  children
}: BusinessWalletFormSectionProps) {
  return (
    <CardComponent className='overflow-hidden border-border bg-background! shadow-none [&_.ant-card-body]:p-0!'>
      <section aria-labelledby={id}>
        <div className='flex items-center gap-3 border-b border-border bg-muted/60! px-4 py-3 sm:px-5'>
          <span
            aria-hidden='true'
            className='flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary! text-xs font-semibold text-primary-foreground'
          >
            {step}
          </span>
          <h2 id={id} className='text-sm font-semibold text-foreground sm:text-base'>
            {title}
          </h2>
        </div>
        <div className='grid grid-cols-12 gap-4 p-4 sm:p-5'>{children}</div>
      </section>
    </CardComponent>
  )
}
