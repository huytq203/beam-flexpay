import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { Link } from 'react-router-dom'
import {
  SCOPE_LABELS,
  TRANSACTION_TYPE_LABELS
} from '../constants/walletLimit.constants'
import {
  describePolicyTarget,
  walletLimitPaths
} from '../utils/walletLimit.paths'

const LINK_CLASS = 'underline underline-offset-4 hover:text-foreground'

export function WalletLimitFormBreadcrumb({
  policy
}: {
  policy?: WalletLimitPolicy
}) {
  return (
    <nav
      aria-label='Đường dẫn'
      className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'
    >
      <Link
        to={walletLimitPaths.list}
        className={LINK_CLASS}
      >
        Hạn mức ví
      </Link>
      <span aria-hidden>/</span>
      {policy && (
        <>
          <Link
            to={walletLimitPaths.detail(policy.id)}
            className={LINK_CLASS}
          >
            {describePolicyTarget(
              SCOPE_LABELS[policy.scopeType],
              policy.targetDisplay,
              TRANSACTION_TYPE_LABELS[policy.transactionType]
            )}
          </Link>
          <span aria-hidden>/</span>
        </>
      )}
      <span aria-current='page'>{policy ? 'Cập nhật' : 'Thêm mới'}</span>
    </nav>
  )
}
