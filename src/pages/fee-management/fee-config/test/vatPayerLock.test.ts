import { describe, expect, it } from 'vitest'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import {
  TRANSFER_BEARER_DEPENDENT_SIDE_MESSAGE,
  validateTransferBearers
} from '../utils/transferBearers'
import {
  BOTH_BEARERS_OPTION,
  buildPayerSelectOptions,
  dependentPayerFor
} from '../utils/payerSelectOptions'

const fee = (
  payerType: string,
  overrides: Partial<FeeComponentFormValues> = {}
): FeeComponentFormValues =>
  ({
    key: `${payerType}-${overrides.componentType ?? 'TRANSACTION_FEE'}`,
    feeScope: 'OUTPUT_FEE',
    componentType: 'TRANSACTION_FEE',
    baseOn: 'AMOUNT',
    baseComponentType: null,
    calculationMethod: 'DIRECT',
    payerType,
    beneficiaryType: 'SYSTEM',
    fixedAmount: 1000,
    percentage: 0,
    minFee: 0,
    maxFee: 0,
    roundMode: 'UP',
    tiers: [],
    ...overrides
  }) as FeeComponentFormValues

const vat = (payerType: string) =>
  fee(payerType, {
    componentType: 'VAT',
    baseOn: 'FEE_COMPONENT',
    baseComponentType: 'TRANSACTION_FEE',
    beneficiaryType: 'BANK'
  })

const OPTIONS = [
  { value: 'USER', label: 'Người chuyển' },
  { value: 'RECEIVER', label: 'Người nhận' }
]

describe('VAT cùng người chịu với phí gốc', () => {
  it('phí gốc chỉ một bên thì VAT khoá đúng bên đó', () => {
    expect(dependentPayerFor('TRANSACTION_FEE', [fee('RECEIVER')])).toBe(
      'RECEIVER'
    )
    expect(dependentPayerFor('TRANSACTION_FEE', [fee('USER')])).toBe('USER')
    expect(buildPayerSelectOptions(OPTIONS, false, 'RECEIVER')).toEqual([
      { value: 'RECEIVER', label: 'Người nhận' }
    ])
  })

  it('phí gốc ở cả hai bên hoặc chưa có thì không khoá', () => {
    expect(
      dependentPayerFor('TRANSACTION_FEE', [fee('USER'), fee('RECEIVER')])
    ).toBeNull()
    expect(dependentPayerFor('TRANSACTION_FEE', [])).toBeNull()
    expect(buildPayerSelectOptions(OPTIONS, false, null)).toEqual(OPTIONS)
    expect(buildPayerSelectOptions(OPTIONS, true, null)).toEqual([
      ...OPTIONS,
      BOTH_BEARERS_OPTION
    ])
  })

  it.each([
    'EWALLET_DEPOSIT',
    'EWALLET_WITHDRAWAL',
    'EWALLET_TRANSFER_INTERNAL'
  ])(
    '%s: phí người nhận chịu mà VAT khai người chuyển bị chặn lúc lưu',
    (serviceType) => {
      expect(
        validateTransferBearers(serviceType, [fee('RECEIVER'), vat('USER')])
      ).toBe(TRANSFER_BEARER_DEPENDENT_SIDE_MESSAGE)
      expect(
        validateTransferBearers(serviceType, [fee('RECEIVER'), vat('RECEIVER')])
      ).toBeNull()
    }
  )
})
