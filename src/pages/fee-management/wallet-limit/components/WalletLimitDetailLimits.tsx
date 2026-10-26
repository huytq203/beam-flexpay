import type { WalletLimitPolicy } from '@type/walletLimit.type'
import {
  getLimitLabel,
  OUTFLOW_LIMIT_KEYS,
  TRANSACTION_LIMIT_KEYS,
  type LimitFieldKey
} from '../constants/walletLimit.constants'
import {
  formatLimitCount,
  formatLimitMoney,
  UNLIMITED_LABEL
} from '../utils/walletLimit.format'
import {
  getLimitApplicability,
  type LimitApplicability
} from '../utils/walletLimit.rules'
import {
  WalletLimitDetailField,
  WalletLimitDetailGrid
} from './WalletLimitDetailSection'

interface WalletLimitDetailLimitsProps {
  policy: WalletLimitPolicy
}

const LIMIT_KEYS: readonly LimitFieldKey[] = [
  ...TRANSACTION_LIMIT_KEYS,
  ...OUTFLOW_LIMIT_KEYS
]

const isApplicable = (
  key: LimitFieldKey,
  rules: LimitApplicability
): boolean => {
  if (key === 'walletBalanceMaximum') return rules.walletBalance
  if (key === 'approvalThreshold') return rules.approvalThreshold
  if (
    key === 'outflowDailyMaximum' ||
    key === 'outflowMonthlyMaximum' ||
    key === 'outboundMaxTimesPerDay'
  ) {
    return rules.outflow
  }
  return true
}

export function WalletLimitDetailLimits({
  policy
}: WalletLimitDetailLimitsProps) {
  const rules = getLimitApplicability(policy.transactionType)

  return (
    <WalletLimitDetailGrid>
      {LIMIT_KEYS.filter((key) => isApplicable(key, rules)).map((key) => {
        const value = policy[key]
        const text =
          key === 'outboundMaxTimesPerDay'
            ? formatLimitCount(value)
            : formatLimitMoney(value)
        return (
          <WalletLimitDetailField
            key={key}
            label={getLimitLabel(key, policy.transactionType)}
          >
            {text === UNLIMITED_LABEL ? (
              <span className='font-normal text-muted-foreground'>{text}</span>
            ) : (
              text
            )}
          </WalletLimitDetailField>
        )
      })}
    </WalletLimitDetailGrid>
  )
}
