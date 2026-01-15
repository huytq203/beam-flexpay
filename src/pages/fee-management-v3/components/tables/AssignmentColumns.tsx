// ============================================
// AssignmentColumns - Fee Assignment Table Column Definitions
// ============================================

import React from 'react'
import { ColumnsType } from 'antd/es/table'
import { EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons'
import { ButtonComponent, TooltipComponent } from '@components/common'
import { FEEMANAGEMENT_V3 } from '@constants/routersConstant'
import { StatusBadge } from '../shared'
import { formatDate, getEnumLabel } from '../../utils'
import { serviceType } from '../../types'
import type { FeeAssignment } from '../../types'

// ============================================
// Types
// ============================================
interface AssignmentColumnsOptions {
  navigate: (path: string) => void
  onToggleStatus?: (record: FeeAssignment) => void
}

// ============================================
// Column Generator
// ============================================
export const getAssignmentColumns = ({
  navigate,
  onToggleStatus
}: AssignmentColumnsOptions): ColumnsType<FeeAssignment> => [
  {
    title: '#',
    align: 'center',
    className: 'border border-b-0',
    width: 40,
    render: (_, __, index) => index + 1
  },
  {
    title: 'Loại giao dịch',
    dataIndex: 'serviceType',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (value: string) => getEnumLabel(value, serviceType)
  },
  {
    title: 'Phương thức thanh toán',
    dataIndex: 'paymentMethod',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (value: string) => value || '-'
  },
  {
    title: 'Ngân hàng',
    dataIndex: 'bankCode',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (value: string) => value || '-'
  },
  {
    title: 'Loại thẻ',
    dataIndex: 'cardType',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (value: string) => value || '-'
  },
  {
    title: 'Nhóm khách hàng',
    dataIndex: 'customerGroup',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (value: string) => value || '-'
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (date: string) => formatDate(date)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (status: string) => <StatusBadge status={status} />
  },
  {
    title: 'Hành động',
    dataIndex: 'Action',
    fixed: 'right',
    width: 100,
    align: 'center',
    className: 'border border-b-0 border-l-0',
    render: (_, record) => (
      <div className="flex gap-1 justify-center">
        <TooltipComponent title={record.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}>
          <ButtonComponent
            type="default"
            icon={record.status === 'ACTIVE' ? <UnlockOutlined /> : <LockOutlined />}
            onClick={() => onToggleStatus?.(record)}
          />
        </TooltipComponent>
        <TooltipComponent title="Cập nhật">
          <ButtonComponent
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              navigate(FEEMANAGEMENT_V3 + `/fee-assignment/edit/${record?.id}`)
            }}
          />
        </TooltipComponent>
      </div>
    )
  }
]

export default getAssignmentColumns
