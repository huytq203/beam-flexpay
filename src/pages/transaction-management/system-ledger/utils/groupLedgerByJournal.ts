import type { LedgerEntry } from '@type/systemLedger'

export interface LedgerRow extends LedgerEntry {
  /** Số thứ tự theo trang và kích thước trang, không theo bút toán. */
  no: number
  /** Dòng đầu của một bút toán trong trang: chỉ dòng này in mã giao dịch và mã bút toán. */
  isJournalStart: boolean
}

/**
 * Gom các dòng cùng bút toán lại cạnh nhau, Nợ trước Có. API sắp theo thời gian
 * ghi nên dòng Có (phí, người nhận) ghi sau dòng Nợ lại hiện lên trước. Chỉ xếp
 * lại trong trang đang xem: không đổi thứ tự giữa các bút toán. Bút toán thiếu
 * `journalCode` (wallet-core chưa ghi cho hoàn tiền) gom tạm theo giao dịch.
 */
export const groupLedgerByJournal = (
  entries: LedgerEntry[],
  offset: number
): LedgerRow[] => {
  const groups = new Map<string, LedgerEntry[]>()
  entries.forEach((entry) => {
    const key = entry.journalCode ?? `__tx_${entry.transaction.id}`
    groups.set(key, [...(groups.get(key) ?? []), entry])
  })

  let no = offset
  return [...groups.values()].flatMap((group) =>
    [...group]
      .sort(
        (a, b) =>
          Number(b.direction === 'DEBIT') - Number(a.direction === 'DEBIT')
      )
      .map((entry, index) => {
        no += 1
        return { ...entry, no, isJournalStart: index === 0 }
      })
  )
}
