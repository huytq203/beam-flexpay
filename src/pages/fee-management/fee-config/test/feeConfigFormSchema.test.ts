import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  feeConfigFormSchema
} from '../schemas/feeConfig.schema'

const component = (overrides = {}) => ({
  key: 'c1',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
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

const errorPaths = (result: {
  success: boolean
  error?: { issues: { path: PropertyKey[] }[] }
}) =>
  result.success
    ? []
    : (result.error?.issues ?? []).map((issue) => issue.path.join('.'))

describe('feeConfigFormSchema', () => {
  it('cho phép tất cả phương thức và từ chối phương thức không phù hợp', () => {
    const allMethods = feeConfigFormSchema.safeParse(
      form({ paymentMethod: '' })
    )
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

  it('không cho duyệt chính sách chỉ có chi phí đầu vào', () => {
    const result = feeConfigFormSchema.safeParse(
      form({
        components: [
          component({ payerType: 'SYSTEM', beneficiaryType: 'BANK' })
        ]
      })
    )
    expect(errorPaths(result)).toContain('components')
  })

  it('tham chiếu chỉ được dùng thành phần trong cùng phạm vi', () => {
    const result = feeConfigFormSchema.safeParse(
      form({
        components: [
          component({
            key: 'cost',
            componentType: 'BANK_FEE',
            payerType: 'SYSTEM',
            beneficiaryType: 'BANK'
          }),
          component({
            key: 'vat',
            componentType: 'VAT',
            baseOn: 'FEE_COMPONENT',
            baseComponentType: 'BANK_FEE',
            fixedAmount: 0,
            percentage: 10
          })
        ]
      })
    )
    expect(errorPaths(result)).toContain('components.1.baseComponentType')
  })
})
