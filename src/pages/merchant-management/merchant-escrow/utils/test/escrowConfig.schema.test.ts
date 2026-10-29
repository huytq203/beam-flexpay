import { describe, expect, it } from 'vitest'
import {
  escrowConfigSchema,
  toEscrowConfigRequest,
  type EscrowConfigFormValues
} from '../escrowConfig.schema'

const valid: EscrowConfigFormValues = {
  requirementMode: 'FIXED',
  fixedAmount: 50_000_000,
  revenueDays: null,
  minAmount: null,
  maxAmount: null,
  reviewCycle: '',
  allowTransfer: true,
  allowSetoff: false,
  setoffAcknowledged: false,
  deadlineDays: 30,
  reminderDays: 7,
  overdueAction: 'WARN_ONLY',
  reason: ''
}

/** Trả về các thông báo lỗi theo đường dẫn trường. */
const errorsOf = (values: EscrowConfigFormValues) => {
  const result = escrowConfigSchema.safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message])
  )
}

describe('escrowConfigSchema', () => {
  it('cấu hình cố định hợp lệ thì qua', () => {
    expect(errorsOf(valid)).toEqual({})
  })

  it('AVERAGE_REVENUE với revenueDays=91 báo "Số ngày doanh thu phải từ 1 đến 90"', () => {
    expect(
      errorsOf({
        ...valid,
        requirementMode: 'AVERAGE_REVENUE',
        fixedAmount: null,
        revenueDays: 91,
        reviewCycle: 'MONTHLY'
      }).revenueDays
    ).toBe('Số ngày doanh thu phải từ 1 đến 90')
  })

  it('AVERAGE_REVENUE thiếu chu kỳ soát xét, min > max báo đúng câu BE', () => {
    const errors = errorsOf({
      ...valid,
      requirementMode: 'AVERAGE_REVENUE',
      fixedAmount: null,
      revenueDays: 15,
      minAmount: 200,
      maxAmount: 100,
      reviewCycle: ''
    })
    expect(errors.reviewCycle).toBe('Chu kỳ soát xét không hợp lệ')
    expect(errors.minAmount).toBe(
      'Mức tối thiểu phải nhỏ hơn hoặc bằng mức tối đa'
    )
  })

  it('FIXED thiếu số tiền báo "Mức ký quỹ yêu cầu phải là số nguyên không âm"', () => {
    expect(errorsOf({ ...valid, fixedAmount: null }).fixedAmount).toBe(
      'Mức ký quỹ yêu cầu phải là số nguyên không âm'
    )
  })

  it('reminderDays=30, deadlineDays=30 báo lỗi', () => {
    expect(
      errorsOf({ ...valid, deadlineDays: 30, reminderDays: 30 }).reminderDays
    ).toBe('Cảnh báo trước hạn phải nhỏ hơn thời hạn phải đủ ký quỹ')
  })

  it('deadlineDays ngoài 1–365 báo lỗi', () => {
    expect(errorsOf({ ...valid, deadlineDays: 366 }).deadlineDays).toBe(
      'Thời hạn phải đủ ký quỹ phải từ 1 đến 365 ngày'
    )
  })

  it('fixedAmount=1 và tắt cả chuyển khoản lẫn cấn trừ báo lỗi', () => {
    expect(
      errorsOf({
        ...valid,
        fixedAmount: 1,
        allowTransfer: false,
        allowSetoff: false
      }).allowTransfer
    ).toBe(
      'Mức yêu cầu lớn hơn 0 thì phải bật ít nhất một hình thức: chuyển khoản hoặc cấn trừ tại lệnh rút'
    )
  })

  it('fixedAmount=0 thì được tắt cả hai hình thức', () => {
    expect(
      errorsOf({
        ...valid,
        fixedAmount: 0,
        allowTransfer: false,
        allowSetoff: false
      })
    ).toEqual({})
  })

  it('allowSetoff không tick xác nhận báo lỗi', () => {
    expect(
      errorsOf({ ...valid, allowSetoff: true, setoffAcknowledged: false })
        .setoffAcknowledged
    ).toBe(
      'Cần xác nhận đã đọc cảnh báo hệ quả của việc cấn trừ tại lệnh rút trước khi lưu'
    )
  })

  it('chưa chọn cách xử lý khi quá hạn báo lỗi', () => {
    expect(errorsOf({ ...valid, overdueAction: '' }).overdueAction).toBe(
      'Cách xử lý khi quá hạn không hợp lệ'
    )
  })
})

describe('toEscrowConfigRequest', () => {
  it('FIXED bỏ các trường theo doanh thu, gắn expectedVersion và cắt khoảng trắng lý do', () => {
    expect(
      toEscrowConfigRequest(
        { ...valid, revenueDays: 15, reason: '  Phụ lục  ' },
        3
      )
    ).toEqual({
      expectedVersion: 3,
      requirementMode: 'FIXED',
      fixedAmount: 50_000_000,
      revenueDays: null,
      minAmount: null,
      maxAmount: null,
      reviewCycle: null,
      allowTransfer: true,
      allowSetoff: false,
      setoffAcknowledged: false,
      deadlineDays: 30,
      reminderDays: 7,
      overdueAction: 'WARN_ONLY',
      reason: 'Phụ lục'
    })
  })
})
