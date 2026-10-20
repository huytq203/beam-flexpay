import { describe, expect, it } from 'vitest'
import { buildUserFeeSummary } from '../utils/userFeeSummary'
import { journal, transferBoth } from './userFee.fixtures'

const rowsOf = (summary: ReturnType<typeof buildUserFeeSummary>) =>
  summary.rows.map(({ label, amount }) => [label, amount])

describe('buildUserFeeSummary — dòng tiền theo loại giao dịch', () => {
  it('nạp: ví được cộng đủ gốc, bank bị trừ gốc + phí', () => {
    const summary = buildUserFeeSummary(
      journal({
        transactionType: 'CASH_IN',
        amount: 50000,
        grossAmount: 51000,
        feeAmount: 1000
      })
    )
    expect(summary.kind).toBe('DEPOSIT')
    expect(summary.badge).toBeUndefined()
    expect(summary.mismatch).toBe(false)
    expect(rowsOf(summary)).toEqual([
      ['Số tiền giao dịch', 50000],
      ['Số tiền cộng vào ví', 50000],
      ['Phí giao dịch', 1000],
      ['Số tiền thực trừ trên bank', 51000]
    ])
  })

  it('rút: ví bị trừ đủ gốc, bank nhận gốc − phí', () => {
    const summary = buildUserFeeSummary(
      journal({
        transactionType: 'CASH_OUT',
        amount: 49000,
        grossAmount: 50000,
        feeAmount: 1000
      })
    )
    expect(summary.kind).toBe('WITHDRAWAL')
    expect(summary.mismatch).toBe(false)
    expect(rowsOf(summary)).toEqual([
      ['Số tiền giao dịch', 50000],
      ['Số tiền trừ trên ví', 50000],
      ['Phí giao dịch', 1000],
      ['Số tiền thực nhận trên bank', 49000]
    ])
  })

  it('chuyển, cả hai bên chịu phí: trừ ví người chuyển và cộng ví người nhận', () => {
    const summary = buildUserFeeSummary(transferBoth)
    expect(summary.kind).toBe('TRANSFER')
    expect(summary.badge).toBe('Chuyển tiền · Cả hai chịu phí')
    expect(summary.mismatch).toBe(false)
    expect(rowsOf(summary)).toEqual([
      ['Số tiền giao dịch', 50000],
      ['Số tiền trừ trên ví người chuyển', 51000],
      ['Phí người chuyển', 1000],
      ['Số tiền cộng vào ví người nhận', 49000],
      ['Phí người nhận', 1000]
    ])
  })

  it('chuyển, người chuyển chịu phí: người nhận nhận đủ gốc, phí nhận = 0', () => {
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
      10000, 10100, 100, 10000, 0
    ])
  })

  it('dòng tiền thực đi/đến được nhấn mạnh, dòng phí đánh dấu là phí', () => {
    const summary = buildUserFeeSummary(transferBoth)
    expect(
      summary.rows.filter((row) => row.isTotal).map((row) => row.label)
    ).toEqual([
      'Số tiền trừ trên ví người chuyển',
      'Số tiền cộng vào ví người nhận'
    ])
    expect(
      summary.rows.filter((row) => row.isFee).map((row) => row.label)
    ).toEqual(['Phí người chuyển', 'Phí người nhận'])
  })

  it('số liệu không khớp thì đánh dấu mismatch thay vì đoán', () => {
    const summary = buildUserFeeSummary({ ...transferBoth, amount: 40000 })
    expect(summary.mismatch).toBe(true)
  })
})
