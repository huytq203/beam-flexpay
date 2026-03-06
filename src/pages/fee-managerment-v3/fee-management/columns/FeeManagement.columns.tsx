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


const CLASS_STATUS: Record<string, string> = {
  ACTIVE: 'bg-green-50 border border-green-500 text-green-500',
  INIT: 'bg-blue-50 border border-blue-500 text-blue-500',
  INACTIVE: 'bg-red-50 border border-red-500 text-red-500'
}

// Status badge component

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2  rounded-md  whitespace-nowrap  text-[12px] font-medium ${CLASS_STATUS[status]}`}
  >
    {getEnumLabel(status, statusType)}
  </span>
)

// const StatusBadge = ({ status }: { status: string }) => {
//   let textColor = 'text-red-600'
//   let dotColor = 'bg-gradient-to-br from-red-400 via-red-500 to-red-600 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),_inset_1px_1px_2px_rgba(255,255,255,0.4)] shadow-red-500/40'

//   if (status === 'ACTIVE') {
//     textColor = 'text-green-600'
//     dotColor = 'bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),_inset_1px_1px_2px_rgba(255,255,255,0.4)] shadow-green-500/40'
//   } else if (status === 'INIT') {
//     textColor = 'text-blue-600'
//     dotColor = 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-[inset_-1px_-1px_2px_rgba(0,0,0,0.2),_inset_1px_1px_2px_rgba(255,255,255,0.4)] shadow-blue-500/40'
//   }

// return (
//   <div className={`flex items-center justify-start gap-1.5 whitespace-nowrap text-[13px] font-medium ${textColor}`}>
//     <span className={`w-3 h-3 rounded-full ${dotColor}`}></span>
//     <span>{getEnumLabel(status, statusType)}</span>
//   </div>
// )
// }

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
