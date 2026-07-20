import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import {
  getEnumLabel
} from '@pages/fee-management-v4/fee-assignment/utils/FeeManagement.utils'
import { FeeComponent, beneficiaryType, calculationMethodEnum, componentType, payerType } from '../types/FeeComponent.types'
import { ColumnsType } from 'antd/es/table'

interface FeeComponentColumnsProps {
  setSelectedRow: (row: FeeComponent) => void
  setOpen: (open: boolean) => void
  setUpdateComponentId: (id: string) => void
  setDeletingId: (id: string) => void
  setOpenDialog: (open: boolean) => void
}

export const feeComponentColumns = ({
  setSelectedRow,
  setOpen,
  setUpdateComponentId,
  setDeletingId,
  setOpenDialog
}: FeeComponentColumnsProps): ColumnsType<FeeComponent> => {
  return [
    {
      title: '#',
      dataIndex: 'no',
      width: 60,
      align: 'center' as const,
      render: (_value, _record, index) => index + 1 // Assuming 'no' might not be in the data record itself or we can just use index
    },
    {
      title: 'Loại',
      dataIndex: 'componentType',
      key: 'componentType',
      render: (value: string) => getEnumLabel(value, componentType)
    },
    {
      title: 'Cách tính',
      dataIndex: 'calculationMethod',
      key: 'calculationMethod',
      render: (value: string) =>
        getEnumLabel(value, calculationMethodEnum)
    },
    {
      title: 'Người trả',
      dataIndex: 'payerType',
      key: 'payerType',
      render(value: string) {
        return getEnumLabel(value, payerType)
      },
    },
    {
      title: 'Người hưởng',
      dataIndex: 'beneficiaryType',
      key: 'beneficiaryType',
      render: (value: string) => getEnumLabel(value, beneficiaryType)
    },
    {
      title: 'Dựa trên',
      dataIndex: 'baseOn',
      key: 'baseOn',
      render: (value: string) => getEnumLabel(value, componentType)
    },

    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_value, record) => (
        <div className='flex gap-1 justify-center'>
          <TooltipComponent title='Cập nhật'>
            <ButtonComponent
              size='small'
              type='default'
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRow(record)
                setOpen(true)
                // if (record.id) setUpdateComponentId(record.id)
              }}
            />
          </TooltipComponent>
          <TooltipComponent title='Xóa'>
            <ButtonComponent
              size='small'
              danger
              type='default'
              icon={<DeleteOutlined />}
              onClick={() => {
                if (record.id) {
                  setDeletingId(record.id)
                  setOpenDialog(true)
                }
              }}
            />
          </TooltipComponent>
        </div>
      )
    }
  ]
}
