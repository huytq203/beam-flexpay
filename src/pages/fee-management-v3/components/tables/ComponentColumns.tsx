// ============================================
// ComponentColumns - Fee Component Table Column Definitions
// ============================================

import React from 'react'
import { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ButtonComponent, TooltipComponent } from '@components/common'
import { getEnumLabel } from '../../utils'
import {
  beneficiaryType,
  calculationMethodEnum,
  componentType,
  payerType
} from '../../types'
import type { FeeComponent } from '../../types'

// ============================================
// Types
// ============================================
interface ComponentColumnsOptions {
  onEdit: (record: FeeComponent) => void
  onDelete: (record: FeeComponent) => void
}

// ============================================
// Column Generator
// ============================================
export const getComponentColumns = ({
  onEdit,
  onDelete
}: ComponentColumnsOptions): ColumnsType<FeeComponent & { no?: number }> => [
  {
    title: '#',
    dataIndex: 'no',
    width: 60,
    align: 'center',
    className: 'border border-b-0',
    render: (_, __, index) => index + 1
  },
  {
    title: 'Loại (Type)',
    dataIndex: 'componentType',
    key: 'componentType',
    className: 'border border-l-0',
    render: (value: string) => getEnumLabel(value, componentType)
  },
  {
    title: 'Cách tính',
    dataIndex: 'calculationMethod',
    key: 'calculationMethod',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, calculationMethodEnum)
  },
  {
    title: 'Người trả',
    dataIndex: 'payerType',
    key: 'payerType',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, payerType)
  },
  {
    title: 'Người hưởng',
    dataIndex: 'beneficiaryType',
    key: 'beneficiaryType',
    className: 'border border-l-0 border-b-0',
    render: (value: string) => getEnumLabel(value, beneficiaryType)
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 100,
    className: 'border border-l-0 border-b-0',
    align: 'center',
    render: (_, record) => (
      <div className="flex gap-1 justify-center">
        <TooltipComponent title="Cập nhật">
          <ButtonComponent
            type="default"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </TooltipComponent>
        <TooltipComponent title="Xóa">
          <ButtonComponent
            danger
            type="default"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
          />
        </TooltipComponent>
      </div>
    )
  }
]

export default getComponentColumns
