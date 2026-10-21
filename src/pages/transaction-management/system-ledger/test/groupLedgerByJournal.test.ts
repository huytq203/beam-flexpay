import type { LedgerEntry } from '@type/systemLedger'
import { describe, expect, it } from 'vitest'
import { groupLedgerByJournal } from '../utils/groupLedgerByJournal'

const entry = (
  id: string,
  journalCode: string | null,
  direction: LedgerEntry['direction']
) => ({ id, journalCode, direction }) as LedgerEntry

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

  it('dòng thiếu mã bút toán đứng riêng, không bị gộp với nhau', () => {
    const rows = groupLedgerByJournal(
      [entry('a', null, 'DEBIT'), entry('b', null, 'CREDIT')],
      0
    )
    expect(rows.map((row) => row.isJournalStart)).toEqual([true, true])
  })
})
