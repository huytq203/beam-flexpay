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

describe('toSetupRequest', () => {
  it('chuẩn hoá payer chưa hỗ trợ và giữ người hưởng đã chọn', () => {
    const form = baseForm()
    form.components[0].payerType = 'RECEIVER'

    const request = toSetupRequest(form)
    // EWALLET_WITHDRAWAL chỉ thực thi được payer USER; RECEIVER chưa có hợp đồng ghi sổ.
    expect(request.components[0].payerType).toBe('USER')
    expect(request.components[0].beneficiaryType).toBe('SYSTEM')
  })

  it('chuẩn hoá payer cũ chưa hỗ trợ của miền Ví về USER', () => {
    for (const legacy of ['SENDER', 'RECEIVER']) {
      const form = baseForm({ feeDomain: 'EWALLET' })
      form.components[0].payerType = legacy

      expect(toSetupRequest(form).components[0].payerType).toBe('USER')
    }
  })

  it('giữ riêng chi phí SYSTEM → BANK và khoản thu USER → SYSTEM', () => {
    const form = baseForm()
    form.components = [
      {
        ...form.components[0],
        key: 'cost',
        componentType: 'BANK_FEE',
        payerType: 'SYSTEM',
        beneficiaryType: 'BANK',
        fixedAmount: 700
      },
      {
        ...form.components[0],
        key: 'fee',
        componentType: 'BANK_FEE',
        payerType: 'USER',
        beneficiaryType: 'SYSTEM',
        fixedAmount: 2000
      }
    ]

    expect(
      toSetupRequest(form).components.map(
        ({ payerType, beneficiaryType, fixedAmount }) => ({
          payerType,
          beneficiaryType,
          fixedAmount
        })
      )
    ).toEqual([
      { payerType: 'SYSTEM', beneficiaryType: 'BANK', fixedAmount: 700 },
      { payerType: 'USER', beneficiaryType: 'SYSTEM', fixedAmount: 2000 }
    ])
  })

  it('chuẩn hoá người hưởng phí ví thành SYSTEM dù dữ liệu form cũ là BANK', () => {
    const form = baseForm()
    form.components[0].beneficiaryType = 'BANK'

    expect(toSetupRequest(form).components[0].beneficiaryType).toBe('SYSTEM')
  })

  it('luồng thu hộ merchant gửi payer MERCHANT', () => {
    const form = baseForm({
      feeDomain: 'MERCHANT',
      serviceType: 'MERCHANT_VA_BILL_COLLECTION'
    })

    expect(toSetupRequest(form).components[0].payerType).toBe('MERCHANT')
  })

  it('miền Bank giữ người hưởng đã chọn cho từng khoản', () => {
    const request = toSetupRequest(
      baseForm({
        feeDomain: 'BANK',
        bankCode: 'VCB'
      })
    )

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
            beneficiaryType: 'SYSTEM',
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

  it('gửi điểm bắt đầu bậc sau bằng điểm kết thúc bậc trước cộng một', () => {
    const form = baseForm()
    form.components[0].calculationMethod = CalculationMethod.PROGRESSIVE_TIER
    form.components[0].tiers = [
      {
        maxValue: 1,
        fixedAmount: 1,
        percentage: 1,
        minFee: 1,
        maxFee: 111
      },
      {
        maxValue: null,
        fixedAmount: 2,
        percentage: 2,
        minFee: 2,
        maxFee: 222
      }
    ]

    expect(toSetupRequest(form).components[0].tiers).toEqual([
      expect.objectContaining({ minValue: 0, maxValue: 1 }),
      expect.objectContaining({ minValue: 2, maxValue: null })
    ])
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

  it('luôn gửi phương thức giao dịch đã chọn', () => {
    const request = toAssignmentRequest(baseForm(), 'policy-1')
    expect(request.bankCode).toBeUndefined()
    expect(request.merchantId).toBeUndefined()
    expect(request.paymentMethod).toBe('ATM')
  })

  it('không gửi paymentMethod khi chọn tất cả phương thức', () => {
    const request = toAssignmentRequest(
      baseForm({ paymentMethod: '' }),
      'policy-1'
    )

    expect(request.paymentMethod).toBeUndefined()
  })

  it('gửi cặp chủ thể khi có chọn ví', () => {
    const request = toAssignmentRequest(
      baseForm({ assignmentScope: 'SUBJECT', subjectId: 'owner-1' }),
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

  it('gửi phân khúc khi có chọn, bỏ hẳn trường khi để trống', () => {
    expect(
      toAssignmentRequest(
        baseForm({ assignmentScope: 'SEGMENT', customerGroup: 'VIP' }),
        'policy-1'
      ).customerGroup
    ).toBe('VIP')
    expect(
      toAssignmentRequest(baseForm({ customerGroup: '' }), 'policy-1')
        .customerGroup
    ).toBeUndefined()
  })

  it('giữ loại giao dịch trùng với chính sách', () => {
    const form = baseForm()
    const setup = toSetupRequest(form)
    const assignment = toAssignmentRequest(form, 'policy-1')
    expect(assignment.serviceType).toBe(setup.policy.serviceType)
  })
})
