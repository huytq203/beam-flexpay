import type { LedgerEntry } from '@type/systemLedger'
import { describe, expect, it } from 'vitest'
import { groupLedgerByJournal } from '../utils/groupLedgerByJournal'

const entry = (
  id: string,
  journalCode: string | null,
  direction: LedgerEntry['direction'],
  transactionId = `tx-${id}`
) =>
  ({
    id,
    journalCode,
    direction,
    transaction: { id: transactionId }
  }) as LedgerEntry

describe('groupLedgerByJournal', () => {
  it('gom dòng cùng bút toán, Nợ trước Có, giữ thứ tự giữa các bút toán', () => {
    const rows = groupLedgerByJournal(
      [
        entry('fee', 'JRN-A', 'CREDIT'),
        entry('cash-in', 'JRN-B', 'DEBIT'),
        entry('sender', 'JRN-A', 'DEBIT'),
        entry('receiver', 'JRN-A', 'CREDIT')
      ],
      0
    )

    expect(rows.map((row) => row.id)).toEqual([
      'sender',
      'fee',
      'receiver',
      'cash-in'
    ])
    expect(rows.map((row) => row.isJournalStart)).toEqual([
      true,
      false,
      false,
      true
    ])
  })

  it('đánh số # nối tiếp theo trang', () => {
    const rows = groupLedgerByJournal(
      [entry('a', 'JRN-A', 'DEBIT'), entry('b', 'JRN-A', 'CREDIT')],
      20
    )
    expect(rows.map((row) => row.no)).toEqual([21, 22])
  })

  it('dòng thiếu mã bút toán gom theo giao dịch, Nợ trước Có', () => {
    const rows = groupLedgerByJournal(
      [
        entry('refund-credit', null, 'CREDIT', 'tx-RF'),
        entry('other', 'JRN-A', 'DEBIT'),
        entry('refund-debit', null, 'DEBIT', 'tx-RF')
      ],
      0
    )

    expect(rows.map((row) => row.id)).toEqual([
      'refund-debit',
      'refund-credit',
      'other'
    ])
    expect(rows.map((row) => row.isJournalStart)).toEqual([true, false, true])
  })

  it('dòng thiếu mã bút toán của giao dịch khác nhau không bị gộp', () => {
    const rows = groupLedgerByJournal(
      [entry('a', null, 'DEBIT', 'tx-1'), entry('b', null, 'CREDIT', 'tx-2')],
      0
    )
    expect(rows.map((row) => row.isJournalStart)).toEqual([true, true])
  })

  it('không gộp dòng có mã bút toán với dòng thiếu mã dù cùng giao dịch', () => {
    const rows = groupLedgerByJournal(
      [entry('a', 'JRN-A', 'DEBIT', 'tx-1'), entry('b', null, 'DEBIT', 'tx-1')],
      0
    )
    expect(rows.map((row) => row.isJournalStart)).toEqual([true, true])
  })
})
