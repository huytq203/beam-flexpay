import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import { toSetupRequest } from '../utils/feeConfigPayload'

const baseForm = (): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: 'Phí rút tiền ví',
  description: '',
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
  ]
})

describe('toSetupRequest: miễn phí bằng cách điền 0', () => {
  const requestWith = (
    overrides: Partial<FeeConfigFormValues['components'][number]>
  ) => {
    const form = baseForm()
    form.components[0] = { ...form.components[0], ...overrides }
    return toSetupRequest(form).components[0]
  }

  it('DIRECT với cả hai ô bằng 0 gửi FREE để backend hiểu là miễn phí', () => {
    expect(
      requestWith({ fixedAmount: 0, percentage: 0 }).calculationMethod
    ).toBe('FREE')
  })

  it('DIRECT có thu phí giữ nguyên công thức', () => {
    expect(
      requestWith({ fixedAmount: 0, percentage: 1 }).calculationMethod
    ).toBe('DIRECT')
    expect(
      requestWith({ fixedAmount: 500, percentage: null }).calculationMethod
    ).toBe('DIRECT')
  })

  it('bậc thang không gửi sàn/trần của cách tính mặc định', () => {
    const component = requestWith({
      calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
      minFee: 1000,
      maxFee: 2000,
      tiers: [
        { maxValue: null, fixedAmount: 0, percentage: 1, minFee: 0, maxFee: 0 }
      ]
    })
    expect(component.minFee).toBe(0)
    expect(component.maxFee).toBe(0)
  })
})
