import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import {
  collectBaseTypes,
  describeFormula,
  summariseBaseType
} from '../utils/feeComponentSummary'

const component = (
  overrides: Partial<FeeComponentFormValues> = {}
): FeeComponentFormValues => ({
  key: 'c',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: 0,
  percentage: 0,
  minFee: 0,
  maxFee: 0,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

describe('describeFormula', () => {
  it('ghép phần trăm và phí cố định', () => {
    expect(
      describeFormula(component({ percentage: 1, fixedAmount: 2000 }))
    ).toBe('1% + 2.000 đ')
  })

  it('đếm số bậc thay vì quy về một con số', () => {
    expect(
      describeFormula(
        component({
          calculationMethod: CalculationMethod.PROGRESSIVE_TIER,
          tiers: [
            {
              maxValue: 100,
              fixedAmount: 0,
              percentage: 1,
              minFee: 0,
              maxFee: 0
            },
            {
              maxValue: null,
              fixedAmount: 0,
              percentage: 2,
              minFee: 0,
              maxFee: 0
            }
          ]
        })
      )
    ).toBe('2 bậc')
  })

  it('không đặt mức nào thì đọc là miễn phí', () => {
    expect(describeFormula(component())).toBe('Miễn phí')
  })

  it('ô để trống đọc như 0', () => {
    expect(
      describeFormula(component({ percentage: null, fixedAmount: 2000 }))
    ).toBe('2.000 đ')
  })

  it('nhận biết miễn phí', () => {
    expect(
      describeFormula(component({ calculationMethod: CalculationMethod.FREE }))
    ).toBe('Miễn phí')
  })
})

describe('summariseBaseType', () => {
  it('một thành phần thì trả đúng công thức của nó', () => {
    const summary = summariseBaseType('TRANSACTION_FEE', [
      component({ percentage: 1, fixedAmount: 1000 })
    ])
    expect(summary.isSum).toBe(false)
    expect(summary.formulas).toEqual(['1% + 1.000 đ'])
  })

  it('nhiều thành phần cùng loại thì cơ sở tính là tổng, liệt kê đủ', () => {
    const summary = summariseBaseType('BANK_FEE', [
      component({ key: 'a', componentType: 'BANK_FEE', fixedAmount: 1000 }),
      component({ key: 'b', componentType: 'BANK_FEE', percentage: 2 }),
      component({ key: 'c', componentType: 'VAT', percentage: 10 })
    ])
    expect(summary.isSum).toBe(true)
    expect(summary.formulas).toEqual(['1.000 đ', '2%'])
  })

  it('không có thành phần nào thuộc loại thì trả danh sách rỗng', () => {
    const summary = summariseBaseType('VAT', [component()])
    expect(summary.formulas).toEqual([])
    expect(summary.isSum).toBe(false)
  })

  it('chỉ lấy cơ sở tính trong cùng phạm vi đầu vào hoặc đầu ra', () => {
    const preceding = [
      component({
        key: 'cost',
        componentType: 'BANK_FEE',
        payerType: 'SYSTEM'
      }),
      component({ key: 'fee', componentType: 'BANK_FEE', payerType: 'USER' })
    ]
    expect(
      summariseBaseType('BANK_FEE', preceding, 'USER').components
    ).toHaveLength(1)
    expect(collectBaseTypes(preceding, 'SYSTEM')).toEqual(['BANK_FEE'])
  })
})

describe('collectBaseTypes', () => {
  it('gộp loại trùng và giữ thứ tự lần đầu gặp', () => {
    expect(
      collectBaseTypes([
        component({ componentType: 'BANK_FEE' }),
        component({ componentType: 'TRANSACTION_FEE' }),
        component({ componentType: 'BANK_FEE' })
      ])
    ).toEqual(['BANK_FEE', 'TRANSACTION_FEE'])
  })

  it('bỏ thành phần chưa chọn loại', () => {
    expect(collectBaseTypes([component({ componentType: '' })])).toEqual([])
  })
})
