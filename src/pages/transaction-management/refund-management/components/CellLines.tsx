import type { ReactNode } from 'react'
import { cn } from '@lib/utils/cn'

interface CellLinesProps {
  primary: ReactNode
  secondary?: (ReactNode | null | undefined | false)[]
  align?: 'left' | 'right'
  numeric?: boolean
}

export function CellLines({
  primary,
  secondary = [],
  align = 'left',
  numeric = false
}: CellLinesProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'right' && 'items-end text-right',
        numeric && 'tabular-nums'
      )}
    >
      <span className='font-medium text-foreground'>{primary}</span>
      {secondary.map((line, index) =>
        line ? (
          <span
            key={index}
            className='text-xs text-muted-foreground'
          >
            {line}
          </span>
        ) : null
      )}
    </div>
  )
}
