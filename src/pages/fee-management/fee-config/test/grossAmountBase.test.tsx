import { act, render, renderHook, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FeeComponentReadout } from '../components/FeeComponentReadout'
import {
  CalculationMethod,
  feeConfigFormSchema,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { inputCostFormSchema } from '../schemas/inputCostConfig.schema'
import {
  allowsGrossAmountBase,
  getBaseOnOptions
} from '../utils/feeComponentBaseOptions'
import { toSetupRequest } from '../utils/feeConfigPayload'
import { buildFeeBasis } from '../../fee-policy-list/utils/feeBasis'
import { groupReadoutComponents } from '../../fee-policy-list/utils/groupReadoutComponents'
import { useFeeConfigForm } from '../hooks/useFeeConfigForm'
import { baseForm } from './feeConfigPayload.fixtures'

const gross = (
  overrides: Partial<FeeComponentFormValues> = {}
): FeeComponentFormValues => ({
  key: 'cost',
  feeScope: 'INPUT_COST',
  componentType: 'BANK_FEE',
  baseOn: 'GROSS_AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'SYSTEM',
  beneficiaryType: 'PARTNER',
  fixedAmount: null,
  percentage: 1,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const inputForm = (serviceType: string, component = gross()) =>
  baseForm({
    name: 'Phí đối tác',
    serviceType,
    providerCode: 'NAPAS',
    bankCode: 'TCB',
    paymentMethod: 'ATM',
    components: [component]
  })

describe('GROSS_AMOUNT — tuỳ chọn cơ sở tính', () => {
  const values = (allowGrossAmount: boolean) =>
    getBaseOnOptions({
      isBank: false,
      isVat: false,
      hasPrecedingComponents: false,
      allowGrossAmount
    }).map(({ value }) => value)

  it('chỉ hiện khi được phép', () => {
    expect(values(true)).toEqual(['AMOUNT', 'GROSS_AMOUNT'])
    expect(values(false)).toEqual(['AMOUNT'])
  })

  it('có nhãn Số tiền qua đối tác', () => {
    const option = getBaseOnOptions({
      isBank: true,
      isVat: false,
      hasPrecedingComponents: false,
      allowGrossAmount: true
    }).find(({ value }) => value === 'GROSS_AMOUNT')
    expect(option?.label).toBe('Số tiền qua đối tác')
  })

  it('không bao giờ hiện cho VAT', () => {
    expect(
      getBaseOnOptions({
        isBank: false,
        isVat: true,
        hasPrecedingComponents: true,
        allowGrossAmount: true
      }).map(({ value }) => value)
    ).toEqual(['AMOUNT', 'FEE_COMPONENT'])
  })

  it('chỉ cho phí đầu vào của nạp/rút ví', () => {
    expect(allowsGrossAmountBase('EWALLET_DEPOSIT', 'INPUT_COST')).toBe(true)
    expect(allowsGrossAmountBase('EWALLET_WITHDRAWAL', 'INPUT_COST')).toBe(true)
    expect(allowsGrossAmountBase('EWALLET_DEPOSIT', 'OUTPUT_FEE')).toBe(false)
    expect(
      allowsGrossAmountBase('EWALLET_TRANSFER_INTERNAL', 'INPUT_COST')
    ).toBe(false)
    expect(allowsGrossAmountBase('', 'INPUT_COST')).toBe(false)
  })
})

describe('GROSS_AMOUNT — schema', () => {
  it('chấp nhận ở phí đầu vào nạp và rút', () => {
    for (const serviceType of ['EWALLET_DEPOSIT', 'EWALLET_WITHDRAWAL']) {
      expect(
        inputCostFormSchema.safeParse(inputForm(serviceType)).success,
        serviceType
      ).toBe(true)
    }
  })

  it('từ chối ở dịch vụ khác', () => {
    const result = inputCostFormSchema.safeParse(
      inputForm('EWALLET_TRANSFER_INTERNAL')
    )
    expect(result.success).toBe(false)
    expect(
      result.error?.issues.map((issue) => issue.path.join('.'))
    ).toContain('components.0.baseOn')
  })

  it('từ chối ở phí đầu ra (form phí khách)', () => {
    const result = feeConfigFormSchema.safeParse(
      baseForm({
        serviceType: 'EWALLET_DEPOSIT',
        components: [
          gross({
            feeScope: 'OUTPUT_FEE',
            payerType: 'USER',
            beneficiaryType: 'SYSTEM'
          })
        ]
      })
    )
    expect(result.success).toBe(false)
    expect(
      result.error?.issues.map((issue) => issue.path.join('.'))
    ).toContain('components.0.baseOn')
  })
})

describe('GROSS_AMOUNT — payload và hiển thị', () => {
  it('giữ nguyên baseOn và không gửi thành phần cơ sở', () => {
    const [component] = toSetupRequest(
      inputForm('EWALLET_DEPOSIT'),
      'INPUT_COST'
    ).components
    expect(component.baseOn).toBe('GROSS_AMOUNT')
    expect(component.baseComponentType).toBeUndefined()
  })

  it('phần đọc hiện nhãn Số tiền qua đối tác', () => {
    render(<FeeComponentReadout component={gross()} />)
    expect(screen.getByText('Số tiền qua đối tác')).toBeTruthy()
  })

  it('công thức tóm tắt dùng nhãn và không coi là thành phần phụ thuộc', () => {
    const groups = groupReadoutComponents([gross()])
    const basis = buildFeeBasis(groups[0], groups)
    expect(basis.base).toEqual({
      kind: 'AMOUNT',
      label: 'Số tiền qua đối tác'
    })
  })
})

describe('GROSS_AMOUNT — đổi loại giao dịch', () => {
  it('trả về AMOUNT khi sang loại giao dịch không hỗ trợ, giữ khi vẫn là nạp/rút', () => {
    const { result } = renderHook(() =>
      useFeeConfigForm(inputForm('EWALLET_DEPOSIT'), inputCostFormSchema)
    )
    act(() => result.current.changeServiceType('EWALLET_WITHDRAWAL'))
    expect(result.current.form.getValues('components.0.baseOn')).toBe(
      'GROSS_AMOUNT'
    )
    act(() => result.current.changeServiceType('EWALLET_TRANSFER_INTERNAL'))
    expect(result.current.form.getValues('components.0.baseOn')).toBe('AMOUNT')
    expect(
      result.current.form.getValues('components.0.baseComponentType')
    ).toBeNull()
  })
})
