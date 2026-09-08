import type { ApplicableFeeRule } from '@/app/schemas/applicable-fee-rule.schema'

/** Một luật chỉ duy nhất theo bản gán, thành phần phí và bậc. */
export const createApplicableFeeRuleRowKey = (
  rule: ApplicableFeeRule
): string =>
  `${rule.assignmentId}-${rule.componentType}-${rule.tierFrom ?? 'direct'}`
