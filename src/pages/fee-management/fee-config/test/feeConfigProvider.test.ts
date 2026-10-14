import { describe, expect, it } from 'vitest'
import {
  allowsProviderCriteria,
  toProviderOptions
} from '../constants/feeProvider'
import {
  feeConfigFormSchema,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import { toAssignmentRequest } from '../utils/feeConfigPayload'

const form = (
  overrides: Partial<FeeConfigFormValues>
): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: 'Phí nạp qua NAPAS',
  description: '',
  priority: 2,
  serviceType: 'EWALLET_DEPOSIT',
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
      fixedAmount: 2000,
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

describe('nhà cung cấp trên form cấu hình phí', () => {
  it('chỉ nạp và rút đi qua nhà cung cấp', () => {
    expect(allowsProviderCriteria('EWALLET_DEPOSIT')).toBe(true)
    expect(allowsProviderCriteria('EWALLET_WITHDRAWAL')).toBe(true)
    expect(allowsProviderCriteria('EWALLET_TRANSFER_INTERNAL')).toBe(false)
    expect(allowsProviderCriteria(undefined)).toBe(false)
  })

  it('schema nhận NCC ở nạp và từ chối ở loại giao dịch khác', () => {
    expect(errorPaths(form({ providerCode: 'NAPAS' }))).not.toContain(
      'providerCode'
    )
    expect(
      errorPaths(
        form({
          serviceType: 'EWALLET_TRANSFER_INTERNAL',
          providerCode: 'NAPAS'
        })
      )
    ).toContain('providerCode')
  })

  it('payload gửi NCC đã chọn và bỏ trường khi để trống', () => {
    expect(
      toAssignmentRequest(form({ providerCode: 'NAPAS' }), 'p1').providerCode
    ).toBe('NAPAS')
    expect(toAssignmentRequest(form({}), 'p1').providerCode).toBeUndefined()
  })

  it('danh sách chọn chỉ có cổng thuần, đánh dấu đối tác chưa tích hợp', () => {
    const options = toProviderOptions([
      {
        code: 'VCB',
        name: 'Vietcombank',
        provider: true,
        issuer: true,
        status: 'ACTIVE'
      },
      {
        code: 'NAPAS',
        name: 'NAPAS',
        provider: true,
        issuer: false,
        status: 'INACTIVE'
      },
      {
        code: 'TCB',
        name: 'Techcombank',
        provider: false,
        issuer: true,
        status: 'ACTIVE'
      }
    ])

    expect(options).toEqual([
      { value: 'NAPAS', label: 'NAPAS (NAPAS) · chưa tích hợp' }
    ])
  })
})
