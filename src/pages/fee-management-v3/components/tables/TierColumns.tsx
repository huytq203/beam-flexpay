// ============================================
// TierColumns - Tier Table Column Definitions
// ============================================

import React from 'react'
import { ColumnsType } from 'antd/es/table'
import { Controller, Control, UseFormGetValues } from 'react-hook-form'
import { InputNumber, ButtonComponent } from '@components/common'
import { DeleteOutlined } from '@ant-design/icons'
import type { FeeComponentFormValues } from '../../schemas'
import type { FeeTier } from '../../types'

// ============================================
// Types
// ============================================
interface TierColumnsOptions {
  control: Control<FeeComponentFormValues>
  getValues: UseFormGetValues<FeeComponentFormValues>
  onDeleteTier: (index: number, id?: string) => void
}

// ============================================
// Column Generator
// ============================================
export const getTierColumns = ({
  control,
  getValues,
  onDeleteTier
}: TierColumnsOptions): ColumnsType<FeeTier> => [
  {
    title: 'Phí Cố định',
    dataIndex: 'fixedAmount',
    key: 'fixedAmount',
    render: (_text, _record, index) => (
      <Controller
        control={control}
        name={`tiers.${index}.fixedAmount`}
        render={({ field }) => (
          <InputNumber
            {...field}
            placeholder="0"
            style={{ width: '100%' }}
          />
        )}
      />
    )
  },
  {
    title: 'Phí %',
    dataIndex: 'percentage',
    key: 'percentage',
    render: (_text, _record, index) => (
      <Controller
        control={control}
        name={`tiers.${index}.percentage`}
        render={({ field }) => (
          <InputNumber
            {...field}
            placeholder="0"
            style={{ width: '100%' }}
          />
        )}
      />
    )
  },
  {
    title: 'Từ (Min Fee)',
    dataIndex: 'minFee',
    key: 'minFee',
    render: (_text, _record, index) => (
      <Controller
        control={control}
        name={`tiers.${index}.minFee`}
        render={({ field }) => (
          <InputNumber
            {...field}
            placeholder="Min"
            style={{ width: '100%' }}
          />
        )}
      />
    )
  },
  {
    title: 'Đến (Max Fee)',
    dataIndex: 'maxFee',
    key: 'maxFee',
    render: (_text, _record, index) => (
      <Controller
        control={control}
        name={`tiers.${index}.maxFee`}
        render={({ field }) => (
          <InputNumber
            {...field}
            placeholder="Max"
            style={{ width: '100%' }}
          />
        )}
      />
    )
  },
  {
    title: 'Giá trị tối thiểu',
    dataIndex: 'minValue',
    key: 'minValue',
    render: (_text, _record, index) => (
      <Controller
        control={control}
        name={`tiers.${index}.minValue`}
        render={({ field }) => (
          <InputNumber
            {...field}
            placeholder="Min"
            style={{ width: '100%' }}
          />
        )}
      />
    )
  },
  {
    title: 'Giá trị tối đa',
    dataIndex: 'maxValue',
    key: 'maxValue',
    render: (_text, _record, index) => (
      <Controller
        control={control}
        name={`tiers.${index}.maxValue`}
        render={({ field }) => (
          <InputNumber
            {...field}
            placeholder="Max"
            style={{ width: '100%' }}
          />
        )}
      />
    )
  },
  {
    title: 'Xóa',
    key: 'action',
    align: 'center',
    width: 60,
    render: (_, _record, index) => {
      const currentTier = getValues(`tiers.${index}`)
      const tierId = (currentTier as FeeTier)?.id

      return (
        <div className="flex justify-center items-center gap-1">
          <ButtonComponent
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDeleteTier(index, tierId)}
          />
        </div>
      )
    }
  }
]

export default getTierColumns
