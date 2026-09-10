import { describe, expect, it } from 'vitest'
import { DEFAULT_ROUND_MODE } from '../../constants/FeeManagement.constant'
import { FeeComponentSchema } from '../../schemas/FeeManagement.schema'
import { DEFAULT_VALUES } from '../InfoPolicy'

describe('giá trị mặc định của thành phần phí', () => {
  it('gán sẵn công thức làm tròn để API luôn nhận đủ trường bắt buộc', () => {
    // BE khai @NotNull cho roundMode — bỏ trống là 400.
    expect(DEFAULT_VALUES.roundMode).toBe(DEFAULT_ROUND_MODE)
    expect(DEFAULT_VALUES.roundMode).toBe('UP')
  })

  it('form mới qua được validate mà không cần người dùng chọn làm tròn', () => {
    const result = FeeComponentSchema.safeParse({
      ...DEFAULT_VALUES,
      componentType: 'BANK_FEE',
      baseOn: 'AMOUNT',
      payerType: 'USER',
      beneficiaryType: 'BANK',
      calculationMethod: 'DIRECT',
      fixedAmount: 2000
    })

    expect(result.success).toBe(true)
  })
})
