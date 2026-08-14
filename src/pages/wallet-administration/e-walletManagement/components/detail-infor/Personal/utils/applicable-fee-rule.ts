import type { ApplicableFeeRule } from '@/app/schemas/applicable-fee-rule.schema'
import {
  formatUTCDateTimeByOffset,
  UTC_OFFSET_HOURS
} from '@/app/utils/helper-functions/date'

const FEE_NUMBER_FORMATTER = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 4
})

export const formatFeeNumber = (value: number): string =>
  FEE_NUMBER_FORMATTER.format(value)

export const formatFeeLimit = (value: number | null): string =>
  value === null || value <= 0 ? '—' : `${formatFeeNumber(value)} đ`

export const formatTierRange = (
  tierFrom: number | null,
  tierTo: number | null
): string => {
  if (tierFrom === null && tierTo === null) return 'Không chia bậc'
  if (tierFrom === null && tierTo !== null) {
    return `Đến ${formatFeeNumber(tierTo)}`
  }
  if (tierFrom !== null && tierTo === null) {
    return `${formatFeeNumber(tierFrom)} trở lên`
  }

  return tierFrom !== null && tierTo !== null
    ? `${formatFeeNumber(tierFrom)} – ${formatFeeNumber(tierTo)}`
    : 'Không chia bậc'
}

export const formatFeeLocalDateTime = (value: string | null): string => {
  if (!value) return '—'
  return formatUTCDateTimeByOffset(value, UTC_OFFSET_HOURS.UTC)
}

export const createApplicableFeeRuleRowKey = (
  rule: ApplicableFeeRule
): string =>
  `${rule.assignmentId}-${rule.componentType}-${rule.tierFrom ?? 'direct'}`
