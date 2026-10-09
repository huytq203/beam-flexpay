import { useNavigate } from 'react-router-dom'
import { Can } from '@/app/permissions'
import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { ButtonComponent, CardComponent, TagComponent } from '@components/index'
import {
  SCOPE_LABELS,
  STATUS_LABELS,
  TRANSACTION_TYPE_LABELS
} from '../constants/walletLimit.constants'
import {
  describePolicyTarget,
  walletLimitPaths
} from '../utils/walletLimit.paths'

interface WalletLimitDetailHeaderProps {
  policy: WalletLimitPolicy
}

const SCOPE_COLORS = {
  SYSTEM: 'default',
  GROUP: 'cyan',
  WALLET: 'blue'
} as const
const STATUS_COLORS = { ACTIVE: 'success', LOCKED: 'error' } as const

const getPolicyTitle = (policy: WalletLimitPolicy): string =>
  describePolicyTarget(
    SCOPE_LABELS[policy.scopeType],
    policy.targetDisplay,
    TRANSACTION_TYPE_LABELS[policy.transactionType]
  )

export function WalletLimitDetailHeader({
  policy
}: WalletLimitDetailHeaderProps) {
  const navigate = useNavigate()

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div className='min-w-0'>
          <h1 className='break-words text-xl font-semibold'>
            {getPolicyTitle(policy)}
          </h1>
          <div className='mt-2 flex flex-wrap gap-2'>
            <TagComponent color={SCOPE_COLORS[policy.scopeType]}>
              {SCOPE_LABELS[policy.scopeType]}
            </TagComponent>
            <TagComponent color={STATUS_COLORS[policy.status]}>
              {STATUS_LABELS[policy.status]}
            </TagComponent>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <ButtonComponent
            type='default'
            content='Lịch sử cập nhật'
            onClick={() => navigate(walletLimitPaths.history(policy.id))}
          />
          <Can
            screen='WALLET_LIMIT'
            action='edit'
          >
            <ButtonComponent
              content='Cập nhật'
              onClick={() => navigate(walletLimitPaths.edit(policy.id))}
            />
          </Can>
        </div>
      </div>
    </CardComponent>
  )
}
