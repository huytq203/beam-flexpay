import { FeeDomain } from '@components/fee/feeDomain'
import {
  getSelectablePayers,
  isPublishableServiceType,
  PUBLISHABLE_SERVICE_TYPES,
  withoutHiddenServiceTypes
} from '@utils/fee-execution'
import { describe, expect, it } from 'vitest'
import {
  FEE_BUSINESS_CATEGORY,
  getComponentTypesForCategory,
  getPayerTypeOptions,
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

describe('EWALLET_REFUND', () => {
  it('thuộc miền Ví, có trong danh sách chọn và không bày ô merchant ở bản gán', () => {
    expect(getFeeDomainForServiceType('EWALLET_REFUND')).toBe(FeeDomain.EWALLET)
    expect(getDomainFieldRules(FeeDomain.EWALLET).serviceTypes).toContain(
      'EWALLET_REFUND'
    )
    const rules = getFormFieldRules(FeeDomain.EWALLET, 'EWALLET_REFUND')
    expect(rules.showMerchant).toBe(false)
    expect(rules.showSubject).toBe(true)
    expect(rules.bankRequired).toBe(false)
  })

  it('phí hoàn tiền chọn USER hoặc RECEIVER, kèm SYSTEM cho chi phí đầu vào; không còn MERCHANT', () => {
    expect(
      getPayerTypeOptions('EWALLET_REFUND').map(({ value }) => value)
    ).toEqual(['USER', 'RECEIVER', 'SYSTEM'])
    expect(getSelectablePayers('EWALLET_REFUND')).toEqual(['USER', 'RECEIVER'])
    expect(getSelectablePayers('EWALLET_WITHDRAWAL')).toEqual([
      'USER',
      'RECEIVER'
    ])
  })

  it('REFUND_FEE chỉ xuất hiện cho hoàn tiền, ở nhóm phí xử lý giao dịch', () => {
    const category = FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING
    expect(getComponentTypesForCategory(category, 'EWALLET_REFUND')[0]).toBe(
      'REFUND_FEE'
    )
    expect(
      getComponentTypesForCategory(category, 'EWALLET_DEPOSIT')
    ).not.toContain('REFUND_FEE')
    expect(getComponentTypesForCategory(category)).not.toContain('REFUND_FEE')
  })
})

describe('EWALLET_TRANSFER_INTERNAL', () => {
  it('cho chọn người chuyển (USER) hoặc người nhận (RECEIVER) chịu phí, kèm SYSTEM cho chi phí đầu vào', () => {
    expect(getSelectablePayers('EWALLET_TRANSFER_INTERNAL')).toEqual([
      'USER',
      'RECEIVER'
    ])
    expect(
      getPayerTypeOptions('EWALLET_TRANSFER_INTERNAL').map(({ value }) => value)
    ).toEqual(['USER', 'RECEIVER', 'SYSTEM'])
  })

  it('nhãn chỉ là Người chuyển / Người nhận cho các dịch vụ ví', () => {
    const labels = Object.fromEntries(
      getPayerTypeOptions('EWALLET_TRANSFER_INTERNAL').map(
        ({ value, label }) => [value, label]
      )
    )
    expect(labels.USER).toBe('Người chuyển')
    expect(labels.RECEIVER).toBe('Người nhận')
    const deposit = getPayerTypeOptions('EWALLET_DEPOSIT')
    expect(deposit.find(({ value }) => value === 'USER')?.label).toBe(
      'Người chuyển'
    )
  })

  it('nạp tiền cho chọn USER hoặc RECEIVER chịu', () => {
    expect(getSelectablePayers('EWALLET_DEPOSIT')).toEqual(['USER', 'RECEIVER'])
  })
})

describe('loại giao dịch tạm ẩn', () => {
  const HIDDEN = ['MERCHANT_VA_BILL_COLLECTION', 'PAYOUT_BANK_TRANSFER']

  it('ẩn thu hộ VA và chi hộ khỏi danh sách chọn', () => {
    const visible = withoutHiddenServiceTypes(PUBLISHABLE_SERVICE_TYPES)

    for (const hidden of HIDDEN) expect(visible).not.toContain(hidden)
    expect(visible).toEqual(
      expect.arrayContaining([
        'EWALLET_DEPOSIT',
        'EWALLET_WITHDRAWAL',
        'EWALLET_TRANSFER_INTERNAL',
        'EWALLET_REFUND'
      ])
    )
  })

  it('chỉ ẩn ở giao diện: luật kiểm tra vẫn nhận đủ các loại', () => {
    for (const hidden of HIDDEN) {
      expect(PUBLISHABLE_SERVICE_TYPES).toContain(hidden)
      expect(isPublishableServiceType(hidden)).toBe(true)
    }
  })

  it('chính sách cũ thuộc loại ẩn vẫn thấy đúng loại của nó khi đang mở', () => {
    expect(
      withoutHiddenServiceTypes(
        PUBLISHABLE_SERVICE_TYPES,
        'MERCHANT_VA_BILL_COLLECTION'
      )
    ).toContain('MERCHANT_VA_BILL_COLLECTION')
    expect(
      withoutHiddenServiceTypes(
        PUBLISHABLE_SERVICE_TYPES,
        'MERCHANT_VA_BILL_COLLECTION'
      )
    ).not.toContain('PAYOUT_BANK_TRANSFER')
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
    expect(
      [...getFormFieldRules(FeeDomain.EWALLET, '').serviceTypes].sort()
    ).toEqual([
      'EWALLET_DEPOSIT',
      'EWALLET_REFUND',
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
    expect(getFeeDomainForServiceType('EWALLET_DEPOSIT')).toBe(
      FeeDomain.EWALLET
    )
    expect(getFeeDomainForServiceType('PAYOUT_BANK_TRANSFER')).toBe(
      FeeDomain.MERCHANT
    )
    expect(getFeeDomainForServiceType('')).toBe(FeeDomain.EWALLET)
  })
})
