import { describe, expect, it } from 'vitest'
import type { ApplicableFeeRule } from '@/app/schemas/applicable-fee-rule.schema'
import {
  createApplicableFeeRuleRowKey,
  formatFeeLimit,
  formatFeeLocalDateTime,
  formatTierRange
} from '../applicable-fee-rule'

const rule: ApplicableFeeRule = {
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
  formula: '1%',
  minFee: null,
  maxFee: null,
  createdAt: null,
  validFrom: null,
  validTo: null,
  effectiveStatus: 'ACTIVE'
}

describe('applicable fee rule formatters', () => {
  it('hiển thị đúng bậc phí không giới hạn trên', () => {
    expect(formatTierRange(5000000, null)).toBe('5.000.000 trở lên')
    expect(formatTierRange(null, null)).toBe('Không chia bậc')
  })

  it('coi min/max bằng 0 hoặc null là không giới hạn', () => {
    expect(formatFeeLimit(0)).toBe('—')
    expect(formatFeeLimit(null)).toBe('—')
    expect(formatFeeLimit(50000)).toBe('50.000 đ')
  })

  it('chuyển giờ UTC sang UTC+7 trước khi hiển thị', () => {
    expect(formatFeeLocalDateTime('2026-08-14T13:55:12')).toBe(
      '14/08/2026 20:55:12'
    )
  })

  it('tạo row key theo contract assignment, component và tier', () => {
    expect(createApplicableFeeRuleRowKey(rule)).toBe(
      '6b1f3c2a-8f4e-4a1b-9c33-7d9a1e5b0f21-TRANSACTION_FEE-0'
    )
  })
})
