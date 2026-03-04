import { ButtonComponent, TooltipComponent } from '@components/index'
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import { formatDate, getEnumLabel } from '@pages/fee-managerment-v3/utils/FeeManagement.utils'
import usePermissionCheck from '@hooks/usePermissionCheck'
import { FEEMANAGEMENT_V3 } from '@constants/routersConstant'
import { ColumnsType } from 'antd/es/table'
import { feeDomain, serviceType } from '@pages/fee-managerment-v3/constants/feePoliciesComponent'
import { statusType } from '@pages/fee-managerment-v3/constants/feePolicies'
import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'

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
    className={`px-2  rounded-md  whitespace-nowrap  text-xs font-medium ${status === 'ACTIVE'
      ? 'bg-green-50 border border-green-800 text-green-800'
      : `${status == 'INIT' ? 'bg-blue-50 border border-blue-400 text-blue-800' : 'bg-red-50 border border-red-800 text-red-800 '}`
      }`}
  >
    {getEnumLabel(status, statusType)}
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
}) => {
  const { hasAnyPermission } = usePermissionCheck()
  const canUpdate = hasAnyPermission(['FEE:UPDATE', 'FEE:FULL', 'ADMIN:FULL'])
  const canDelete = hasAnyPermission(['FEE:DELETE', 'FEE:FULL', 'ADMIN:FULL']) // Assuming lock/unlock could also be delete or update, we use canUpdate for lock/unlock below according to standard flow

  return (
    <div className='flex gap-2 justify-center'>
      {canUpdate && (
        <TooltipComponent title='Cập nhật'>
          <ButtonComponent
            type='default'
            size='small'
            icon={<EditOutlined />}
            onClick={() => navigate(`${FEEMANAGEMENT_V3}/fee-management/edit/${record.key}`)}
          />
        </TooltipComponent>
      )}

      {canUpdate && (
        <TooltipComponent title={record.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}>
          <ButtonComponent
            type='default'
            size='small'
            icon={
              record.status === 'ACTIVE' ? (
                <UnlockOutlined />
              ) : (
                <LockOutlined />
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
        </TooltipComponent>
      )}
    </div>
  )
}

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
    },
    {
      title: 'Tên chính sách',
      dataIndex: 'name',
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <TooltipComponent title={text}>
          <span style={{ display: 'inline-block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'bottom' }}>
            {text}
          </span>
        </TooltipComponent>
      ),
    },
    {
      title: 'Loại dịch vụ',
      dataIndex: 'serviceType',
      render: (value: string) => getEnumLabel(value, serviceType)
    },

    {
      title: 'Phí miền',
      dataIndex: 'feeDomain',
      render: (value: string) => getEnumLabel(value, feeDomain)
    },
    {
      title: 'Đơn vị',
      dataIndex: 'currency',
    },
    {
      title: 'Hiệu lực từ',
      dataIndex: 'validFrom',
      render: (date: string) => dayjs(date).format(TYPEDATE.fullTime)
    },
    {
      title: 'Hiệu lực đến',
      dataIndex: 'validTo',
      render: (date: string) => {
        if (date === null || '' || 0) {
          return 'Vô thời hạn'
        }
        else {
          return dayjs(date).format(TYPEDATE.fullTime)
        }
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render: (status: string) => <StatusBadge status={status} />
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
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
