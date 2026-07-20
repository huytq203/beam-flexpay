import {
  EditOutlined,
  LockOutlined,
  UnlockOutlined
} from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { FeeAssignment, paymentMethodType } from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { ColumnsType } from 'antd/es/table'
import { getEnumLabel } from '@pages/fee-management-v4/fee-assignment/utils/FeeManagement.utils'
import { serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import StatusBadge from '@components/status-badge/StatusBadge'
import { STATUS_CONFIG } from '../constants/FeeAssignment.constant'
import { TYPEDATE } from '@constants/date.constant'
import dayjs from 'dayjs'
import { PATHS } from '@constants/pathConstant'


interface prop {
  setSelectRowId: (value: string) => void
  setOpenModalDelete: (value: boolean) => void
  onApprove?: (record: FeeAssignment) => void
  onReject?: (record: FeeAssignment) => void
  onToggleStatus?: (record: FeeAssignment) => void
  navigate: (path: string) => void
  canUpdate?: boolean
}
export const getFeeAssignColumn = ({
  onToggleStatus,
  navigate,
  canUpdate = false,
}: prop): ColumnsType<FeeAssignment> => {

  return [
    {
      title: '#',
      align: 'center' as const,
      dataIndex: 'no',
      width: 40,
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'serviceType',
      align: 'center' as const,

      render: (value) => getEnumLabel(value, serviceType)
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      align: 'center' as const,

      render: (value) =>
        (paymentMethodType[value as keyof typeof paymentMethodType] || '--')
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bankCode',
      align: 'center' as const,

      render: (value) => value || '--'
    },
    {
      title: 'Loại thẻ',
      dataIndex: 'cardType',
      align: 'center' as const,

      render: (value) => value || '--'
    },
    {
      title: 'Tài khoản/Nhóm khách hàng',
      dataIndex: 'customerGroup',
      align: 'center' as const,

      render: (value) => value || '--'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      align: 'center' as const,

      render: (date: string) => dayjs.utc(date).format(TYPEDATE.fullTime)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center' as const,

      render: (status: string) => <StatusBadge status={status} config={STATUS_CONFIG} />
    },

    {
      title: 'Hành động',
      dataIndex: 'Action',
      fixed: 'right',
      width: 100,
      align: 'center' as const,

      render: (value, record: FeeAssignment) => {
        return (
          <div className='flex gap-1 justify-center'>
            {canUpdate && (
              <TooltipComponent title='Cập nhật'>
                <ButtonComponent
                  size='small'
                  type='default'
                  icon={<EditOutlined />}
                  onClick={() => {
                   navigate(PATHS.FEE_V4.EDIT_FEE_ASSIGNMENT(record.id))
                  }}
                />
              </TooltipComponent>
            )}
            {canUpdate && (
              <TooltipComponent title={record.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}>
                <ButtonComponent
                  size='small'
                  type='default'
                  icon={
                    record.status === 'ACTIVE' ? (
                      <UnlockOutlined />
                    ) : (
                      <LockOutlined />
                    )
                  }
                  onClick={() => onToggleStatus?.(record)}
                />
              </TooltipComponent>
            )}
          </div>
        )
      }
    }
  ]
}
