import { describe, expect, it } from 'vitest'
import type { TransactionFeeComponent } from '@type/apiResponseJournal'
import { buildUserFeeSummary } from '../utils/userFeeSummary'
import { feeDetail, journal, profit, transferBoth } from './userFee.fixtures'

const component = (
  over: Partial<TransactionFeeComponent>
): TransactionFeeComponent => ({
  componentType: 'TRANSACTION_FEE',
  label: null,
  payerType: null,
  percentage: null,
  fixedAmount: null,
  baseValue: null,
  amount: null,
  formula: null,
  ...over
})

const withdrawal = journal({
  transactionType: 'CASH_OUT',
  amount: 49000,
  grossAmount: 50000,
  feeAmount: 1000
})

const formulaOf = (
  summary: ReturnType<typeof buildUserFeeSummary>,
  label: string
) => summary.rows.find((row) => row.label === label)?.formula

describe('buildUserFeeSummary — dòng công thức phí', () => {
  it('luôn đủ ba vế, vế không có cấu phần ghi 0', () => {
    const summary = buildUserFeeSummary(
      withdrawal,
      null,
      feeDetail({
        totalFee: 1000,
        formula: 'Phí 2%',
        components: [component({ percentage: 2, amount: 1000 })]
      })
    )
    expect(formulaOf(summary, 'Phí giao dịch')).toBe(
      'Phí 2% + Phí cố định 0 VND + VAT 0%'
    )
  })

  it('cộng dồn phí %, phí cố định và VAT từ breakdown cũ của profit', () => {
    const summary = buildUserFeeSummary(
      withdrawal,
      profit({
        feeBreakdownAvailable: true,
        userFeeBreakdown: [
          {
            componentType: 'TRANSACTION_FEE',
            fixedAmount: 200,
            percentage: 0.5,
            baseValue: 50000,
            percentageFee: 250,
            calculatedFee: 450
          },
          {
            componentType: 'VAT',
            fixedAmount: 0,
            percentage: 8,
            baseValue: 450,
            percentageFee: 36,
            calculatedFee: 36
          }
        ]
      })
    )
    expect(formulaOf(summary, 'Phí giao dịch')).toBe(
      'Phí 0.5% + Phí cố định 200 VND + VAT 8%'
    )
  })

  it('không có cấu phần thì dùng công thức backend, không có nữa thì báo thiếu', () => {
    const fromBackend = buildUserFeeSummary(
      withdrawal,
      null,
      feeDetail({ formula: 'Phí 0,5% + 200 đ + VAT 8%' })
    )
    expect(formulaOf(fromBackend, 'Phí giao dịch')).toBe(
      'Phí 0,5% + 200 đ + VAT 8%'
    )
    expect(formulaOf(buildUserFeeSummary(withdrawal), 'Phí giao dịch')).toBe(
      'Chưa có chi tiết cấu phần phí'
    )
  })

  it('chuyển, cả hai bên chịu: chia cấu phần theo payerType', () => {
    const summary = buildUserFeeSummary(
      transferBoth,
      null,
      feeDetail({
        components: [
          component({ payerType: 'SENDER', fixedAmount: 1000 }),
          component({ payerType: 'RECEIVER', percentage: 2 }),
          component({
            payerType: 'RECEIVER',
            componentType: 'VAT',
            percentage: 10
          })
        ]
      })
    )
    expect(formulaOf(summary, 'Phí người chuyển')).toBe(
      'Phí 0% + Phí cố định 1,000 VND + VAT 0%'
    )
    expect(formulaOf(summary, 'Phí người nhận')).toBe(
      'Phí 2% + Phí cố định 0 VND + VAT 10%'
    )
  })

  it('chuyển, cả hai bên chịu mà thiếu payerType: dùng công thức từng phía của backend', () => {
    const summary = buildUserFeeSummary(
      transferBoth,
      null,
      feeDetail({
        components: [component({ fixedAmount: 2000 })],
        sides: [
          {
            payerType: 'SENDER',
            payerLabel: 'Người gửi',
            amount: 1000,
            formula: 'Phí 1.000 đ'
          }
        ]
      })
    )
    expect(formulaOf(summary, 'Phí người chuyển')).toBe('Phí 1.000 đ')
    expect(formulaOf(summary, 'Phí người nhận')).toBe(
      'Chưa có chi tiết cấu phần phí'
    )
  })

  it('bên không chịu phí hiển thị công thức toàn 0', () => {
    const summary = buildUserFeeSummary(
      journal({
        amount: 10000,
        grossAmount: 10100,
        feeAmount: 100,
        feeBearer: 'SENDER'
      })
    )
    expect(formulaOf(summary, 'Phí người nhận')).toBe(
      'Phí 0% + Phí cố định 0 VND + VAT 0%'
    )
  })
})
