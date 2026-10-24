import { FIELD_KEYS } from '../constants/holdRule.constants'
import type { HoldRuleKey, HoldRulePolicy } from '../types/holdRule.types'
import type { HoldRuleDraft } from './holdRuleDraft.utils'

const CAP_KEYS: HoldRuleKey[] = [
  'capMode',
  'capAmount',
  'capPercent',
  'capBehaviour'
]

/** Giá trị đang có hiệu lực trong form: ô tự đặt lấy từ form, còn lại kế thừa. */
export const resolveValue = (
  key: HoldRuleKey,
  draft: HoldRuleDraft,
  policy?: HoldRulePolicy
): unknown =>
  draft.own.includes(key) ? draft.values[key] : (policy?.[key] ?? null)

/**
 * Chỉ hiện tham số liên quan tới chế độ đang chọn (BE vẫn giữ giá trị của tham
 * số không áp dụng, nhưng người dùng không cần thấy chúng).
 */
export const visibleKeys = (
  draft: HoldRuleDraft,
  policy?: HoldRulePolicy
): HoldRuleKey[] => {
  const mode = resolveValue('calculationMode', draft, policy)
  const capMode = resolveValue('capMode', draft, policy)
  const capOn =
    resolveValue('capEnabled', draft, policy) === true ||
    draft.own.some((key) => CAP_KEYS.includes(key))
  return FIELD_KEYS.filter((key) => {
    if (key === 'ratePercent') return mode !== 'FIXED_PER_TRANSACTION'
    if (key === 'fixedAmount') return mode !== 'PERCENT_OF_GROSS'
    if (CAP_KEYS.includes(key) && !capOn) return false
    if (key === 'capAmount') return capMode !== 'PERCENT_OF_30_DAY_REVENUE'
    if (key === 'capPercent') return capMode !== 'FIXED_AMOUNT'
    return true
  })
}
