import {
  REFUND_DEBITED_SIDE_MESSAGE,
  validateRefundDebitedSide
} from '@utils/fee-execution'
import { describe, expect, it } from 'vitest'
import {
  getOutputPayerOptions,
  getPayerLabel
} from '../constants/feeComponentParties'
import {
  feeConfigFormSchema,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import { getComponentPartyOptions } from '../utils/feeComponentParties'

const component = (
  payerType: string
): FeeConfigFormValues['components'][number] =>
  ({
    key: `c-${payerType}`,
    feeScope: 'OUTPUT_FEE',
    componentType: 'TRANSACTION_FEE',
    baseOn: 'AMOUNT',
    baseComponentType: null,
    calculationMethod: 'DIRECT',
    payerType,
    beneficiaryType: 'SYSTEM',
    fixedAmount: 5000,
    percentage: 0,
    minFee: 0,
    maxFee: 0,
    roundMode: 'UP',
    tiers: []
  }) as FeeConfigFormValues['components'][number]

const refundForm = (
  originalTransactionType: string,
  payers: string[]
): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: 'Phí xử lý hoàn',
  description: '',
  priority: 2,
  serviceType: 'EWALLET_REFUND',
  bankCode: '',
  providerCode: '',
  paymentMethod: '',
  merchantId: '',
  subjectId: '',
  customerGroup: '',
  assignmentScope: 'ALL',
  originalTransactionType,
  validFrom: '2026-10-01T00:00:00.000',
  validTo: '',
  components: payers.map(component)
})

const originalTypeErrors = (values: FeeConfigFormValues) => {
  const result = feeConfigFormSchema.safeParse(values)
  return result.success
    ? []
    : result.error.issues
        .filter((issue) => issue.path.join('.') === 'originalTransactionType')
        .map((issue) => issue.message)
}

describe('phí hoàn: người chuyển và người nhận chịu phí', () => {
  it('giữ nhãn Người chuyển / Người nhận như các dịch vụ ví', () => {
    expect(getPayerLabel('USER', 'EWALLET_REFUND')).toBe('Người chuyển')
    expect(getPayerLabel('RECEIVER', 'EWALLET_REFUND')).toBe('Người nhận')
    expect(getOutputPayerOptions('EWALLET_REFUND')).toEqual([
      { value: 'USER', label: 'Người chuyển' },
      { value: 'RECEIVER', label: 'Người nhận' }
    ])
  })

  it.each(['P2P_TRANSFER', 'CASH_IN', 'MERCHANT_PAYMENT'])(
    'người nhận chịu được ở hoàn %s',
    (originalType) => {
      expect(
        originalTypeErrors(refundForm(originalType, ['USER', 'RECEIVER']))
      ).toEqual([])
    }
  )

  it('chặn người nhận chịu ở hoàn rút tiền và khi để trống loại gốc', () => {
    expect(originalTypeErrors(refundForm('CASH_OUT', ['RECEIVER']))).toEqual([
      REFUND_DEBITED_SIDE_MESSAGE
    ])
    expect(originalTypeErrors(refundForm('', ['RECEIVER']))).toEqual([
      REFUND_DEBITED_SIDE_MESSAGE
    ])
  })

  it('chỉ người chuyển chịu thì mọi loại gốc đều được, kể cả để trống', () => {
    expect(originalTypeErrors(refundForm('CASH_OUT', ['USER']))).toEqual([])
    expect(originalTypeErrors(refundForm('', ['USER']))).toEqual([])
  })

  it('hộp thoại ẩn Người nhận khi loại gốc không cho người nhận chịu', () => {
    const payers = (originalType?: string) =>
      getComponentPartyOptions(
        false,
        'EWALLET_REFUND',
        originalType
      ).payerTypeOptions.map(({ value }) => value)

    expect(payers('P2P_TRANSFER')).toEqual(['USER', 'RECEIVER'])
    expect(payers('CASH_IN')).toEqual(['USER', 'RECEIVER'])
    expect(payers('CASH_OUT')).toEqual(['USER'])
    expect(payers('')).toEqual(['USER'])
    expect(payers(undefined)).toEqual(['USER'])
  })

  it('dịch vụ khác vẫn bày đủ người chịu', () => {
    expect(
      getComponentPartyOptions(
        false,
        'EWALLET_WITHDRAWAL'
      ).payerTypeOptions.map(({ value }) => value)
    ).toEqual(['USER', 'RECEIVER'])
  })

  it('dịch vụ khác không bị luật này chặn', () => {
    expect(
      validateRefundDebitedSide('EWALLET_DEPOSIT', '', [
        { payerType: 'RECEIVER' }
      ])
    ).toBeNull()
  })
})
