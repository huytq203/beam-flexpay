import { useState } from 'react'

import { createKeyConnectionColumns } from '../columns/keyConnection.columns'
import type { KeyConnectionRow } from '../types/keyConnection.type'
import { KeyConnectionStatusDialog } from './KeyConnectionStatusDialog'
import { KeyConnectionTableBody } from './KeyConnectionTableBody'

interface KeyConnectionTableProps {
  rows: KeyConnectionRow[]
  state: 'loading' | 'error' | 'empty' | 'success'
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onEdit: (row: KeyConnectionRow) => void
  onToggleStatus: (id: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

export function KeyConnectionTable({
  onEdit,
  onToggleStatus,
  ...tableProps
}: KeyConnectionTableProps) {
  const [statusRow, setStatusRow] = useState<KeyConnectionRow | null>(null)
  const columns = createKeyConnectionColumns(onEdit, setStatusRow)

  const handleStatusConfirmation = (id: string): void => {
    onToggleStatus(id)
    setStatusRow(null)
  }

  return (
    <>
      <KeyConnectionTableBody columns={columns} {...tableProps} />
      <KeyConnectionStatusDialog
        row={statusRow}
        onCancel={() => setStatusRow(null)}
        onConfirm={handleStatusConfirmation}
      />
    </>
  )
}
