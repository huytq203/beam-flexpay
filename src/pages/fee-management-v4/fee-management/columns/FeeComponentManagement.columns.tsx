import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import {
  getEnumLabel
} from '@pages/fee-management-v4/fee-assignment/utils/FeeManagement.utils'
import {
  formatFeeComponentAmount,
  formatFeeLimit
} from '@utils/fee-format'
import { ColumnsType } from 'antd/es/table'
import { FeeComponent } from '../types/FeeComponent.types'
import { baseOnLabel, calculationMethodEnumLabel, componentTypeLabel, payerTypeLabel } from '../constants/FeeManagement.constant'

interface FeeComponentColumnsProps {
  setSelectedRow?: (row: FeeComponent) => void
  setOpen?: (open: boolean) => void
  setUpdateComponentId?: (id: string) => void
  setDeletingId?: (id: string | null) => void
  setOpenDialog?: (open: boolean) => void
  listBaseOn?: Record<string, string>
  dataSource?: FeeComponent[]
  errorMess: (message: string) => void
  /** Ẩn cột thao tác khi bảng chỉ để xem (chính sách đã duyệt, màn gán phí). */
  readOnly?: boolean
}

export const getFeeComponentColumns = ({
  setSelectedRow,
  setOpen,
  setOpenDialog,
  dataSource,
  errorMess,
  readOnly = false
}: FeeComponentColumnsProps): ColumnsType<FeeComponent> => {
  const columns: ColumnsType<FeeComponent> = [
    {
      title: 'Loại phí',
      dataIndex: 'componentType',
      key: 'componentType',
      width: 200,
      render: (value: string) => (
        <span className='font-medium text-foreground'>
          {getEnumLabel(value, componentTypeLabel)}
        </span>
      )
    },
    {
      title: 'Mức phí',
      key: 'amount',
      width: 160,
      align: 'right' as const,
      render: (_value, record) => (
        <span className='whitespace-nowrap font-medium tabular-nums'>
          {formatFeeComponentAmount(record)}
        </span>
      )
    },
    {
      title: 'Tối thiểu / Tối đa',
      key: 'feeLimit',
      width: 170,
      align: 'right' as const,
      render: (_value, record) => (
        <div className='flex flex-col whitespace-nowrap text-xs tabular-nums'>
          <span>Min: {formatFeeLimit(record.minFee)}</span>
          <span>Max: {formatFeeLimit(record.maxFee)}</span>
        </div>
      )
    },
    {
      title: 'Cách tính',
      dataIndex: 'calculationMethod',
      key: 'calculationMethod',
      width: 150,
      render: (value: string) =>
        getEnumLabel(value, calculationMethodEnumLabel)
    },
    {
      title: 'Tính trên',
      dataIndex: 'baseOn',
      key: 'baseOn',
      width: 190,
      render: (value: string) => getEnumLabel(value, baseOnLabel)
    },
    {
      title: 'Người trả',
      dataIndex: 'payerType',
      key: 'payerType',
      width: 130,
      render: (value: string) => getEnumLabel(value, payerTypeLabel)
    }
  ]

  if (readOnly) return columns

  return [
    ...columns,
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_value, record) => (
        <div className='flex gap-1 justify-center'>
          <TooltipComponent title='Cập nhật'>
            <ButtonComponent
              aria-label='Cập nhật thành phần phí'
              size='small'
              type='default'
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRow?.(record)
                setOpen?.(true)
              }}
            />
          </TooltipComponent>
          <TooltipComponent title='Xóa'>
            <ButtonComponent
              aria-label='Xóa thành phần phí'
              size='small'
              danger
              type='default'
              icon={<DeleteOutlined />}
              onClick={() => {
                const isReferencedByOther = dataSource?.some(
                  item => item.baseOn === record.componentType && item.id !== record.id
                )
                if (isReferencedByOther) {
                  errorMess('Không thể xóa thành phần phí đang được tham chiếu bởi thành phần khác')
                  return
                }
                setOpenDialog?.(true)
                setSelectedRow?.(record)
              }}
            />
          </TooltipComponent>
        </div>
      )
    }
  ]
}
