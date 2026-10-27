import { describe, expect, it } from 'vitest'
import type { ApplicableFeeRule } from '@/app/schemas/applicable-fee-rule.schema'
import { groupFeeRulesByPolicy } from '../group-fee-rules'

const rule = (overrides: Partial<ApplicableFeeRule>): ApplicableFeeRule => ({
  assignmentId: 'f114e266-c88b-458a-bfdd-e783cab3496f',
  feePolicyId: 'bf671fbf-4eb4-4c65-9e1d-15dd95191836',
  feePolicyName: 'Nạp tiền',
  appliedObjectType: 'ACCOUNT',
  customerGroup: null,
  serviceType: 'EWALLET_DEPOSIT',
  paymentMethod: null,
  cardType: null,
  bankCode: null,
  componentType: 'TRANSACTION_FEE',
  tierFrom: null,
  tierTo: null,
  formula: '0.5% + 100đ',
  minFee: 100,
  maxFee: 500,
  createdAt: '2026-10-27T13:45:25',
  validFrom: '2026-10-27T13:46:26',
  validTo: null,
  effectiveStatus: 'ACTIVE',
  ...overrides
})

describe('groupFeeRulesByPolicy', () => {
  it('gộp các thành phần cùng chính sách thành một dòng', () => {
    const rows = groupFeeRulesByPolicy([
      rule({}),
      rule({ componentType: 'VAT', formula: '2%', minFee: 0, maxFee: 0 })
    ])

    expect(rows).toHaveLength(1)
    expect(rows[0].components.map((c) => c.componentType)).toEqual([
      'TRANSACTION_FEE',
      'VAT'
    ])
  })

  it('giữ dòng riêng cho chính sách khác hoặc bậc khác', () => {
    const rows = groupFeeRulesByPolicy([
      rule({ tierFrom: 0, tierTo: 1000 }),
      rule({ tierFrom: 1000, tierTo: null }),
      rule({ feePolicyId: 'a0000000-0000-4000-8000-000000000000' })
    ])

    expect(rows).toHaveLength(3)
  })
})
