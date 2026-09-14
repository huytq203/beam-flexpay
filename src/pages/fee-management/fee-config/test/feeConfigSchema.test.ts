import { describe, expect, it } from 'vitest'
import { FeeDomain } from '@components/fee/feeDomain'
import { getDomainFieldRules } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  feeComponentFormSchema,
  feeConfigFormSchema
} from '../schemas/feeConfig.schema'

const component = (overrides = {}) => ({
  key: 'c1',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'USER',
  fixedAmount: 2000,
  percentage: 0,
  minFee: 0,
  maxFee: 0,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const form = (overrides = {}) => ({
  feeDomain: 'EWALLET' as const,
  name: 'Phí rút tiền',
  description: '',
  priority: 2,
  serviceType: 'EWALLET_WITHDRAWAL',
  bankCode: '',
  paymentMethod: 'ATM',
  merchantId: '',
  subjectId: '',
  customerGroup: '',
  assignmentScope: 'ALL' as const,
  validFrom: '2026-10-01T00:00:00.000',
  validTo: '',
  components: [component()],
  ...overrides
})

const errorPaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.success ? [] : (result.error?.issues ?? []).map((issue) => issue.path.join('.'))

describe('feeComponentFormSchema', () => {
  it('bắt buộc có bậc phí khi chọn công thức bậc thang', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ calculationMethod: CalculationMethod.FLAT_TIER })
    )
    expect(errorPaths(result)).toContain('tiers')
  })

  it('từ chối bậc phí trên thành phần tính trực tiếp', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        tiers: [
          {
            maxValue: 100,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          }
        ]
      })
    )
    expect(errorPaths(result)).toContain('tiers')
  })

  it('chặn bậc kết thúc trước chỗ bậc trước đã dừng', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
        tiers: [
          { maxValue: 50000, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 },
          // Bậc hai bắt đầu từ 50.001 nên không thể kết thúc ở 40.000.
          { maxValue: 40000, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 }
        ]
      })
    )
    expect(errorPaths(result)).toContain('tiers.1.maxValue')
  })

  it('không thể tạo khoảng hở vì giá trị bắt đầu là suy ra', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
        tiers: [
          { maxValue: 50000, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 },
          { maxValue: null, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 }
        ]
      })
    )
    expect(result.success).toBe(true)
  })

  it('chỉ cho bậc cuối để trống giá trị đến', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
        tiers: [
          { maxValue: null, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 },
          { maxValue: null, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 }
        ]
      })
    )
    expect(errorPaths(result)).toContain('tiers.0.maxValue')
  })

  it('để trống hết mức phí là hợp lệ, thành phần đó miễn phí', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ fixedAmount: null, percentage: null })
    )
    expect(result.success).toBe(true)
  })

  it('buộc thuế giá trị gia tăng tính trên thành phần khác', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ componentType: 'VAT', baseOn: 'AMOUNT', percentage: 10, fixedAmount: 0 })
    )
    expect(errorPaths(result)).toContain('baseOn')
  })

  it('không cho thuế giá trị gia tăng có phí cố định', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        percentage: 10,
        fixedAmount: 500
      })
    )
    expect(errorPaths(result)).toContain('fixedAmount')
  })

  it('cho thuế giá trị gia tăng để trống phần trăm', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        percentage: null,
        fixedAmount: null
      })
    )
    expect(result.success).toBe(true)
  })

  it('bắt buộc chọn cơ sở khi tính trên thành phần khác', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ baseOn: 'FEE_COMPONENT', baseComponentType: null })
    )
    expect(errorPaths(result)).toContain('baseComponentType')
  })
})

describe('feeConfigFormSchema', () => {
  it('cho phép tất cả phương thức và từ chối phương thức không phù hợp', () => {
    const allMethods = feeConfigFormSchema.safeParse(form({ paymentMethod: '' }))
    const mismatched = feeConfigFormSchema.safeParse(
      form({ paymentMethod: 'VA' })
    )

    expect(allMethods.success).toBe(true)
    expect(errorPaths(mismatched)).toContain('paymentMethod')
  })

  it('bắt buộc chọn ngân hàng ở miền Bank', () => {
    const result = feeConfigFormSchema.safeParse(
      form({ feeDomain: 'BANK', bankCode: '' })
    )
    expect(errorPaths(result)).toContain('bankCode')
  })

  it('cho phép bỏ trống ngân hàng ở miền ví', () => {
    expect(feeConfigFormSchema.safeParse(form()).success).toBe(true)
  })

  it('bắt ngày kết thúc phải sau ngày bắt đầu', () => {
    const result = feeConfigFormSchema.safeParse(
      form({
        validFrom: '2026-10-02T00:00:00.000',
        validTo: '2026-10-01T00:00:00.000'
      })
    )
    expect(errorPaths(result)).toContain('validTo')
  })

  it('bắt thành phần tham chiếu phải đứng trước', () => {
    const result = feeConfigFormSchema.safeParse(
      form({
        components: [
          component({
            key: 'vat',
            componentType: 'VAT',
            baseOn: 'FEE_COMPONENT',
            baseComponentType: 'TRANSACTION_FEE'
          }),
          component({ key: 'fee', componentType: 'TRANSACTION_FEE' })
        ]
      })
    )
    expect(errorPaths(result)).toContain('components.0.baseComponentType')
  })

  it('chấp nhận khi thành phần tham chiếu đứng trước', () => {
    const result = feeConfigFormSchema.safeParse(
      form({
        components: [
          component({ key: 'fee', componentType: 'TRANSACTION_FEE' }),
          component({
            key: 'vat',
            componentType: 'VAT',
            baseOn: 'FEE_COMPONENT',
            baseComponentType: 'TRANSACTION_FEE',
            fixedAmount: 0,
            percentage: 10
          })
        ]
      })
    )
    expect(result.success).toBe(true)
  })

  it('đòi ít nhất một thành phần phí', () => {
    const result = feeConfigFormSchema.safeParse(form({ components: [] }))
    expect(errorPaths(result)).toContain('components')
  })
})

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
  })

  it('không miền nào bày loại giao dịch chưa duyệt được', () => {
    for (const domain of [FeeDomain.BANK, FeeDomain.EWALLET, FeeDomain.MERCHANT]) {
      const { serviceTypes } = getDomainFieldRules(domain)
      expect(serviceTypes).not.toContain('EWALLET_TRANSFER_EXTERNAL')
      expect(serviceTypes).not.toContain('EWALLET_CASHBACK')
    }
  })
})
