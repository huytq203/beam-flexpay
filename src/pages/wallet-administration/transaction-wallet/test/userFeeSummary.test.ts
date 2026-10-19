import { describe, expect, it } from 'vitest'
import type {
  TransactionFeeDetail,
  TransactionProfit,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import { buildUserFeeSummary } from '../utils/userFeeSummary'

const journal = (
  over: Partial<UnifiedContentJournal>
): UnifiedContentJournal => ({
  id: 'j1',
  journalCode: 'JRN',
  transactionCode: 'FW1',
  status: 'POSTED',
  transactionType: 'P2P_TRANSFER',
  from: { id: 'a', username: 'a', displayName: 'a', type: 'USER' },
  to: { id: 'b', username: 'b', displayName: 'b', type: 'USER' },
  amount: 0,
  grossAmount: 0,
  feeAmount: 0,
  currency: 'VND',
  paymentMethod: 'WALLET_BALANCE',
  bankCode: null,
  bankRefId: null,
  transactionId: null,
  reversesJournalId: null,
  reversedByJournalId: null,
  description: '',
  failureReason: null,
  createdAt: '',
  postedAt: null,
  archivedAt: null,
  sourceDomain: 'EWALLET',
  ...over
})

const profit = (over: Partial<TransactionProfit> = {}): TransactionProfit => ({
  userFeeTotal: 0,
  userFeeBreakdown: [],
  feeBreakdownAvailable: false,
  feePolicyName: null,
  feePolicyValidFrom: null,
  providerCost: null,
  providerCostAvailable: false,
  grossProfit: 0,
  grossProfitLabel: '',
  ...over
})

const fee = (over: Partial<TransactionFeeDetail> = {}): TransactionFeeDetail => ({
  feeCalculationId: 'f1',
  policyName: null,
  totalFee: 0,
  formula: null,
  sides: [],
  components: [],
  totalInputCost: null,
  inputCosts: [],
  ...over
})

describe('buildUserFeeSummary', () => {
  it('chuyển tiền cả hai bên chịu (dữ liệu thật FW26ZJ8V2)', () => {
    const summary = buildUserFeeSummary(
      journal({
        amount: 9600,
        grossAmount: 10100,
        feeAmount: 500,
        feeBearer: 'BOTH',
        senderFeeAmount: 100,
        receiverFeeAmount: 400
      })
    )
    expect(summary.kind).toBe('TRANSFER')
    expect(summary.badge).toBe('Chuyển tiền · Cả hai chịu phí')
    expect(summary.mismatch).toBe(false)
    expect(summary.rows.map(({ label, amount }) => [label, amount])).toEqual([
      ['Số tiền giao dịch', 10000],
      ['Phí người chuyển', 100],
      ['Tổng tiền chuyển', 10100],
      ['Phí người nhận', 400],
      ['Tổng tiền nhận', 9600]
    ])
  })

  it('chuyển tiền người chuyển chịu phí', () => {
    const summary = buildUserFeeSummary(
      journal({
        amount: 10000,
        grossAmount: 10100,
        feeAmount: 100,
        feeBearer: 'SENDER'
      })
    )
    expect(summary.badge).toBe('Chuyển tiền · Người chuyển chịu phí')
    expect(summary.rows.map(({ amount }) => amount)).toEqual([
      10000, 100, 10100, 0, 10000
    ])
  })

  it('nạp tiền: tổng giá trị = gốc + tổng phí', () => {
    const summary = buildUserFeeSummary(
      journal({
        transactionType: 'CASH_IN',
        amount: 1000000,
        grossAmount: 1001000,
        feeAmount: 1000
      })
    )
    expect(summary.kind).toBe('DEPOSIT')
    expect(summary.badge).toBeUndefined()
    expect(summary.rows.map(({ label, amount }) => [label, amount])).toEqual([
      ['Số tiền giao dịch', 1000000],
      ['Tổng phí', 1000],
      ['Tổng giá trị', 1001000]
    ])
  })

  it('rút tiền: tổng thực nhận = gốc − tổng phí (rút 1.000.000, phí 1.000)', () => {
    const summary = buildUserFeeSummary(
      journal({
        transactionType: 'CASH_OUT',
        amount: 999000,
        grossAmount: 1000000,
        feeAmount: 1000
      })
    )
    expect(summary.kind).toBe('WITHDRAWAL')
    expect(summary.rows.map(({ label, amount }) => [label, amount])).toEqual([
      ['Số tiền giao dịch', 1000000],
      ['Tổng phí', 1000],
      ['Tổng thực nhận', 999000]
    ])
  })

  it('số liệu không khớp thì đánh dấu mismatch thay vì đoán', () => {
    const summary = buildUserFeeSummary(
      journal({
        amount: 9000,
        grossAmount: 10100,
        feeAmount: 500,
        feeBearer: 'BOTH',
        senderFeeAmount: 100,
        receiverFeeAmount: 400
      })
    )
    expect(summary.mismatch).toBe(true)
  })

  it('tổng phí gộp một dòng, công thức từ cấu phần (gồm VAT)', () => {
    const summary = buildUserFeeSummary(
      journal({
        transactionType: 'CASH_OUT',
        amount: 998900,
        grossAmount: 1000000,
        feeAmount: 1100
      }),
      profit({
        feeBreakdownAvailable: true,
        userFeeBreakdown: [
          {
            componentType: 'TRANSACTION_FEE',
            fixedAmount: 0,
            percentage: 0.1,
            baseValue: 1000000,
            percentageFee: 1000,
            calculatedFee: 1000
          },
          {
            componentType: 'VAT',
            fixedAmount: 0,
            percentage: 10,
            baseValue: 1000,
            percentageFee: 100,
            calculatedFee: 100
          }
        ]
      })
    )
    const fee = summary.rows.find((row) => row.label === 'Tổng phí')
    expect(fee?.amount).toBe(1100)
    expect(fee?.formula).toBe(
      'Phí giao dịch cơ bản 0.1% × 1,000,000 = 1,000 · VAT 10% × 1,000 = 100'
    )
  })

  it('chuyển tiền cả hai bên: công thức từng bên khi cấu phần có payerType', () => {
    const summary = buildUserFeeSummary(
      journal({
        amount: 9600,
        grossAmount: 10100,
        feeAmount: 500,
        feeBearer: 'BOTH',
        senderFeeAmount: 100,
        receiverFeeAmount: 400
      }),
      profit({
        feeBreakdownAvailable: true,
        userFeeBreakdown: [
          {
            componentType: 'TRANSACTION_FEE',
            fixedAmount: 100,
            percentage: null,
            baseValue: 10000,
            percentageFee: null,
            calculatedFee: 100,
            payerType: 'USER'
          },
          {
            componentType: 'TRANSACTION_FEE',
            fixedAmount: 0,
            percentage: 4,
            baseValue: 10000,
            percentageFee: 400,
            calculatedFee: 400,
            payerType: 'RECEIVER'
          }
        ]
      })
    )
    const sender = summary.rows.find((row) => row.label === 'Phí người chuyển')
    const receiver = summary.rows.find((row) => row.label === 'Phí người nhận')
    expect(sender?.formula).toBe('Phí giao dịch cơ bản 100 = 100')
    expect(receiver?.formula).toBe('Phí giao dịch cơ bản 4% × 10,000 = 400')
  })

  it('chuyển tiền cả hai bên không có payerType thì không đoán công thức từng bên', () => {
    const summary = buildUserFeeSummary(
      journal({
        amount: 9600,
        grossAmount: 10100,
        feeAmount: 500,
        feeBearer: 'BOTH',
        senderFeeAmount: 100,
        receiverFeeAmount: 400
      }),
      profit({
        feeBreakdownAvailable: true,
        userFeeBreakdown: [
          {
            componentType: 'TRANSACTION_FEE',
            fixedAmount: 500,
            percentage: null,
            baseValue: 10000,
            percentageFee: null,
            calculatedFee: 500
          }
        ]
      })
    )
    expect(
      summary.rows.find((row) => row.label === 'Phí người chuyển')?.formula
    ).toBeUndefined()
  })

  describe('khối fee từ fee service', () => {
    it('rút tiền: công thức backend dựng sẵn, ưu tiên hơn profit', () => {
      const summary = buildUserFeeSummary(
        journal({
          transactionType: 'CASH_OUT',
          amount: 49514,
          grossAmount: 50000,
          feeAmount: 486
        }),
        profit({ providerCost: 999, providerCostAvailable: true }),
        fee({
          totalFee: 486,
          formula: 'Phí 0,5% + 200 đ + VAT 8%',
          totalInputCost: 1000,
          inputCosts: [
            {
              componentType: 'BANK_FEE',
              label: 'Phí NCC',
              payerType: 'SYSTEM',
              percentage: null,
              fixedAmount: 1000,
              baseValue: 50000,
              amount: 1000,
              formula: 'Phí 1.000 đ'
            }
          ]
        })
      )
      expect(summary.rows.find((row) => row.label === 'Tổng phí')).toMatchObject({
        amount: 486,
        formula: 'Phí 0,5% + 200 đ + VAT 8%'
      })
    })

    it('chuyển tiền cả hai bên chịu: công thức theo từng phía', () => {
      const summary = buildUserFeeSummary(
        journal({
          amount: 96000,
          grossAmount: 101000,
          feeAmount: 5000,
          feeBearer: 'BOTH',
          senderFeeAmount: 1000,
          receiverFeeAmount: 4000
        }),
        null,
        fee({
          totalFee: 5000,
          sides: [
            { payerType: 'SENDER', payerLabel: 'Người gửi', amount: 1000, formula: 'Phí 1.000 đ' },
            { payerType: 'RECEIVER', payerLabel: 'Người nhận', amount: 4000, formula: 'Phí 4.000 đ' }
          ]
        })
      )
      const formulaOf = (label: string) =>
        summary.rows.find((row) => row.label === label)?.formula
      expect(formulaOf('Phí người chuyển')).toBe('Phí 1.000 đ')
      expect(formulaOf('Phí người nhận')).toBe('Phí 4.000 đ')
    })
  })
})
