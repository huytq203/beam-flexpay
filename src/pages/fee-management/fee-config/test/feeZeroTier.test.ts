import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  feeComponentFormSchema
} from '../schemas/feeConfig.schema'

const component = (method: string, tiers: unknown[]) => ({
  key: 'fee',
  feeScope: 'OUTPUT_FEE',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: method,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: 0,
  percentage: 0,
  minFee: 0,
  maxFee: 0,
  roundMode: 'UP',
  tiers
})

describe('bậc phí 0 đồng', () => {
  it.each([CalculationMethod.PROGRESSIVE_TIER, CalculationMethod.FLAT_TIER])(
    'cho phép bậc miễn phí ở giữa công thức %s',
    (method) => {
      const tiers = [
        {
          maxValue: 1000,
          percentage: 1,
          fixedAmount: null,
          minFee: null,
          maxFee: null
        },
        {
          maxValue: 2000,
          percentage: 0,
          fixedAmount: null,
          minFee: null,
          maxFee: null
        },
        {
          maxValue: null,
          percentage: null,
          fixedAmount: 500,
          minFee: null,
          maxFee: null
        }
      ]
      expect(
        feeComponentFormSchema.safeParse(component(method, tiers)).success
      ).toBe(true)
    }
  )

  it('báo thiếu mức phí nếu để trống cả phần trăm lẫn cố định', () => {
    const result = feeComponentFormSchema.safeParse(
      component(CalculationMethod.FLAT_TIER, [
        {
          maxValue: null,
          percentage: null,
          fixedAmount: null,
          minFee: null,
          maxFee: null
        }
      ])
    )
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
      'tiers.0.percentage'
    )
  })

  it('không cho đặt sàn dương trên bậc miễn phí', () => {
    const result = feeComponentFormSchema.safeParse(
      component(CalculationMethod.PROGRESSIVE_TIER, [
        {
          maxValue: null,
          percentage: 0,
          fixedAmount: 0,
          minFee: 100,
          maxFee: null
        }
      ])
    )
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues.map((issue) => issue.path.join('.'))).toContain(
      'tiers.0.minFee'
    )
  })
})
