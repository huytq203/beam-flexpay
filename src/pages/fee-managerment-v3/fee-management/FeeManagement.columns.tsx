import { ButtonComponent } from '@components/common'
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import {  formatDate, getEnumLabel } from '@pages/fee-managerment-v3/FeeManagement.utils'
import { FEEMANAGEMENR_V3 } from '@constants/routersConstant'
import { ColumnsType } from 'antd/es/table'
import { feeDomain, serviceType } from '@type/feePoliciesComponent'

// Types
interface PolicyRecord {
  key: string
  no: number
  name: string
  serviceType: string
  status: string
  feeDomain: string
  currency: string
  validFrom: string
  validTo: string
}

interface PolicyColumnsOptions {
  navigate: (path: string) => void
  handleDeActiveFee: (record: PolicyRecord) => void
  handleActiveFee: (record: PolicyRecord) => void
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2 py-1 rounded text-xs font-medium ${status === 'ACTIVE'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
      }`}
  >
    {status}
  </span>
)

// Action buttons component
const ActionButtons = ({
  record,
  navigate,
  handleDeActiveFee,
  handleActiveFee
}: {
  record: PolicyRecord
  navigate: (path: string) => void
  handleDeActiveFee: (record: PolicyRecord) => void
  handleActiveFee: (record: PolicyRecord) => void
}) => (
  <div className='flex gap-2 justify-center'>
    <ButtonComponent
      type='default'
      icon={<EditOutlined {...({} as any)} />}
      onClick={() => navigate(`${FEEMANAGEMENR_V3}/edit/${record.key}`)}
    />
    <ButtonComponent
      type='default'
      icon={
        record.status === 'ACTIVE' ? (
          <UnlockOutlined {...({} as any)} />
        ) : (
          <LockOutlined {...({} as any)} />
        )
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

export const getPolicyColumns = ({
  navigate,
  handleDeActiveFee,
  handleActiveFee
}: PolicyColumnsOptions): ColumnsType<PolicyRecord> => [
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
      className: 'border border-l-0  border-b-0'
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'serviceType',
      className: 'border border-l-0  border-b-0',
      render: (value: string) =>  getEnumLabel(value,serviceType)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status', 
      className: 'border border-l-0  border-b-0',
      align: 'center',
      render: (status: string) => <StatusBadge status={status} />
    },
    {
      title: 'Phí miền',
      dataIndex: 'feeDomain',
      className: 'border border-l-0 border-b-0',
      render: (value: string) =>  getEnumLabel(value,feeDomain)
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
      render: (date: string) => formatDate(date)
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
          navigate={navigate}
          handleDeActiveFee={handleDeActiveFee}
          handleActiveFee={handleActiveFee}
        />
      )
    }
  ]
