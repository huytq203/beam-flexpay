import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { Tooltip } from 'antd'
import {
  getEnumLabel
} from '@pages/fee-management-v4/fee-assignment/utils/FeeManagement.utils'
import { ColumnsType } from 'antd/es/table'
import { FeeComponent } from '../types/FeeComponent.types'
import { baseOnLabel, beneficiaryTypeLabel, calculationMethodEnumLabel, componentType, componentTypeLabel, payerTypeLabel } from '../constants/FeeManagement.constant'
import { useMessage } from '@hooks/useMessage'

interface FeeComponentColumnsProps {
  setSelectedRow?: (row: FeeComponent) => void
  setOpen?: (open: boolean) => void
  setUpdateComponentId?: (id: string) => void
  setDeletingId?: (id: string | null) => void
  setOpenDialog?: (open: boolean) => void
  listBaseOn?: Record<string, string>
  dataSource?: FeeComponent[]
}

export const getFeeComponentColumns = ({
  setSelectedRow,
  setOpen,
  setDeletingId,
  setOpenDialog,
  listBaseOn,
  dataSource
}: FeeComponentColumnsProps): ColumnsType<FeeComponent> => {

  const {errorMess}=useMessage()
  return [
    {
      title: '#',
      dataIndex: 'no',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1 // Assuming 'no' might not be in the data record itself or we can just use index
    },
    {
      title: 'Loại',
      dataIndex: 'componentType',
      key: 'componentType',
      render: (value: string) => getEnumLabel(value, componentTypeLabel)
    },
    {
      title: 'Cách tính',
      dataIndex: 'calculationMethod',
      key: 'calculationMethod',
      render: (value: string) =>
        getEnumLabel(value, calculationMethodEnumLabel)
    },
    {
      title: 'Người trả',
      dataIndex: 'payerType',
      key: 'payerType',
      render(value: string) {
        return getEnumLabel(value, payerTypeLabel)
      },
    },
    {
      title: 'Người hưởng',
      dataIndex: 'beneficiaryType',
      key: 'beneficiaryType',
      render: (value: string) => getEnumLabel(value, beneficiaryTypeLabel)
    },
    {
      title: 'Dựa trên',
      dataIndex: 'baseOn',
      key: 'baseOn',
      render: (value: string) => getEnumLabel(value, baseOnLabel)
    },

    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: FeeComponent) => (
        <div className='flex gap-1 justify-center'>
          <TooltipComponent title='Cập nhật'>
            <ButtonComponent
              size='small'
              type='default'
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRow?.(record)
                setOpen?.(true)
                // console.log(record)
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
