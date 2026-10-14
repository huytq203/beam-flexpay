import type { ReactNode } from 'react'

interface DetailSectionProps {
  title: string
  note?: ReactNode
  children: ReactNode
}

export function DetailSection({ title, note, children }: DetailSectionProps) {
  return (
    <section className='flex flex-col gap-2'>
      <div>
        <h3 className='font-display text-sm font-semibold text-foreground'>
          {title}
        </h3>
        {note && <p className='text-xs text-muted-foreground'>{note}</p>}
      </div>
      {children}
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
