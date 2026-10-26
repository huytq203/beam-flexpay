import { describe, expect, it } from 'vitest'
import {
  FIXED_FEE_ABOVE_MAX_MESSAGE,
  FIXED_FEE_BELOW_MIN_MESSAGE,
  MAX_FEE_BELOW_BOTH_MESSAGE,
  MAX_FEE_BELOW_FIXED_MESSAGE,
  MAX_FEE_BELOW_MIN_MESSAGE
} from '../schemas/feeBounds'
import {
  CalculationMethod,
  feeComponentFormSchema
} from '../schemas/feeConfig.schema'

const component = (overrides: Record<string, unknown> = {}) => ({
  key: 'c1',
  feeScope: 'OUTPUT_FEE',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: null,
  percentage: 1,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const tier = (overrides: Record<string, unknown> = {}) => ({
  maxValue: null,
  fixedAmount: null,
  percentage: 1,
  minFee: null,
  maxFee: null,
  ...overrides
})

const issuesOf = (value: unknown) => {
  const result = feeComponentFormSchema.safeParse(value)
  return result.success
    ? []
    : result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
}

describe('phí cố định so với sàn / trần', () => {
  it('phí cố định nhỏ hơn phí tối thiểu thì báo lỗi ở ô cố định', () => {
    expect(issuesOf(component({ fixedAmount: 3000, minFee: 5000 }))).toEqual([
      { path: 'fixedAmount', message: FIXED_FEE_BELOW_MIN_MESSAGE }
    ])
  })

  it('phí tối đa nhỏ hơn phí cố định thì báo lỗi ở cả hai ô', () => {
    expect(issuesOf(component({ fixedAmount: 5000, maxFee: 4000 }))).toEqual([
      { path: 'maxFee', message: MAX_FEE_BELOW_FIXED_MESSAGE },
      { path: 'fixedAmount', message: FIXED_FEE_ABOVE_MAX_MESSAGE }
    ])
  })

  it('tối thiểu và tối đa bằng phí cố định là hợp lệ', () => {
    expect(
      issuesOf(component({ fixedAmount: 5000, minFee: 5000, maxFee: 5000 }))
    ).toEqual([])
  })

  it('không đặt phí cố định thì không ràng buộc sàn / trần theo nó', () => {
    expect(issuesOf(component({ minFee: 1000, maxFee: 2000 }))).toEqual([])
  })

  it('để trống sàn / trần thì không so với phí cố định', () => {
    expect(issuesOf(component({ fixedAmount: 5000 }))).toEqual([])
  })
})

describe('phí tối đa so với phí tối thiểu', () => {
  it('phí tối đa nhỏ hơn phí tối thiểu thì báo lỗi ở ô tối đa', () => {
    expect(issuesOf(component({ minFee: 8000, maxFee: 6000 }))).toEqual([
      { path: 'maxFee', message: MAX_FEE_BELOW_MIN_MESSAGE }
    ])
  })

  it('phí tối đa nhỏ hơn cả phí cố định và tối thiểu thì gộp một thông báo', () => {
    expect(
      issuesOf(component({ fixedAmount: 1000, minFee: 1000, maxFee: 500 }))
    ).toEqual([
      { path: 'maxFee', message: MAX_FEE_BELOW_BOTH_MESSAGE },
      { path: 'fixedAmount', message: FIXED_FEE_ABOVE_MAX_MESSAGE }
    ])
  })
})

describe('áp cùng luật cho từng bậc phí', () => {
  const tiered = (tiers: unknown[]) =>
    component({
      calculationMethod: CalculationMethod.FLAT_TIER,
      percentage: null,
      tiers
    })

  it('báo lỗi đúng ô của bậc vi phạm', () => {
    expect(
      issuesOf(
        tiered([
          tier({ maxValue: 1_000_000, fixedAmount: 1000, minFee: 2000 }),
          tier({ minFee: 9000, maxFee: 7000 })
        ])
      )
    ).toEqual([
      { path: 'tiers.0.fixedAmount', message: FIXED_FEE_BELOW_MIN_MESSAGE },
      { path: 'tiers.1.maxFee', message: MAX_FEE_BELOW_MIN_MESSAGE }
    ])
  })

  it('bậc có tối đa nhỏ hơn phí cố định bị chặn', () => {
    expect(
      issuesOf(tiered([tier({ fixedAmount: 3000, maxFee: 2000 })]))
    ).toEqual([
      { path: 'tiers.0.maxFee', message: MAX_FEE_BELOW_FIXED_MESSAGE },
      { path: 'tiers.0.fixedAmount', message: FIXED_FEE_ABOVE_MAX_MESSAGE }
    ])
  })
})
