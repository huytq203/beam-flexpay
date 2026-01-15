// ============================================
// ComponentDetailCard - Fee Component Display Card
// ============================================
// Refactored from ComponentDetail.tsx
// ============================================

import React, { memo, useMemo } from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ButtonComponent, CardComponent, Table } from '@components/common'
import { useGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { getEnumLabel } from '../../utils'
import {
  baseOn,
  beneficiaryType,
  calculationMethodEnum,
  componentType,
  payerType
} from '../../types'
import type { FeeComponent, FeeTier } from '../../types'

// ============================================
// Types
// ============================================
interface ComponentDetailCardProps {
  data: FeeComponent
  onEdit?: (data: FeeComponent) => void
  onDelete?: (data: FeeComponent) => void
}

// ============================================
// Badge Component
// ============================================
interface InfoBadgeProps {
  label: string
  value: string
}

const InfoBadge: React.FC<InfoBadgeProps> = memo(({ label, value }) => (
  <span className="border px-2 py-1 rounded bg-gray-200">
    {label}: <span className="font-medium">{value}</span>
  </span>
))

InfoBadge.displayName = 'InfoBadge'

// ============================================
// Column Generators
// ============================================
const getDirectColumns = () => [
  {
    title: 'Phí cố định',
    dataIndex: 'fixedAmount',
    className: 'border border-b-0'
  },
  {
    title: 'Phần trăm',
    dataIndex: 'percentage',
    className: 'border border-b-0 border-l-0'
  },
  {
    title: 'Giá trị tối thiểu',
    dataIndex: 'minFee',
    className: 'border border-b-0 border-l-0'
  },
  {
    title: 'Giá trị tối đa',
    dataIndex: 'maxFee',
    className: 'border border-b-0 border-l-0'
  }
]

const getTierColumns = () => [
  {
    title: 'Phí cố định',
    dataIndex: 'fixedAmount',
    className: 'border border-b-0'
  },
  {
    title: 'Phần trăm',
    dataIndex: 'percentage',
    className: 'border border-b-0 border-l-0'
  },
  {
    title: 'Giá trị từ',
    dataIndex: 'minFee',
    className: 'border border-b-0 border-l-0'
  },
  {
    title: 'Giá trị đến',
    dataIndex: 'maxFee',
    className: 'border border-b-0 border-l-0'
  },
  {
    title: 'Giá trị min',
    dataIndex: 'minValue',
    className: 'border border-b-0 border-l-0'
  },
  {
    title: 'Giá trị max',
    dataIndex: 'maxValue',
    className: 'border border-b-0 border-l-0'
  }
]

// ============================================
// Main Component
// ============================================
const ComponentDetailCard: React.FC<ComponentDetailCardProps> = ({
  data,
  onEdit,
  onDelete
}) => {
  // Fetch tier data if needed
  const { data: tierData } = useGetFeeComponentTierQuery(data.id!, {
    skip: !data.id || data.calculationMethod === 'DIRECT'
  })

  // Memoized values
  const isDirectMethod = data.calculationMethod === 'DIRECT'
  const isVATType = data.componentType === 'VAT'

  const columns = useMemo(() => {
    return isDirectMethod ? getDirectColumns() : getTierColumns()
  }, [isDirectMethod])

  const tableData = useMemo(() => {
    if (isDirectMethod) {
      return [data]
    }
    return tierData || []
  }, [isDirectMethod, data, tierData])

  // Handlers
  const handleEdit = () => {
    onEdit?.(data)
  }

  const handleDelete = () => {
    onDelete?.(data)
  }

  return (
    <div className="mb-3">
      <CardComponent
        bodyBackground="#f5f5f5"
        content={
          <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">
                {getEnumLabel(data.componentType, componentType)}
              </p>
              <div className="flex gap-2 justify-center items-center">
                <ButtonComponent
                  size="small"
                  type="default"
                  content="Sửa"
                  onClick={handleEdit}
                  icon={<EditOutlined />}
                />
                <ButtonComponent
                  size="small"
                  type="default"
                  content="Xóa"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                />
              </div>
            </div>

            {/* Info Badges */}
            <div className="flex gap-4 px-2 mb-3 flex-wrap">
              <InfoBadge
                label="Người trả"
                value={getEnumLabel(data.payerType, payerType)}
              />
              <InfoBadge
                label="Người hưởng"
                value={getEnumLabel(data.beneficiaryType, beneficiaryType)}
              />
              <InfoBadge
                label="Cách tính"
                value={getEnumLabel(data.calculationMethod, calculationMethodEnum)}
              />
              <InfoBadge
                label="Dựa trên"
                value={getEnumLabel(data.baseOn, baseOn)}
              />
            </div>

            {/* Content */}
            <div className="px-2">
              {isVATType ? (
                <InfoBadge
                  label="Phần trăm VAT"
                  value={`${data.percentage}%`}
                />
              ) : (
                <Table
                  size="small"
                  rowKey="id"
                  dataSource={tableData}
                  columns={columns}
                  pagination={false}
                />
              )}
            </div>
          </div>
        }
      />
    </div>
  )
}

export default memo(ComponentDetailCard)
