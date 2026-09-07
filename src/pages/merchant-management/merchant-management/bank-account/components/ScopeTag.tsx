import { cn } from '@utils/cn'

import { SCOPE_LABEL } from '../constants/bank-account.constant'
import { BankAccountScope } from '../types/bank-account.type'

interface ScopeTagProps {
  scope: BankAccountScope
}

/** Nhãn cấp áp dụng: Master mang tông thương hiệu, Sub giữ tông trung tính. */
export function ScopeTag({ scope }: ScopeTagProps) {
  return (
    <span
      className={cn(
        'w-fit rounded-sm px-1.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
        scope === BankAccountScope.MASTER
          ? 'bg-primary/15 text-secondary-foreground'
          : 'bg-muted text-muted-foreground'
      )}
    >
      {SCOPE_LABEL[scope]}
    </span>
  )
}
