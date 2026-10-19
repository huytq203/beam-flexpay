import { describe, expect, it } from 'vitest'
import type { FeeComponentFormValues } from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import { buildFeeBasis } from '../utils/feeBasis'
import { groupReadoutComponents } from '../utils/groupReadoutComponents'

const component = (
  over: Partial<FeeComponentFormValues>
): FeeComponentFormValues => ({
  key: 'c',
  feeScope: 'OUTPUT_FEE',
  componentType: 'REFUND_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: 'DIRECT',
  payerType: 'SENDER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: null,
  percentage: 1,
  minFee: null,
  maxFee: null,
  roundMode: 'HALF_UP',
  tiers: [],
  ...over
})

const vat = component({
  key: 'vat',
  componentType: 'VAT',
  baseOn: 'FEE_COMPONENT',
  baseComponentType: 'REFUND_FEE',
  percentage: 2
})
const refund = component({ key: 'refund' })
const groups = groupReadoutComponents([vat, refund])

describe('buildFeeBasis', () => {
  it('VAT tính trên phí khác: 2% × Phí hoàn tiền, trỏ tới mục 2', () => {
    const model = buildFeeBasis(groups[0], groups)
    expect(model.rate).toBe('2%')
    expect(model.base).toEqual({
      kind: 'COMPONENT',
      label: 'Phí hoàn tiền',
      index: 2
    })
  })

  it('phí tính trên số tiền giao dịch và là cơ sở của VAT (mục 1)', () => {
    const model = buildFeeBasis(groups[1], groups)
    expect(model.rate).toBe('1%')
    expect(model.base).toEqual({ kind: 'AMOUNT', label: 'Số tiền giao dịch' })
    expect(model.dependents).toEqual([{ label: 'VAT', index: 1 }])
  })

  it('phần cố định cộng thêm sau phép nhân', () => {
    const [group] = groupReadoutComponents([
      component({ percentage: 1, fixedAmount: 5000 })
    ])
    const model = buildFeeBasis(group, [group])
    expect(model.rate).toBe('1%')
    expect(model.fixed).toBe('5.000 đ')
  })

  it('chỉ có phần cố định thì không phụ thuộc cơ sở tính', () => {
    const [group] = groupReadoutComponents([
      component({ percentage: null, fixedAmount: 5000 })
    ])
    const model = buildFeeBasis(group, [group])
    expect(model.rate).toBeUndefined()
    expect(model.fixed).toBe('5.000 đ')
  })

  it('miễn phí', () => {
    const [group] = groupReadoutComponents([
      component({ calculationMethod: 'FREE', percentage: null })
    ])
    expect(buildFeeBasis(group, [group]).free).toBe(true)
  })

  it('nhiều bên chịu với mức khác nhau thì không gộp một mức', () => {
    const shared = {
      componentType: 'VAT',
      baseOn: 'FEE_COMPONENT' as const,
      baseComponentType: 'REFUND_FEE'
    }
    const many = groupReadoutComponents([
      component({ ...shared, key: 'a', percentage: 2 }),
      component({ ...shared, key: 'b', payerType: 'RECEIVER', percentage: 3 }),
      refund
    ])
    expect(buildFeeBasis(many[0], many).rate).toBe('Mức phí từng bên')
  })

  it('chia bậc thì nêu số bậc', () => {
    const [group] = groupReadoutComponents([
      component({
        calculationMethod: 'FLAT_TIER',
        percentage: null,
        tiers: [
          { maxValue: 100, fixedAmount: null, percentage: 1, minFee: null, maxFee: null },
          { maxValue: null, fixedAmount: null, percentage: 2, minFee: null, maxFee: null }
        ]
      })
    ])
    expect(buildFeeBasis(group, [group]).rate).toBe('Biểu 2 bậc')
  })

  it('cơ sở tính không nằm trong luồng đang xem thì không có số mục', () => {
    const [group] = groupReadoutComponents([vat])
    expect(buildFeeBasis(group, [group]).base).toEqual({
      kind: 'COMPONENT',
      label: 'Phí hoàn tiền'
    })
  })
})
