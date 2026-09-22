import { useState } from 'react'

import { Table } from '@components/index'

import { EntityLockDialog } from '../../shared/EntityLockDialog'
import { ManagementTableState } from '../../shared/ManagementTableState'
import type { ManagementListState } from '../../shared/management.types'
import { createSubMerchantColumns } from '../columns/subMerchant.columns'
import type { SubMerchantRow } from '../types/subMerchant.type'

interface SubMerchantTableProps {
  rows: SubMerchantRow[]
  state: ManagementListState
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onView: (row: SubMerchantRow) => void
  onEdit: (row: SubMerchantRow) => void
  onPageChange: (page: number) => void
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
          pagination={{ current: page, pageSize, showSizeChanger: false, total, onChange: onPageChange }}
          rowKey='id'
        />
      </ManagementTableState>
      <EntityLockDialog
        blockedMessage={statusRow?.status === 'SUSPENDED_BY_PARENT' ? 'Cần mở khóa Merchant cha trước' : undefined}
        entityLabel={statusRow ? `${statusRow.name} (${statusRow.code})` : ''}
        mode={statusRow?.status === 'ACTIVE' ? 'lock' : 'unlock'}
        onCancel={() => setStatusRow(null)}
        onConfirm={handleConfirm}
        open={Boolean(statusRow)}
        previousReason={statusRow?.lastLockReason}
      />
    </>
  )
}
