import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  createFeeComponentFormSchema,
  DUPLICATE_FEE_COMPONENT_MESSAGE,
  feeComponentFormSchema,
  getTierStart
} from '../schemas/feeConfig.schema'

const component = (overrides: Record<string, unknown> = {}) => ({
  key: 'c1',
  feeScope: overrides.payerType === 'SYSTEM' ? 'INPUT_COST' : 'OUTPUT_FEE',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: 2000,
  percentage: 0,
  minFee: 0,
  maxFee: 0,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const errorPaths = (result: {
  success: boolean
  error?: { issues: { path: PropertyKey[] }[] }
}) =>
  result.success
    ? []
    : (result.error?.issues ?? []).map((issue) => issue.path.join('.'))

describe('getTierStart', () => {
  it('bắt đầu bậc sau ngay sau điểm kết thúc của bậc trước', () => {
    const tiers = [{ maxValue: 1 }, { maxValue: 2 }]

    expect(getTierStart(tiers, 0)).toBe(0)
    expect(getTierStart(tiers, 1)).toBe(2)
  })
})

describe('feeComponentFormSchema', () => {
  describe('kiểm tra trùng tổ hợp định danh', () => {
    const existingComponent = component({ key: 'existing-component' })

    it('báo lỗi trên cả ba trường khi tổ hợp đã tồn tại', () => {
      const result = createFeeComponentFormSchema([
        existingComponent
      ]).safeParse(component({ key: 'new-component' }))

      expect(result.success).toBe(false)
      if (result.success) return

      expect(result.error.issues).toEqual(
        expect.arrayContaining(
          ['componentType', 'payerType', 'beneficiaryType'].map((field) =>
            expect.objectContaining({
              path: [field],
              message: DUPLICATE_FEE_COMPONENT_MESSAGE
            })
          )
        )
      )
    })

    it.each([
      ['componentType', 'SERVICE_FEE'],
      ['payerType', 'MERCHANT'],
      ['beneficiaryType', 'BANK']
    ])('cho phép khi %s khác', (field, value) => {
      const result = createFeeComponentFormSchema([
        existingComponent
      ]).safeParse(component({ key: 'new-component', [field]: value }))

      expect(result.success).toBe(true)
    })

    it('bỏ qua chính thành phần đang sửa', () => {
      const result = createFeeComponentFormSchema(
        [existingComponent],
        existingComponent.key
      ).safeParse(existingComponent)

      expect(result.success).toBe(true)
    })
  })

  it('bắt buộc có bậc phí khi chọn công thức bậc thang', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ calculationMethod: CalculationMethod.FLAT_TIER })
    )
    expect(errorPaths(result)).toContain('tiers')
  })

  it('từ chối bậc phí trên thành phần tính trực tiếp', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        tiers: [
          {
            maxValue: 100,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          }
        ]
      })
    )
    expect(errorPaths(result)).toContain('tiers')
  })

  it('chặn bậc kết thúc trước chỗ bậc trước đã dừng', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
        tiers: [
          {
            maxValue: 50000,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          },
          // Bậc hai bắt đầu từ 50.001 nên không thể kết thúc ở 40.000.
          {
            maxValue: 40000,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          }
        ]
      })
    )
    expect(errorPaths(result)).toContain('tiers.1.maxValue')
  })

  it('không thể tạo khoảng hở vì giá trị bắt đầu là suy ra', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
        tiers: [
          {
            maxValue: 50000,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          },
          {
            maxValue: null,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          }
        ]
      })
    )
    expect(result.success).toBe(true)
  })

  it('chỉ cho bậc cuối để trống giá trị đến', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
        tiers: [
          {
            maxValue: null,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          },
          {
            maxValue: null,
            fixedAmount: 0,
            percentage: 1,
            minFee: 0,
            maxFee: 0
          }
        ]
      })
    )
    expect(errorPaths(result)).toContain('tiers.0.maxValue')
  })

  it('miễn phí = để trống hoặc điền 0: mọi tổ hợp ô trống/0 đều hợp lệ', () => {
    for (const overrides of [
      { fixedAmount: 0, percentage: 0 },
      { fixedAmount: 0, percentage: null },
      { fixedAmount: null, percentage: 0 },
      { fixedAmount: null, percentage: null }
    ]) {
      expect(
        feeComponentFormSchema.safeParse(component(overrides)).success
      ).toBe(true)
    }
  })

  it('buộc thuế giá trị gia tăng tính trên thành phần khác', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        componentType: 'VAT',
        baseOn: 'AMOUNT',
        percentage: 10,
        fixedAmount: 0
      })
    )
    expect(errorPaths(result)).toContain('baseOn')
  })

  it('không cho thuế giá trị gia tăng có phí cố định', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        percentage: 10,
        fixedAmount: 500
      })
    )
    expect(errorPaths(result)).toContain('fixedAmount')
  })

  it('không cho công thức miễn phí có mức thu khác 0', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ calculationMethod: CalculationMethod.FREE, fixedAmount: 500 })
    )
    expect(errorPaths(result)).toContain('fixedAmount')
  })

  it('thuế giá trị gia tăng cho phép tỷ lệ 0%', () => {
    const result = feeComponentFormSchema.safeParse(
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        percentage: 0,
        fixedAmount: null
      })
    )
    expect(errorPaths(result)).not.toContain('calculationMethod')
  })

  it('bắt buộc chọn cơ sở khi tính trên thành phần khác', () => {
    const result = feeComponentFormSchema.safeParse(
      component({ baseOn: 'FEE_COMPONENT', baseComponentType: null })
    )
    expect(errorPaths(result)).toContain('baseComponentType')
  })
})
