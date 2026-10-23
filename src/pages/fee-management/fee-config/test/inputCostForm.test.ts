import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  feeConfigFormSchema,
  type FeeComponentFormValues,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import { inputCostFormSchema } from '../schemas/inputCostConfig.schema'
import {
  toInputCostAssignmentRequest,
  toSetupRequest
} from '../utils/feeConfigPayload'
import { baseForm } from './feeConfigPayload.fixtures'

const cost = (
  overrides: Partial<FeeComponentFormValues> = {}
): FeeComponentFormValues => ({
  key: 'cost',
  feeScope: 'INPUT_COST',
  componentType: 'BANK_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'SYSTEM',
  beneficiaryType: 'PARTNER',
  fixedAmount: 400,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const inputForm = (
  overrides: Partial<FeeConfigFormValues> = {}
): FeeConfigFormValues =>
  baseForm({
    name: 'Phí NAPAS nạp ví',
    serviceType: 'EWALLET_DEPOSIT',
    providerCode: 'NAPAS',
    bankCode: 'TCB',
    paymentMethod: 'ATM',
    components: [cost()],
    ...overrides
  })

const errorPaths = (result: {
  success: boolean
  error?: { issues: { path: PropertyKey[] }[] }
}) => (result.error?.issues ?? []).map((issue) => issue.path.join('.'))

describe('schema form chính sách phí đầu vào', () => {
  it('chấp nhận một thành phần chi phí đầu vào do Hệ thống chịu', () => {
    expect(inputCostFormSchema.safeParse(inputForm()).success).toBe(true)
  })

  it('từ chối khi không có thành phần nào', () => {
    const result = inputCostFormSchema.safeParse(inputForm({ components: [] }))
    expect(result.success).toBe(false)
    expect(errorPaths(result)).toContain('components')
  })

  it('khoá người chịu là Hệ thống: thành phần phí đầu ra bị từ chối', () => {
    const result = inputCostFormSchema.safeParse(
      inputForm({
        components: [
          cost({
            feeScope: 'OUTPUT_FEE',
            payerType: 'USER',
            beneficiaryType: 'SYSTEM'
          })
        ]
      })
    )
    expect(result.success).toBe(false)
    expect(errorPaths(result)).toContain('components.0.feeScope')
    expect(errorPaths(result)).toContain('components.0.payerType')
  })

  it('người hưởng chỉ là Ngân hàng hoặc Đối tác', () => {
    const result = inputCostFormSchema.safeParse(
      inputForm({ components: [cost({ beneficiaryType: 'SYSTEM' })] })
    )
    expect(result.success).toBe(false)
  })

  it('từ chối tiêu chí của khách (merchant, nhóm khách, ví, loại giao dịch gốc)', () => {
    for (const override of [
      { merchantId: 'm1' },
      { customerGroup: 'VIP', assignmentScope: 'SEGMENT' as const },
      { subjectId: '0912', assignmentScope: 'SUBJECT' as const },
      { originalTransactionType: 'CASH_IN' }
    ]) {
      const result = inputCostFormSchema.safeParse(inputForm(override))
      expect(result.success, JSON.stringify(override)).toBe(false)
    }
  })

  it('NCC chỉ dùng cho nạp, rút ví', () => {
    const result = inputCostFormSchema.safeParse(
      inputForm({ serviceType: 'EWALLET_TRANSFER_INTERNAL', paymentMethod: '' })
    )
    expect(result.success).toBe(false)
    expect(errorPaths(result)).toContain('providerCode')
  })
})

describe('form phí khách không bao giờ phát ra phí đầu vào', () => {
  it('schema từ chối thành phần INPUT_COST', () => {
    const result = feeConfigFormSchema.safeParse(
      baseForm({
        components: [...baseForm().components, cost()]
      })
    )
    expect(result.success).toBe(false)
    expect(errorPaths(result)).toContain('components')
  })

  it('payload luôn có policyKind=CUSTOMER_FEE và bỏ thành phần INPUT_COST lọt vào', () => {
    const request = toSetupRequest(
      baseForm({ components: [...baseForm().components, cost()] })
    )
    expect(request.policyKind).toBe('CUSTOMER_FEE')
    expect(request.components.map(({ feeScope }) => feeScope)).toEqual([
      'OUTPUT_FEE'
    ])
  })
})

describe('payload thiết lập chính sách phí đầu vào', () => {
  it('gửi policyKind=INPUT_COST, chỉ thành phần đầu vào, người chịu SYSTEM', () => {
    const request = toSetupRequest(
      inputForm({
        components: [
          cost(),
          cost({
            key: 'vat',
            componentType: 'VAT',
            baseOn: 'FEE_COMPONENT',
            baseComponentType: 'BANK_FEE',
            beneficiaryType: 'BANK',
            fixedAmount: null,
            percentage: 8
          })
        ]
      }),
      'INPUT_COST'
    )

    expect(request.policyKind).toBe('INPUT_COST')
    expect(request.policy.serviceType).toBe('EWALLET_DEPOSIT')
    expect(
      request.components.map(
        ({ feeScope, componentType, payerType, beneficiaryType }) => [
          feeScope,
          componentType,
          payerType,
          beneficiaryType
        ]
      )
    ).toEqual([
      ['INPUT_COST', 'BANK_FEE', 'SYSTEM', 'PARTNER'],
      ['INPUT_COST', 'VAT', 'SYSTEM', 'BANK']
    ])
  })

  it('bản gán chỉ có NCC, ngân hàng, phương thức và ngày; không có tiêu chí khách', () => {
    const request = toInputCostAssignmentRequest(
      inputForm({
        merchantId: 'm1',
        subjectId: '0912',
        customerGroup: 'VIP',
        originalTransactionType: 'CASH_IN',
        assignmentScope: 'SUBJECT'
      }),
      'policy-1'
    )

    expect(request).toEqual({
      feePolicyId: 'policy-1',
      serviceType: 'EWALLET_DEPOSIT',
      providerCode: 'NAPAS',
      bankCode: 'TCB',
      paymentMethod: 'ATM',
      effectiveFromDate: '2026-10-01 08:30:00',
      effectiveToDate: undefined
    })
    for (const key of [
      'merchantId',
      'subjectType',
      'subjectId',
      'customerGroup',
      'cardType',
      'originalTransactionType'
    ]) {
      expect(request).not.toHaveProperty(key, expect.anything())
    }
  })

  it('ô trống nghĩa là mọi giá trị và bị bỏ khỏi payload', () => {
    const request = toInputCostAssignmentRequest(
      inputForm({ providerCode: '', bankCode: '', paymentMethod: '' }),
      'policy-1'
    )
    expect(request.providerCode).toBeUndefined()
    expect(request.bankCode).toBeUndefined()
    expect(request.paymentMethod).toBeUndefined()
  })
})
