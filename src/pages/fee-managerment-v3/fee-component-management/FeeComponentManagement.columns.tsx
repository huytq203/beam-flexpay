import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { ButtonComponent, TooltipComponent } from '@components/common'
import { Tooltip } from 'antd'
import {
  getEnumLabel
} from '../FeeManagement.utils'
import { beneficiaryType, calculationMethodEnum, componentType, feePolicyComponent, payerType } from '@type/feePoliciesComponent'
import { ColumnsType } from 'antd/es/table'

interface FeeComponentColumnsProps {
  setSelectedRow: (row: feePolicyComponent) => void
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
}: FeeComponentColumnsProps): ColumnsType<feePolicyComponent> => {
  return [
    {
      title: '#',
      dataIndex: 'no',
      width: 60,
      align: 'center' as const,
      className: 'border border-b-0',
      render: (_: any, __: any, index: number) => index + 1 // Assuming 'no' might not be in the data record itself or we can just use index
    },
    {
      title: 'Loại (Type)',
      dataIndex: 'componentType',
      key: 'componentType',
      className: ' border border-l-0',
      render: (value: string ) =>  getEnumLabel(value,componentType)
    },
    {
      title: 'Cách tính',
      dataIndex: 'calculationMethod',
      key: 'calculationMethod',
      className: ' border border-l-0 border-b-0',
      render: (value: string ) =>
         getEnumLabel(value,calculationMethodEnum)
    },
    {
      title: 'Người trả',
      dataIndex: 'payerType',
      key: 'payerType',
      className: ' border border-l-0 border-b-0',
      render(value:string) {
          return getEnumLabel(value,payerType)
      },
    },
    {
      title: 'Người hưởng',
      dataIndex: 'beneficiaryType',
      key: 'beneficiaryType',
      className: ' border border-l-0 border-b-0',
      render: (value: string) => getEnumLabel(value,beneficiaryType)
    },

    {
      title: 'Thao tác',
      key: 'action',
      width: 50,
      className: 'border border-l-0 border-b-0',
      align: 'center' as const,
      render: (_: any, record: feePolicyComponent) => (
        <div className='flex gap-1 justify-center'>
          <TooltipComponent title='Cập nhật'>
            <ButtonComponent
              type='default'
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedRow(record)
                setOpen(true)
                setUpdateComponentId(record.id)
              }}
            />
          </TooltipComponent>
          <TooltipComponent title='Xóa'>
            <ButtonComponent
              danger
              type='default'
              icon={<DeleteOutlined/>}
              onClick={() => {
                setDeletingId(record.id)
                setOpenDialog(true)
              }}
            />
          </TooltipComponent>
        </div>
      )
    }
  ]
}
