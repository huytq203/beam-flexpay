import { useFormContext, useWatch } from 'react-hook-form'
import {
  getLimitHint,
  getLimitLabel,
  LIMIT_FIELD_LABELS,
  OUTFLOW_LIMIT_KEYS,
  TRANSACTION_LIMIT_KEYS,
  REQUIRED_LIMIT_KEYS,
  type LimitFieldKey
} from '../constants/walletLimit.constants'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { getLimitApplicability } from '../utils/walletLimit.rules'
import { WalletLimitFormNumberField } from './WalletLimitFormNumberField'
import { WalletLimitFormSection } from './WalletLimitFormSection'

const GRID = 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
const REQUIRED_PLACEHOLDER = 'Nhập số tiền'
const OPTIONAL_PLACEHOLDER = 'Không giới hạn'

const LOCKED_PLACEHOLDERS: Partial<Record<LimitFieldKey, string>> = {
  walletBalanceMaximum: 'Chỉ khi loại giao dịch là Tất cả',
  outflowDailyMaximum: 'Không áp dụng cho Nạp tiền',
  outflowMonthlyMaximum: 'Không áp dụng cho Nạp tiền',
  outboundMaxTimesPerDay: 'Không áp dụng cho Nạp tiền',
  approvalThreshold: 'Chỉ với Tất cả hoặc Rút tiền'
}

export function WalletLimitFormTransactionLimits() {
  const { control } = useFormContext<WalletLimitFormValues>()
  const transactionType = useWatch({ control, name: 'transactionType' })
  return (
    <WalletLimitFormSection title='Hạn mức giao dịch'>
      <div className={GRID}>
        {TRANSACTION_LIMIT_KEYS.map((key) => {
          const required = REQUIRED_LIMIT_KEYS.includes(key)
          return (
            <WalletLimitFormNumberField
              key={key}
              name={key}
              label={getLimitLabel(key, transactionType)}
              hint={getLimitHint(key, transactionType)}
              required={required}
              placeholder={
                required ? REQUIRED_PLACEHOLDER : OPTIONAL_PLACEHOLDER
              }
            />
          )
        })}
      </div>
    </WalletLimitFormSection>
  )
}

export function WalletLimitFormOutflowLimits() {
  const { control } = useFormContext<WalletLimitFormValues>()
  const transactionType = useWatch({ control, name: 'transactionType' })
  const rule = getLimitApplicability(transactionType)
  const isApplicable: Record<(typeof OUTFLOW_LIMIT_KEYS)[number], boolean> = {
    walletBalanceMaximum: rule.walletBalance,
    outflowDailyMaximum: rule.outflow,
    outflowMonthlyMaximum: rule.outflow,
    outboundMaxTimesPerDay: rule.outflow,
    approvalThreshold: rule.approvalThreshold
  }

  return (
    <WalletLimitFormSection title='Giới hạn chi & số dư ví'>
      <div className={GRID}>
        {OUTFLOW_LIMIT_KEYS.map((key) => (
          <WalletLimitFormNumberField
            key={key}
            name={key}
            label={LIMIT_FIELD_LABELS[key]}
            disabled={!isApplicable[key]}
            placeholder={
              isApplicable[key]
                ? OPTIONAL_PLACEHOLDER
                : (LOCKED_PLACEHOLDERS[key] ?? OPTIONAL_PLACEHOLDER)
            }
          />
        ))}
      </div>
    </WalletLimitFormSection>
  )
}
