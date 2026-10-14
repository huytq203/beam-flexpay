import { describe, expect, it } from 'vitest'
import { CalculationMethod } from '../schemas/feeConfig.schema'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { toAssignmentRequest, toSetupRequest } from '../utils/feeConfigPayload'

const baseForm = (
  overrides: Partial<FeeConfigFormValues> = {}
): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: '  Phí rút tiền ví  ',
  description: '  ',
  priority: 2,
  serviceType: 'EWALLET_WITHDRAWAL',
  bankCode: '',
  providerCode: '',
  paymentMethod: 'ATM',
  merchantId: '',
  subjectId: '',
  customerGroup: '',
  assignmentScope: 'ALL',
  validFrom: '2026-10-01T08:30:00.000',
  validTo: '',
  components: [
    {
      key: 'c1',
      feeScope: 'OUTPUT_FEE',
      componentType: 'TRANSACTION_FEE',
      baseOn: 'AMOUNT',
      baseComponentType: null,
      calculationMethod: CalculationMethod.DIRECT,
      payerType: 'USER',
      beneficiaryType: 'SYSTEM',
      fixedAmount: 2000,
      percentage: 1,
      minFee: 2000,
      maxFee: 0,
      roundMode: 'UP',
      tiers: []
    }
  ],
  ...overrides
})

describe('toSetupRequest — EWALLET_REFUND', () => {
  const refundForm = (payerType: string, beneficiaryType: string) => {
    const form = baseForm({
      serviceType: 'EWALLET_REFUND',
      paymentMethod: '',
      name: 'Phí hoàn tiền mặc định'
    })
    Object.assign(form.components[0], {
      componentType: 'REFUND_FEE',
      payerType,
      beneficiaryType
    })
    return form
  }

  it('giữ payer MERCHANT, người hưởng luôn là SYSTEM, miền EWALLET', () => {
    const request = toSetupRequest(refundForm('MERCHANT', 'BANK'))
    expect(request.policy.serviceType).toBe('EWALLET_REFUND')
    expect(request.policy.feeDomain).toBe('EWALLET')
    expect(request.components[0]).toMatchObject({
      feeScope: 'OUTPUT_FEE',
      componentType: 'REFUND_FEE',
      payerType: 'MERCHANT',
      beneficiaryType: 'SYSTEM'
    })
  })

  it('payer ngoài USER/MERCHANT về USER', () => {
    expect(
      toSetupRequest(refundForm('SENDER', 'SYSTEM')).components[0].payerType
    ).toBe('USER')
  })

  it('bản gán không mang merchant, thẻ hay chủ thể khi để Tất cả', () => {
    const request = toAssignmentRequest(refundForm('USER', 'SYSTEM'), 'p1')
    expect(request).toMatchObject({ serviceType: 'EWALLET_REFUND' })
    expect(request.bankCode).toBeUndefined()
    expect(request.merchantId).toBeUndefined()
    expect(request.subjectType).toBeUndefined()
    expect('cardType' in request).toBe(false)
  })
})
