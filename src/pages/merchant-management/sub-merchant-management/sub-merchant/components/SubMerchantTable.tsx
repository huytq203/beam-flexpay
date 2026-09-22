import { useState } from 'react'

import { Table } from '@components/index'

import { ManagementTableState } from '../../shared/ManagementTableState'
import type { ManagementListState } from '../../shared/management.types'
import { createSubMerchantColumns } from '../columns/subMerchant.columns'
import type { SubMerchantRow } from '../types/subMerchant.type'
import { SubMerchantLockDialog } from './SubMerchantLockDialog'

interface SubMerchantTableProps {
  rows: SubMerchantRow[]
  state: ManagementListState
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onView: (row: SubMerchantRow) => void
  onEdit: (row: SubMerchantRow) => void
  onPageChange: (page: number, pageSize: number) => void
  onRetry: () => void
  onToggleStatus: (id: string, reason: string) => boolean
}

export function SubMerchantTable({
  rows,
  state,
  page,
  pageSize,
  total,
  filtered,
  onView,
  onEdit,
  onPageChange,
  onRetry,
  onToggleStatus
}: SubMerchantTableProps) {
  const [statusRow, setStatusRow] = useState<SubMerchantRow | null>(null)
  const columns = createSubMerchantColumns({ onView, onEdit, onStatus: setStatusRow })

  const handleConfirm = (reason: string): void => {
    if (!statusRow) return
    if (onToggleStatus(statusRow.id, reason)) setStatusRow(null)
  }

  return (
    <>
      <ManagementTableState emptyKind={filtered ? 'filtered' : 'initial'} entityName='Sub-merchant' onRetry={onRetry} state={state}>
        <Table<SubMerchantRow>
          columns={columns}
          dataSource={rows}
          onRefresh={onRetry}
          pagination={{ current: page, pageSize, pageSizeOptions: [10, 20, 50], showSizeChanger: true, total, onChange: onPageChange }}
          rowKey='id'
          size='small'
        />
      </ManagementTableState>
      <SubMerchantLockDialog
        record={statusRow}
        onCancel={() => setStatusRow(null)}
        onConfirm={handleConfirm}
        open={Boolean(statusRow)}
      />
    </>
  )
}
