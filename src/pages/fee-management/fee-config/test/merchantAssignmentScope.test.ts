import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  getAssignmentScopeOptions,
  toAssignmentScopeFields
} from '../constants/feeAssignment'
import { getFormFieldRules } from '../constants/feeConfigFields'
import { FeeDomain } from '@components/fee/feeDomain'
import { useFeeConfigForm } from '../hooks/useFeeConfigForm'
import { feeConfigFormSchema } from '../schemas/feeConfig.schema'
import { toAssignmentRequest } from '../utils/feeConfigPayload'
import { baseForm } from './feeConfigPayload.fixtures'

const merchantForm = (overrides: Record<string, unknown> = {}) =>
  baseForm({
    feeDomain: 'MERCHANT',
    serviceType: 'MERCHANT_VA_BILL_COLLECTION',
    paymentMethod: '',
    components: [
      {
        ...baseForm().components[0],
        payerType: 'MERCHANT'
      }
    ],
    ...overrides
  })

describe('payload gán đối tượng của thu hộ / chi hộ', () => {
  it('Merchant cụ thể gửi cả merchantId lẫn cặp chủ thể MERCHANT (512 điểm)', () => {
    const request = toAssignmentRequest(
      merchantForm({ assignmentScope: 'SUBJECT', merchantId: 'm1' }),
      'policy-1'
    )
    expect(request).toMatchObject({
      merchantId: 'm1',
      subjectType: 'MERCHANT',
      subjectId: 'm1',
      customerGroup: undefined
    })
  })

  it('Nhóm merchant chỉ gửi customerGroup', () => {
    const request = toAssignmentRequest(
      merchantForm({
        assignmentScope: 'SEGMENT',
        customerGroup: 'MC_STRATEGIC',
        merchantId: 'm1'
      }),
      'policy-1'
    )
    expect(request.customerGroup).toBe('MC_STRATEGIC')
    expect(request.merchantId).toBeUndefined()
    expect(request.subjectType).toBeUndefined()
    expect(request.subjectId).toBeUndefined()
  })

  it('Tất cả merchant không gửi tiêu chí nào dù form còn sót merchantId', () => {
    const request = toAssignmentRequest(
      merchantForm({
        serviceType: 'PAYOUT_BANK_TRANSFER',
        assignmentScope: 'ALL',
        merchantId: 'm1',
        customerGroup: 'MC_STRATEGIC'
      }),
      'policy-1'
    )
    expect(request.merchantId).toBeUndefined()
    expect(request.customerGroup).toBeUndefined()
    expect(request.subjectType).toBeUndefined()
    expect(request.subjectId).toBeUndefined()
  })

  it('luồng ví không đổi: Cá nhân vẫn gửi subjectType USER', () => {
    const request = toAssignmentRequest(
      baseForm({
        serviceType: 'EWALLET_DEPOSIT',
        assignmentScope: 'SUBJECT',
        subjectId: 'u1'
      }),
      'policy-1'
    )
    expect(request.subjectType).toBe('USER')
    expect(request.subjectId).toBe('u1')
    expect(request.merchantId).toBeUndefined()
  })

  it('chính sách miền Bank cũ mang merchant vẫn gửi merchantId đứng riêng', () => {
    const request = toAssignmentRequest(
      baseForm({
        feeDomain: 'BANK',
        serviceType: 'MERCHANT_VA_BILL_COLLECTION',
        bankCode: 'VCB',
        merchantId: 'm1'
      }),
      'policy-1'
    )
    expect(request.merchantId).toBe('m1')
    expect(request.subjectType).toBeUndefined()
  })
})

describe('toAssignmentScopeFields — đọc bản gán vào form', () => {
  const assignment = (overrides: Record<string, string | null> = {}) => ({
    merchantId: null,
    subjectId: null,
    customerGroup: null,
    ...overrides
  })

  it('bản gán cũ chỉ có merchantId của thu hộ đọc thành Merchant cụ thể', () => {
    expect(
      toAssignmentScopeFields(
        FeeDomain.MERCHANT,
        'MERCHANT_VA_BILL_COLLECTION',
        assignment({ merchantId: 'm1' })
      )
    ).toMatchObject({ assignmentScope: 'SUBJECT', merchantId: 'm1' })
  })

  it('bản gán mới có cặp subject lấy merchantId từ subjectId khi thiếu', () => {
    expect(
      toAssignmentScopeFields(
        FeeDomain.MERCHANT,
        'PAYOUT_BANK_TRANSFER',
        assignment({ subjectId: 'm2' })
      )
    ).toMatchObject({ assignmentScope: 'SUBJECT', merchantId: 'm2' })
  })

  it('chỉ có customerGroup là Nhóm merchant, không có gì là Tất cả', () => {
    expect(
      toAssignmentScopeFields(
        FeeDomain.MERCHANT,
        'PAYOUT_BANK_TRANSFER',
        assignment({ customerGroup: 'MC_STRATEGIC' })
      )
    ).toMatchObject({
      assignmentScope: 'SEGMENT',
      customerGroup: 'MC_STRATEGIC'
    })
    expect(
      toAssignmentScopeFields(
        FeeDomain.MERCHANT,
        'PAYOUT_BANK_TRANSFER',
        assignment()
      ).assignmentScope
    ).toBe('ALL')
  })

  it('luồng ví vẫn đọc theo subjectId, không lấy merchantId làm Cá nhân', () => {
    expect(
      toAssignmentScopeFields(
        FeeDomain.EWALLET,
        'EWALLET_DEPOSIT',
        assignment({ subjectId: 'u1' })
      )
    ).toMatchObject({ assignmentScope: 'SUBJECT', subjectId: 'u1' })
    expect(
      toAssignmentScopeFields(
        FeeDomain.EWALLET,
        'EWALLET_DEPOSIT',
        assignment({ merchantId: 'm1' })
      ).assignmentScope
    ).toBe('ALL')
  })
})

describe('schema: Merchant cụ thể bắt buộc chọn merchant', () => {
  it('thu hộ, SUBJECT, merchantId rỗng → lỗi ở merchantId, không phải subjectId', () => {
    const result = feeConfigFormSchema.safeParse(
      merchantForm({ assignmentScope: 'SUBJECT', merchantId: '' })
    )
    expect(result.success).toBe(false)
    if (result.success) return
    const issues = result.error.issues.filter(
      (issue) => issue.path[0] === 'merchantId'
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].message).toBe('Chọn merchant được áp dụng')
    expect(
      result.error.issues.some((issue) => issue.path[0] === 'subjectId')
    ).toBe(false)
  })

  it('luồng ví vẫn báo thiếu cá nhân ở subjectId', () => {
    const result = feeConfigFormSchema.safeParse(
      baseForm({
        serviceType: 'EWALLET_DEPOSIT',
        paymentMethod: '',
        assignmentScope: 'SUBJECT',
        subjectId: ''
      })
    )
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.map((issue) => issue.path[0])).toContain(
      'subjectId'
    )
  })
})

describe('nhãn và luật ô theo loại giao dịch', () => {
  it('thu hộ / chi hộ dùng ba nhãn merchant', () => {
    for (const serviceType of [
      'MERCHANT_VA_BILL_COLLECTION',
      'PAYOUT_BANK_TRANSFER'
    ]) {
      expect(getAssignmentScopeOptions(serviceType)).toEqual([
        { value: 'ALL', label: 'Tất cả merchant' },
        { value: 'SEGMENT', label: 'Nhóm merchant' },
        { value: 'SUBJECT', label: 'Merchant cụ thể' }
      ])
    }
  })

  it('luồng ví giữ nhãn khách hàng cũ', () => {
    expect(getAssignmentScopeOptions('EWALLET_DEPOSIT')).toEqual([
      { value: 'ALL', label: 'Tất cả khách hàng' },
      { value: 'SEGMENT', label: 'Nhóm khách hàng' },
      { value: 'SUBJECT', label: 'Cá nhân' }
    ])
    expect(getAssignmentScopeOptions(undefined)).toHaveLength(3)
  })

  it('luồng merchant mở ô Merchant và nhóm, không mở ô ví riêng', () => {
    const rules = getFormFieldRules(FeeDomain.MERCHANT, 'PAYOUT_BANK_TRANSFER')
    expect(rules).toMatchObject({
      showMerchant: true,
      showSegment: true,
      showSubject: false
    })
  })
})

describe('đổi loại giao dịch đưa payer phí đầu ra về Merchant', () => {
  const withPayers = () =>
    merchantForm({
      serviceType: '',
      feeDomain: 'EWALLET',
      components: [
        { ...merchantForm().components[0], payerType: 'USER' },
        { ...merchantForm().components[0], key: 'c2', payerType: 'RECEIVER' }
      ]
    })

  it('sang thu hộ / chi hộ: mọi phí đầu ra về MERCHANT trên form', () => {
    const { result } = renderHook(() => useFeeConfigForm(withPayers()))
    act(() => result.current.changeServiceType('MERCHANT_VA_BILL_COLLECTION'))
    expect(
      result.current.form.getValues('components').map((c) => c.payerType)
    ).toEqual(['MERCHANT', 'MERCHANT'])
  })

  it('sang luồng ví giữ nguyên payer', () => {
    const { result } = renderHook(() => useFeeConfigForm(withPayers()))
    act(() => result.current.changeServiceType('EWALLET_DEPOSIT'))
    expect(
      result.current.form.getValues('components').map((c) => c.payerType)
    ).toEqual(['USER', 'RECEIVER'])
  })
})

describe('đổi loại giao dịch giữ phạm vi merchant', () => {
  it('từ thu hộ sang chi hộ giữ assignmentScope và merchantId', () => {
    const { result } = renderHook(() =>
      useFeeConfigForm(
        merchantForm({ assignmentScope: 'SUBJECT', merchantId: 'm1' })
      )
    )
    act(() => result.current.changeServiceType('PAYOUT_BANK_TRANSFER'))
    expect(result.current.form.getValues('assignmentScope')).toBe('SUBJECT')
    expect(result.current.form.getValues('merchantId')).toBe('m1')
  })

  it('từ thu hộ sang nạp ví bỏ merchantId nhưng giữ nhóm khách', () => {
    const { result } = renderHook(() =>
      useFeeConfigForm(
        merchantForm({
          assignmentScope: 'SEGMENT',
          customerGroup: 'MC_STRATEGIC',
          merchantId: 'm1'
        })
      )
    )
    act(() => result.current.changeServiceType('EWALLET_DEPOSIT'))
    expect(result.current.form.getValues('merchantId')).toBe('')
    expect(result.current.form.getValues('assignmentScope')).toBe('SEGMENT')
  })
})
