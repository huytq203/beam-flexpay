import { describe, expect, it } from 'vitest'
import { allowsProviderCriteria } from '../constants/feeProvider'
import {
  ORIGINAL_TYPE_OPTIONS,
  allowsOriginalTypeCriteria,
  getOriginalTypeLabel
} from '../constants/feeRefundOriginalType'
import {
  feeConfigFormSchema,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import { toAssignmentRequest } from '../utils/feeConfigPayload'

const form = (
  overrides: Partial<FeeConfigFormValues>
): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: 'Phí xử lý hoàn nạp',
  description: '',
  priority: 2,
  serviceType: 'EWALLET_REFUND',
  bankCode: '',
  providerCode: '',
  paymentMethod: '',
  merchantId: '',
  subjectId: '',
  customerGroup: '',
  assignmentScope: 'ALL',
  validFrom: '2026-10-01T00:00:00.000',
  validTo: '',
  components: [
    {
      key: 'c1',
      feeScope: 'OUTPUT_FEE',
      componentType: 'TRANSACTION_FEE',
      baseOn: 'AMOUNT',
      baseComponentType: null,
      calculationMethod: 'DIRECT',
      payerType: 'USER',
      beneficiaryType: 'SYSTEM',
      fixedAmount: 5000,
      percentage: 0,
      minFee: 0,
      maxFee: 0,
      roundMode: 'UP',
      tiers: []
    } as FeeConfigFormValues['components'][number]
  ],
  ...overrides
})

const errorPaths = (values: FeeConfigFormValues) => {
  const result = feeConfigFormSchema.safeParse(values)
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join('.'))
}

describe('loại giao dịch gốc trên form cấu hình phí hoàn tiền', () => {
  it('chỉ phí hoàn tiền có loại giao dịch gốc', () => {
    expect(allowsOriginalTypeCriteria('EWALLET_REFUND')).toBe(true)
    expect(allowsOriginalTypeCriteria('EWALLET_DEPOSIT')).toBe(false)
    expect(allowsOriginalTypeCriteria(undefined)).toBe(false)
  })

  it('hoàn tiền cũng chọn được nhà cung cấp (hoàn một lệnh nạp qua NCC)', () => {
    expect(allowsProviderCriteria('EWALLET_REFUND')).toBe(true)
  })

  it('có đủ bốn loại hoàn và nhãn tiếng Việt', () => {
    expect(ORIGINAL_TYPE_OPTIONS.map((option) => option.value)).toEqual([
      'CASH_IN',
      'CASH_OUT',
      'P2P_TRANSFER',
      'MERCHANT_PAYMENT'
    ])
    expect(getOriginalTypeLabel('CASH_IN')).toBe('Hoàn nạp tiền')
    expect(getOriginalTypeLabel('UNKNOWN')).toBe('UNKNOWN')
    expect(getOriginalTypeLabel(null)).toBe('')
  })

  it('schema nhận loại ở phí hoàn tiền và từ chối ở loại giao dịch khác', () => {
    expect(
      errorPaths(form({ originalTransactionType: 'CASH_IN' }))
    ).not.toContain('originalTransactionType')
    expect(
      errorPaths(
        form({
          serviceType: 'EWALLET_DEPOSIT',
          originalTransactionType: 'CASH_IN'
        })
      )
    ).toContain('originalTransactionType')
  })

  it('payload gửi loại đã chọn và bỏ trường khi để trống', () => {
    expect(
      toAssignmentRequest(form({ originalTransactionType: 'CASH_OUT' }), 'p1')
        .originalTransactionType
    ).toBe('CASH_OUT')
    expect(
      toAssignmentRequest(form({}), 'p1').originalTransactionType
    ).toBeUndefined()
  })
})
