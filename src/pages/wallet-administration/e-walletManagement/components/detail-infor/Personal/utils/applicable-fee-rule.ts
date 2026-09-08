import {
  formatUTCDateTimeByOffset,
  UTC_OFFSET_HOURS
} from '@/app/utils/helper-functions/date'

/** Định dạng số tiền phí dùng chung với module Phí — nguồn ở `@utils/fee-format`. */
export {
  formatFeeNumber,
  formatFeeLimit,
  formatTierRange
} from '@utils/fee-format'
export { createApplicableFeeRuleRowKey } from '@utils/fee-rule-key'

export const formatFeeLocalDateTime = (value: string | null): string => {
  if (!value) return '—'
  return formatUTCDateTimeByOffset(value, UTC_OFFSET_HOURS.VIETNAM)
}
