// ============================================
// PolicyColumns - Fee Policy Table Column Definitions
// ============================================

import React from 'react'
import { ColumnsType } from 'antd/es/table'
import { StatusBadge, ActionButtons } from '../shared'
import { formatDate, formatDateOrIndefinite, getEnumLabel } from '../../utils'
import { serviceType, feeDomain } from '../../types'
import type { PolicyTableRecord } from '../../types'

// ============================================
// Types
// ============================================
interface PolicyColumnsOptions {
  onEdit: (record: PolicyTableRecord) => void
  onActivate: (record: PolicyTableRecord) => void
  onDeactivate: (record: PolicyTableRecord) => void
}

// ============================================
// Column Generator
// ============================================
export const getPolicyColumns = ({
  onEdit,
  onActivate,
  onDeactivate
}: PolicyColumnsOptions): ColumnsType<PolicyTableRecord> => [
  {
    title: 'STT',
    dataIndex: 'no',
    width: 60,
    align: 'center',
    className: 'border'
  },
  {
    title: 'Tên chính sách',
    dataIndex: 'name',
    className: 'border border-l-0 border-b-0'
  },
  {
    title: 'Loại dịch vụ',
    dataIndex: 'serviceType',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, serviceType)
  },
  {
    title: 'Phí miền',
    dataIndex: 'feeDomain',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, feeDomain)
  },
  {
    title: 'Loại tiền',
    dataIndex: 'currency',
    className: 'border border-l-0 border-b-0'
  },
  {
    title: 'Hiệu lực từ',
    dataIndex: 'validFrom',
    className: 'border border-l-0 border-b-0',
    render: (date: string) => formatDate(date)
  },
  {
    title: 'Hiệu lực đến',
    dataIndex: 'validTo',
    className: 'border border-l-0 border-b-0',
    render: (date: string) => formatDateOrIndefinite(date)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    className: 'border border-l-0 border-b-0',
    align: 'center',
    render: (status: string) => <StatusBadge status={status} />
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 100,
    className: 'border border-l-0 border-b-0',
    align: 'center',
    render: (_, record) => (
      <ActionButtons
        record={record}
        status={record.status}
        onEdit={onEdit}
        onToggleStatus={
          record.status === 'ACTIVE'
            ? () => onDeactivate(record)
            : () => onActivate(record)
        }
        showDelete={false}
      />
    )
  }
]

export default getPolicyColumns
