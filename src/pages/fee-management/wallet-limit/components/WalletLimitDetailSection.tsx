import type { ReactNode } from 'react'

interface WalletLimitDetailSectionProps {
  title: string
  children: ReactNode
}

/** Các khối trong một card được ngăn bằng đường kẻ 1px, không lồng thẻ. */
export function WalletLimitDetailSection({
  title,
  children
}: WalletLimitDetailSectionProps) {
  return (
    <section className='mt-4 flex flex-col gap-3 border-t border-border pt-4 first:mt-0 first:border-t-0 first:pt-0'>
      <h2 className='text-base font-semibold'>{title}</h2>
      {children}
    </section>
  )
}

interface WalletLimitDetailFieldProps {
  label: string
  children: ReactNode
}

export function WalletLimitDetailGrid({ children }: { children: ReactNode }) {
  return (
    <dl className='m-0 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4'>
      {children}
    </dl>
  )
}

export function WalletLimitDetailField({
  label,
  children
}: WalletLimitDetailFieldProps) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='m-0 mt-1 font-medium tabular-nums'>{children}</dd>
    </div>
  )
}
