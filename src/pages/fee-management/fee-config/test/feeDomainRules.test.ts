import { FeeDomain } from '@components/fee/feeDomain'
import { describe, expect, it } from 'vitest'
import {
  getDomainFieldRules,
  getFeeDomainForServiceType,
  getFormFieldRules
} from '../constants/feeConfigFields'

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

describe('getFormFieldRules — ô gán đối tượng theo loại giao dịch', () => {
  it('thu hộ và chi hộ mở ô Merchant cùng ô Ngân hàng tuỳ chọn', () => {
    for (const serviceType of [
      'MERCHANT_VA_BILL_COLLECTION',
      'PAYOUT_BANK_TRANSFER'
    ]) {
      const rules = getFormFieldRules(FeeDomain.MERCHANT, serviceType)
      expect(rules.showMerchant).toBe(true)
      expect(rules.bankRequired).toBe(false)
      expect(rules.showSubject).toBe(false)
      expect(rules.showSegment).toBe(false)
    }
  })

  it('nạp, rút, chuyển nội bộ mở ví riêng và nhóm khách, không có Merchant', () => {
    for (const serviceType of [
      'EWALLET_DEPOSIT',
      'EWALLET_WITHDRAWAL',
      'EWALLET_TRANSFER_INTERNAL'
    ]) {
      const rules = getFormFieldRules(FeeDomain.EWALLET, serviceType)
      expect(rules.showMerchant).toBe(false)
      expect(rules.showSubject).toBe(true)
      expect(rules.showSegment).toBe(true)
    }
  })

  it('mọi loại giao dịch đã duyệt được đều chọn được khi tạo mới', () => {
    expect([...getFormFieldRules(FeeDomain.EWALLET, '').serviceTypes].sort()).toEqual([
      'EWALLET_DEPOSIT',
      'EWALLET_TRANSFER_INTERNAL',
      'EWALLET_WITHDRAWAL',
      'MERCHANT_VA_BILL_COLLECTION',
      'PAYOUT_BANK_TRANSFER'
    ])
  })

  it('chính sách Bank/NCC cũ giữ luật cũ: bắt buộc chọn ngân hàng', () => {
    const rules = getFormFieldRules(FeeDomain.BANK, 'EWALLET_DEPOSIT')
    expect(rules.bankRequired).toBe(true)
    expect(rules.showMerchant).toBe(true)
  })

  it('miền phí suy từ loại giao dịch', () => {
    expect(getFeeDomainForServiceType('EWALLET_DEPOSIT')).toBe(FeeDomain.EWALLET)
    expect(getFeeDomainForServiceType('PAYOUT_BANK_TRANSFER')).toBe(
      FeeDomain.MERCHANT
    )
    expect(getFeeDomainForServiceType('')).toBe(FeeDomain.EWALLET)
  })
})
