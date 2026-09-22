import { useState } from 'react'

import { Table } from '@components/index'

import { EntityLockDialog } from '../../shared/EntityLockDialog'
import { ManagementTableState } from '../../shared/ManagementTableState'
import type { ManagementListState } from '../../shared/management.types'
import { createTerminalColumns } from '../columns/terminal.columns'
import type { TerminalRow } from '../types/terminal.type'

interface TerminalTableProps {
  rows: TerminalRow[]
  state: ManagementListState
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onView: (row: TerminalRow) => void
  onEdit: (row: TerminalRow) => void
  onStatusChange: (id: string, reason: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

export function TerminalTable({
  rows,
  state,
  page,
  pageSize,
  total,
  filtered,
  onView,
  onEdit,
  onStatusChange,
  onPageChange,
  onRetry
}: TerminalTableProps) {
  const [statusRow, setStatusRow] = useState<TerminalRow | null>(null)
  const columns = createTerminalColumns({
    onView,
    onEdit,
    onRequestStatusChange: setStatusRow
  })

  const handleConfirm = (reason: string): void => {
    if (!statusRow) return
    onStatusChange(statusRow.id, reason)
    setStatusRow(null)
  }

  return (
    <>
      <ManagementTableState
        state={state}
        entityName='Terminal'
        emptyKind={filtered ? 'filtered' : 'initial'}
        onRetry={onRetry}
      >
        <Table<TerminalRow>
          columns={columns}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            onChange: onPageChange
          }}
          rowKey='id'
          size='small'
        />
      </ManagementTableState>
      <EntityLockDialog
        blockedMessage={
          statusRow?.status === 'SUSPENDED_BY_SUB'
            ? 'Cần mở khóa Sub-merchant cha trước'
            : undefined
        }
        entityLabel={statusRow ? `${statusRow.name} (${statusRow.tid})` : ''}
        mode={
          statusRow?.status === 'LOCKED' ||
          statusRow?.status === 'SUSPENDED_BY_SUB'
            ? 'unlock'
            : 'lock'
        }
        onCancel={() => setStatusRow(null)}
        onConfirm={handleConfirm}
        open={Boolean(statusRow)}
        previousReason={statusRow?.lastLockReason}
      />
    </>
  )
}
