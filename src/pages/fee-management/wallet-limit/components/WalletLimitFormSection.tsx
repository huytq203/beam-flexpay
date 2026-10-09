import { CardComponent } from '@components/index'
import type { ReactNode } from 'react'

interface WalletLimitFormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

/** Mỗi khối của form là một card riêng, tiêu đề ngăn với nội dung bằng đường kẻ 1px. */
export function WalletLimitFormSection({
  title,
  description,
  children
}: WalletLimitFormSectionProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section className='flex flex-col gap-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='text-base font-semibold text-foreground'>{title}</h2>
          {description && (
            <p className='mt-1 max-w-prose text-xs text-muted-foreground'>
              {description}
            </p>
          )}
        </header>
        {children}
      </section>
    </CardComponent>
  )
}
