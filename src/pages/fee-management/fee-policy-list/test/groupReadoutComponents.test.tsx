import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import type { FeePolicyConfiguration } from '@type/fee.type'
import { FeeComponentGroupReadout } from '../components/FeeComponentGroupReadout'
import { ScopeComponentsCell } from '../components/ScopeComponentsCell'
import { groupReadoutComponents } from '../utils/groupReadoutComponents'

const component = (
  overrides: Partial<FeeComponentFormValues> = {}
): FeeComponentFormValues => ({
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

describe('groupReadoutComponents', () => {
  it('gộp cùng loại phí, công thức và cơ sở tính nhưng khác bên chịu', () => {
    const groups = groupReadoutComponents([
      component({ key: 'a', payerType: 'RECEIVER', percentage: 4 }),
      component({ key: 'b', payerType: 'USER', percentage: 1 })
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].members.map((m) => m.key)).toEqual(['a', 'b'])
  })

  it('không gộp khi khác loại phí, công thức hoặc cơ sở tính', () => {
    const groups = groupReadoutComponents([
      component({ key: 'a' }),
      component({ key: 'b', componentType: 'VAT' }),
      component({ key: 'c', baseOn: 'FEE_COMPONENT', baseComponentType: 'X' })
    ])

    expect(groups.map((g) => g.key)).toHaveLength(3)
  })

  it('thành phần chia bậc luôn đứng riêng và thứ tự theo lần xuất hiện đầu', () => {
    const groups = groupReadoutComponents([
      component({ key: 'a' }),
      component({ key: 't1', calculationMethod: CalculationMethod.FLAT_TIER }),
      component({ key: 't2', calculationMethod: CalculationMethod.FLAT_TIER }),
      component({ key: 'b', payerType: 'RECEIVER' })
    ])

    expect(groups.map((g) => g.members.map((m) => m.key))).toEqual([
      ['a', 'b'],
      ['t1'],
      ['t2']
    ])
  })
})

describe('FeeComponentGroupReadout', () => {
  it('công thức và cơ sở hiện một lần, mỗi bên chịu một dòng với mức phí riêng', () => {
    render(
      <FeeComponentGroupReadout
        members={[
          component({ key: 'a', payerType: 'RECEIVER', percentage: 4 }),
          component({ key: 'b', payerType: 'USER', percentage: 1 })
        ]}
      />
    )

    expect(screen.getAllByText('Mặc định')).toHaveLength(1)
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getByText('4%')).toBeInTheDocument()
    expect(within(rows[1]).getByText('1%')).toBeInTheDocument()
  })
})

describe('ScopeComponentsCell', () => {
  const configuration = {
    components: [
      {
        id: 'a',
        feeScope: 'OUTPUT_FEE',
        componentType: 'TRANSACTION_FEE',
        baseOn: 'AMOUNT',
        calculationMethod: 'DIRECT',
        payerType: 'RECEIVER',
        beneficiaryType: 'SYSTEM',
        fixedAmount: 0,
        percentage: 4,
        minFee: 0,
        maxFee: 0,
        roundMode: 'UP',
        tiers: []
      },
      {
        id: 'b',
        feeScope: 'OUTPUT_FEE',
        componentType: 'TRANSACTION_FEE',
        baseOn: 'AMOUNT',
        calculationMethod: 'DIRECT',
        payerType: 'USER',
        beneficiaryType: 'SYSTEM',
        fixedAmount: 0,
        percentage: 1,
        minFee: 0,
        maxFee: 0,
        roundMode: 'UP',
        tiers: []
      }
    ],
    assignments: []
  } as unknown as FeePolicyConfiguration

  it('tên loại phí chỉ hiện một lần, mỗi bên chịu một dòng mức phí', () => {
    render(
      <ScopeComponentsCell
        configuration={configuration}
        feeScope='OUTPUT_FEE'
      />
    )

    expect(screen.getAllByText('Phí giao dịch cơ bản')).toHaveLength(1)
    expect(screen.getByText('4%')).toBeInTheDocument()
    expect(screen.getByText('1%')).toBeInTheDocument()
  })
})
