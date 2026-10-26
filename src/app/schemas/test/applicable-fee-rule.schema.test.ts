import { describe, expect, it } from 'vitest'
import {
  applicableFeeRulePageSchema,
  applicableFeeRuleQuerySchema
} from '../applicable-fee-rule.schema'

const validRule = {
  assignmentId: '6b1f3c2a-8f4e-4a1b-9c33-7d9a1e5b0f21',
  feePolicyId: '1c9d4e77-2b60-4f0a-b1d8-5a2c9e3f4a10',
  feePolicyName: 'Phí nạp tiền ATM',
  appliedObjectType: 'ACCOUNT',
  customerGroup: null,
  serviceType: 'EWALLET_DEPOSIT',
  paymentMethod: 'ATM',
  cardType: null,
  bankCode: null,
  componentType: 'TRANSACTION_FEE',
  tierFrom: 0,
  tierTo: null,
  formula: '1% + 5.000',
  minFee: 0,
  maxFee: 50000,
  createdAt: '2026-03-11T09:24:05',
  validFrom: '2026-04-01T00:00:00',
  validTo: null,
  effectiveStatus: 'ACTIVE'
}

const validPage = {
  content: [validRule],
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    offset: 0,
    paged: true,
    unpaged: false,
    sort: { empty: true, sorted: false, unsorted: true }
  },
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0,
  numberOfElements: 1,
  first: true,
  last: true,
  empty: false,
  sort: { empty: true, sorted: false, unsorted: true }
}

describe('applicableFeeRule schemas', () => {
  it('chấp nhận page đúng contract backend', () => {
    expect(applicableFeeRulePageSchema.safeParse(validPage).success).toBe(true)
  })

  it('từ chối response thiếu field bắt buộc', () => {
    const invalidRule = { ...validRule, formula: undefined }
    const invalidPage = { ...validPage, content: [invalidRule] }

    expect(applicableFeeRulePageSchema.safeParse(invalidPage).success).toBe(
      false
    )
  })

  it('chặn UUID sai và giới hạn size lớn hơn 100 trước khi gọi API', () => {
    expect(
      applicableFeeRuleQuerySchema.safeParse({
        merchantId: 'wallet-invalid',
        size: 101
      }).success
    ).toBe(false)
  })
})
