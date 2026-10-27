import type { ApplicableFeeRule } from '@/app/schemas/applicable-fee-rule.schema'

export interface GroupedFeeRule extends ApplicableFeeRule {
  groupKey: string
  /** Mỗi thành phần phí (phí giao dịch, VAT…) của cùng một chính sách. */
  components: ApplicableFeeRule[]
}

/**
 * Cùng chính sách và cùng phạm vi áp dụng (đối tượng, loại giao dịch, bậc, thời hạn)
 * thì gộp thành một dòng; bậc khác nhau vẫn tách dòng để không mất thông tin.
 */
const createGroupKey = (rule: ApplicableFeeRule): string =>
  [
    rule.feePolicyId,
    rule.assignmentId,
    rule.appliedObjectType,
    rule.customerGroup,
    rule.serviceType,
    rule.paymentMethod,
    rule.cardType,
    rule.bankCode,
    rule.tierFrom,
    rule.tierTo,
    rule.validFrom,
    rule.validTo,
    rule.effectiveStatus
  ].join('|')

export const groupFeeRulesByPolicy = (
  rules: readonly ApplicableFeeRule[]
): GroupedFeeRule[] => {
  const groups = new Map<string, GroupedFeeRule>()
  for (const rule of rules) {
    const groupKey = createGroupKey(rule)
    const existing = groups.get(groupKey)
    if (existing) existing.components.push(rule)
    else groups.set(groupKey, { ...rule, groupKey, components: [rule] })
  }
  return [...groups.values()]
}
