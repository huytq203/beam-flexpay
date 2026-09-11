import { describe, expect, it } from 'vitest'
import { CalculationMethod } from '../schemas/feeConfig.schema'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import {
  toAssignmentRequest,
  toSetupRequest
} from '../utils/feeConfigPayload'

const baseForm = (
  overrides: Partial<FeeConfigFormValues> = {}
): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: '  Phí rút tiền ví  ',
  description: '  ',
  priority: 2,
  serviceType: 'EWALLET_WITHDRAWAL',
  bankCode: '',
  paymentMethod: '',
  merchantId: '',
  subjectId: '',
  validFrom: '2026-10-01T08:30:00.000',
  validTo: '',
  components: [
    {
      key: 'c1',
      componentType: 'TRANSACTION_FEE',
      baseOn: 'AMOUNT',
      baseComponentType: null,
      calculationMethod: CalculationMethod.DIRECT,
      payerType: 'USER',
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

describe('toSetupRequest', () => {
  it('giữ người chịu do người dùng chọn và ép người hưởng về hệ thống', () => {
    const form = baseForm()
    form.components[0].payerType = 'RECEIVER'

    const request = toSetupRequest(form)
    expect(request.components[0].payerType).toBe('RECEIVER')
    // Mọi giá trị người hưởng khác hệ thống đều bị bước duyệt từ chối.
    expect(request.components[0].beneficiaryType).toBe('SYSTEM')
  })

  it('từ chối loại giao dịch chưa có hợp đồng thực thi', () => {
    expect(() =>
      toSetupRequest(baseForm({ serviceType: 'EWALLET_CASHBACK' }))
    ).toThrow(/chưa có hợp đồng thực thi/)
  })

  it('gửi ngày chính sách theo ISO có chữ T', () => {
    const request = toSetupRequest(baseForm())
    expect(request.policy.validFrom).toBe('2026-10-01T08:30:00')
    expect(request.policy.validTo).toBeUndefined()
  })

  it('cắt khoảng trắng tên và bỏ mô tả rỗng', () => {
    const request = toSetupRequest(baseForm())
    expect(request.policy.name).toBe('Phí rút tiền ví')
    expect(request.policy.description).toBeUndefined()
  })

  it('đưa phí cố định và phần trăm về 0 khi thành phần chia bậc', () => {
    const request = toSetupRequest(
      baseForm({
        components: [
          {
            key: 'c1',
            componentType: 'TRANSACTION_FEE',
            baseOn: 'AMOUNT',
            baseComponentType: null,
            calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
            payerType: 'USER',
            fixedAmount: 5000,
            percentage: 3,
            minFee: 0,
            maxFee: 0,
            roundMode: 'UP',
            tiers: [
              {
                maxValue: 50000,
                fixedAmount: 2000,
                percentage: 1,
                minFee: 2000,
                maxFee: 0
              }
            ]
          }
        ]
      })
    )

    expect(request.components[0].fixedAmount).toBe(0)
    expect(request.components[0].percentage).toBe(0)
    expect(request.components[0].tiers).toHaveLength(1)
  })

  it('quy ô để trống về 0 khi gửi lên', () => {
    const form = baseForm()
    form.components[0].fixedAmount = null
    form.components[0].percentage = null
    form.components[0].minFee = null
    form.components[0].maxFee = null

    const component = toSetupRequest(form).components[0]
    expect(component.fixedAmount).toBe(0)
    expect(component.percentage).toBe(0)
    expect(component.minFee).toBe(0)
    expect(component.maxFee).toBe(0)
  })

  it('không gửi bậc phí cho thành phần tính trực tiếp', () => {
    const request = toSetupRequest(baseForm())
    expect(request.components[0].tiers).toEqual([])
    expect(request.components[0].fixedAmount).toBe(2000)
  })
})

describe('toAssignmentRequest', () => {
  it('gửi ngày bản gán theo định dạng có dấu cách', () => {
    const request = toAssignmentRequest(baseForm(), 'policy-1')
    expect(request.effectiveFromDate).toBe('2026-10-01 08:30:00')
  })

  it('bỏ hẳn tiêu chí người dùng để trống thay vì gửi chuỗi rỗng', () => {
    const request = toAssignmentRequest(baseForm(), 'policy-1')
    expect(request.bankCode).toBeUndefined()
    expect(request.merchantId).toBeUndefined()
    expect(request.paymentMethod).toBeUndefined()
  })

  it('gửi cặp chủ thể khi có chọn ví', () => {
    const request = toAssignmentRequest(
      baseForm({ subjectId: 'owner-1' }),
      'policy-1'
    )
    expect(request.subjectType).toBe('USER')
    expect(request.subjectId).toBe('owner-1')
  })

  it('bỏ hẳn cả cặp chủ thể khi không chọn ví', () => {
    const request = toAssignmentRequest(baseForm(), 'policy-1')
    // Backend từ chối bản gán khai nửa cặp, nên không được gửi lẻ một trường.
    expect(request.subjectType).toBeUndefined()
    expect(request.subjectId).toBeUndefined()
  })

  it('giữ loại giao dịch trùng với chính sách', () => {
    const form = baseForm()
    const setup = toSetupRequest(form)
    const assignment = toAssignmentRequest(form, 'policy-1')
    expect(assignment.serviceType).toBe(setup.policy.serviceType)
  })
})
