import type { LedgerEntry } from '@type/systemLedger'
import { getLedgerEntryRole } from '../constants/SystemLedger.constant'

export interface LedgerRow extends LedgerEntry {
  /** Số thứ tự theo trang và kích thước trang, không theo bút toán. */
  no: number
  /** Dòng đầu của một bút toán trong trang: chỉ dòng này in mã giao dịch và mã bút toán. */
  isJournalStart: boolean
  /** Vai trò suy từ cả bút toán, xem `getLedgerEntryRole`. */
  role: string
}

const isFeeEntry = (entry: LedgerEntry): boolean =>
  Boolean(entry.account?.glCode?.startsWith('REV_'))

/**
 * Thứ tự ghi của từng dòng phí trong bút toán: cùng một tài khoản doanh thu nên số dư
 * sau giao dịch tăng dần theo thời gian ghi, dòng ghi trước là phí bên gửi.
 */
const getFeeOrders = (group: LedgerEntry[]): Map<string, number> =>
  new Map(
    group
      .filter(isFeeEntry)
      .sort((a, b) => a.balanceAfter - b.balanceAfter)
      .map((entry, index) => [entry.id, index])
  )

/**
 * Gom các dòng cùng bút toán lại cạnh nhau, Nợ trước Có. API sắp theo thời gian
 * ghi nên dòng Có (phí, người nhận) ghi sau dòng Nợ lại hiện lên trước. Chỉ xếp
 * lại trong trang đang xem: không đổi thứ tự giữa các bút toán. Bút toán thiếu
 * `journalCode` (wallet-core chưa ghi cho hoàn tiền) gom tạm theo giao dịch.
 */
const getJournalKey = (entry: LedgerEntry): string =>
  entry.journalCode ?? `__tx_${entry.transaction.id}`

export const groupLedgerByJournal = (
  entries: LedgerEntry[],
  offset: number
): LedgerRow[] => {
  const groups = new Map<string, LedgerEntry[]>()
  entries.forEach((entry) => {
    const key = getJournalKey(entry)
    groups.set(key, [...(groups.get(key) ?? []), entry])
  })

  let no = offset
  return [...groups.values()].flatMap((group) => {
    const feeOrders = getFeeOrders(group)
    return [...group]
      .sort(
        (a, b) =>
          Number(b.direction === 'DEBIT') - Number(a.direction === 'DEBIT')
      )
      .map((entry, index) => {
        no += 1
        const role = getLedgerEntryRole({
          ...entry,
          feeOrder: feeOrders.get(entry.id)
        })
        return { ...entry, no, isJournalStart: index === 0, role }
      })
  })
}
