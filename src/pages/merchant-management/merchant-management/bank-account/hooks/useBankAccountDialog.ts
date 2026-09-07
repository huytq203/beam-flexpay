import { useState } from 'react'

import {
  BankAccountStatus,
  type BankAccountDialogState,
  type BankAccountRow
} from '../types/bank-account.type'

/** Một hộp thoại mở tại một thời điểm — form thêm/sửa hoặc hộp khóa/mở khóa. */
export function useBankAccountDialog() {
  const [dialog, setDialog] = useState<BankAccountDialogState | null>(null)

  const openCreate = (): void =>
    setDialog({ kind: 'form', mode: 'create', row: null })

  const openEdit = (row: BankAccountRow): void =>
    setDialog({ kind: 'form', mode: 'edit', row })

  const openLock = (row: BankAccountRow): void =>
    setDialog({
      kind: 'lock',
      mode: row.status === BankAccountStatus.ACTIVE ? 'lock' : 'unlock',
      row
    })

  const close = (): void => setDialog(null)

  return { dialog, openCreate, openEdit, openLock, close }
}
