import { cn } from '@lib/utils/cn'

import type { ScopeDiff } from '../utils/scopeProposalDiff'

interface ScopeProposalDiffProps {
  label: string
  diff: ScopeDiff
  getName: (id: string) => string
}

const PILL = 'rounded-md border px-2 text-xs leading-5'

export function ScopeProposalDiff({
  label,
  diff,
  getName
}: ScopeProposalDiffProps) {
  const isEmpty =
    diff.kept.length + diff.added.length + diff.removed.length === 0
  return (
    <div className='flex flex-wrap items-baseline gap-2'>
      <span className='w-24 shrink-0 text-xs text-muted-foreground'>
        {label}
      </span>
      {isEmpty && (
        <span className={cn(PILL, 'border-border text-muted-foreground')}>
          Không có
        </span>
      )}
      {diff.kept.map((id) => (
        <span
          key={id}
          className={cn(PILL, 'border-border text-muted-foreground')}
        >
          {getName(id)}
        </span>
      ))}
      {diff.added.map((id) => (
        <span
          key={id}
          className={cn(
            PILL,
            'border-success-strong bg-success-strong/10 text-success-strong'
          )}
        >
          + {getName(id)}
        </span>
      ))}
      {diff.removed.map((id) => (
        <span
          key={id}
          className={cn(
            PILL,
            'border-danger-strong bg-danger-strong/10 text-danger-strong line-through'
          )}
        >
          {getName(id)}
        </span>
      ))}
    </div>
  )
}
