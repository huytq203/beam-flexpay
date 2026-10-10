import type { ReactNode } from 'react'

interface DetailSectionProps {
  title: string
  children: ReactNode
  note?: string
}

export function DetailSection({ title, children, note }: DetailSectionProps) {
  return (
    <section className='flex flex-col gap-2'>
      <h3 className='font-display text-sm font-semibold text-foreground'>
        {title}
      </h3>
      {children}
      {note && <p className='text-xs text-muted-foreground'>{note}</p>}
    </section>
  )
}

interface DetailRowsProps {
  rows: {
    label: string
    value: ReactNode
    strong?: boolean
    numeric?: boolean
  }[]
}

export function DetailRows({ rows }: DetailRowsProps) {
  return (
    <dl className='grid grid-cols-[10rem_1fr] gap-x-3 gap-y-2 text-sm'>
      {rows.map((row) => (
        <div
          key={row.label}
          className='contents'
        >
          <dt className='text-muted-foreground'>{row.label}</dt>
          <dd
            className={
              row.strong
                ? 'font-semibold text-foreground tabular-nums'
                : row.numeric
                  ? 'tabular-nums'
                  : undefined
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
