import { FeeDomain } from '@components/fee/feeDomain'
import { describe, expect, it } from 'vitest'
import { getDomainFieldRules } from '../constants/feeConfigFields'

describe('getDomainFieldRules', () => {
  it('miền ví không bày loại giao dịch thu chi hộ', () => {
    const rules = getDomainFieldRules(FeeDomain.EWALLET)
    expect(rules.serviceTypes).not.toContain('MERCHANT_VA_BILL_COLLECTION')
    expect(rules.showMerchant).toBe(false)
  })

  it('miền ĐVCNTT chỉ bày thu hộ và chi hộ', () => {
    const rules = getDomainFieldRules(FeeDomain.MERCHANT)
    expect([...rules.serviceTypes].sort()).toEqual([
      'MERCHANT_VA_BILL_COLLECTION',
      'PAYOUT_BANK_TRANSFER'
    ])
    expect(rules.showMerchant).toBe(true)
  })

  it('chỉ miền Ví mở ô gán riêng cho một ví', () => {
    expect(getDomainFieldRules(FeeDomain.EWALLET).showSubject).toBe(true)
    expect(getDomainFieldRules(FeeDomain.BANK).showSubject).toBe(false)
    // Luồng thu hộ và chi hộ nhận chủ thể là ĐVCNTT, đã có ô riêng.
    expect(getDomainFieldRules(FeeDomain.MERCHANT).showSubject).toBe(false)
  })

  it('miền Bank loại chuyển tiền nội bộ vì không qua ngân hàng', () => {
    const rules = getDomainFieldRules(FeeDomain.BANK)
    expect(rules.serviceTypes).not.toContain('EWALLET_TRANSFER_INTERNAL')
    expect(rules.bankRequired).toBe(true)
    expect(rules.showMerchant).toBe(true)
  })

  it('không miền nào bày loại giao dịch chưa duyệt được', () => {
    for (const domain of [
      FeeDomain.BANK,
      FeeDomain.EWALLET,
      FeeDomain.MERCHANT
    ]) {
      const { serviceTypes } = getDomainFieldRules(domain)
      expect(serviceTypes).not.toContain('EWALLET_TRANSFER_EXTERNAL')
      expect(serviceTypes).not.toContain('EWALLET_CASHBACK')
    }
  })
})
