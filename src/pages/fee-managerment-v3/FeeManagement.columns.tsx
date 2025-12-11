import { ButtonComponent } from '@components/common'
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import { getFeeDomainLabel, getServiceTypeLabel } from './FeeManagement.utils'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'

export const getPolicyColumns = ({
  navigate,
  handleDeActiveFee,
  handleActiveFee
}: {
  navigate: any
  handleDeActiveFee: (record: any) => void
  handleActiveFee: (record: any) => void
}) => [
  {
    title: 'STT',
    dataIndex: 'no',
    width: 60,
    align: 'center' as const,
    className: 'border'
  },
  {
    title: 'Tên chính sách',
    dataIndex: 'name',
    className: 'border border-l-0'
  },
  {
    title: 'Loại dịch vụ',
    dataIndex: 'serviceType',
    className: 'border border-l-0',
    render: (value: any) => getServiceTypeLabel(value)
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    className: 'border border-l-0',
    align: 'center' as const,
    render: (status: string) => (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${status === 'ACTIVE'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
          }`}
      >
        {status}
      </span>
    )
  },
  {
    title: 'Phí miền',
    dataIndex: 'feeDomain',
    className: 'border border-l-0 border-b-0',
    render: (value: any) => getFeeDomainLabel(value)
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
    render: (date: string) =>
      date ? new Date(date).toLocaleDateString('vi-VN') : ''
  },
  {
    title: 'Hiệu lực đến',
    dataIndex: 'validTo',
    className: 'border border-l-0 border-b-0 ',
    render: (date: string) =>
      date ? new Date(date).toLocaleDateString('vi-VN') : ''
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 100,
    className: 'border border-l-0 border-b-0',
    align: 'center' as const,
    render: (record: any) => (
      <div className='flex gap-2 justify-center'>
        <ButtonComponent
          type='default'
          icon={<EditOutlined />}
          onClick={() => navigate(`${FEEMANAGEMENR_V3}/edit/${record.key}`)}
        />
        <ButtonComponent
          type='default'
          icon={
            record.status === 'ACTIVE' ? <UnlockOutlined /> : <LockOutlined />
          }
          onClick={() => {
            if (record.status === 'ACTIVE') {
              handleDeActiveFee(record)
            } else {
              handleActiveFee(record)
            }
          }}
        />
      </div>
    )
  }
]

export const getFeeComponentColumns = ({
  setSelectedRow,
  setOpen,
  setUpdateComponentId,
  setDeletingId,
  setOpenDialog
}: {
  setSelectedRow: (record: any) => void
  setOpen: (open: boolean) => void
  setUpdateComponentId: (id: string) => void
  setDeletingId: (id: string) => void
  setOpenDialog: (open: boolean) => void
}) => [
  {
    title: '#',
    dataIndex: 'no',
    width: 60,
    align: 'center' as const,
    className: 'border border-b-0'
  },
  {
    title: 'Loại (Type)',
    dataIndex: 'componentType',
    key: 'componentType',
    className: ' border border-l-0'
  },
  {
    title: 'Cách tính',
    dataIndex: 'calculationMethod',
    key: 'calculationMethod',
    className: ' border border-l-0 border-b-0'
  },
  {
    title: 'Công thức',
    dataIndex: 'fixedAmount',
    key: 'fixedAmount',
    className: ' border border-l-0 border-b-0'
  },
  {
    title: 'Người trả',
    dataIndex: 'payerType',
    key: 'payerType',
    className: ' border border-l-0 border-b-0'
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 50,
    className: 'border border-l-0 border-b-0',
    align: 'center' as const,
    render: (record: any) => (
      <div className='flex gap-1 justify-center'>
        <ButtonComponent
          type='text'
          icon={<EditOutlined />}
          onClick={() => {
            setSelectedRow(record)
            setOpen(true)
            setUpdateComponentId(record.id)
          }}
        />
        <ButtonComponent
          type='text'
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            setDeletingId(record.id)
            setOpenDialog(true)
          }}
        />
      </div>
    )
  }
]

