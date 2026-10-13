import { describe, expect, it } from 'vitest'
import { CalculationMethod } from '../schemas/feeConfig.schema'
import { emptyComponent, withZeroRates } from '../utils/feeComponentDefaults'

const direct = (overrides = {}) => ({
  ...emptyComponent('OUTPUT_FEE', 'USER', 'SYSTEM'),
  ...overrides
})

describe('withZeroRates', () => {
  it('ô để trống được điền 0, ô đã nhập giữ nguyên', () => {
    expect(withZeroRates(direct())).toMatchObject({
      percentage: 0,
      fixedAmount: 0
    })
    expect(
      withZeroRates(direct({ percentage: 1.5, fixedAmount: null }))
    ).toMatchObject({ percentage: 1.5, fixedAmount: 0 })
  })

  it('không đụng tới bậc thang: số lấy từ bảng bậc', () => {
    const tiered = direct({ calculationMethod: CalculationMethod.FLAT_TIER })
    expect(withZeroRates(tiered)).toBe(tiered)
  })
})
