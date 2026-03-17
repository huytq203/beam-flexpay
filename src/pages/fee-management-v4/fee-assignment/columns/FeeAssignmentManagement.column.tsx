import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined
} from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { FeeAssignment, paymentMethodType } from '@pages/fee-management-v4/fee-assignment/constants/feeAssignment'
import { ColumnsType } from 'antd/es/table'
import Tippy from '@tippyjs/react'
import { useState } from 'react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import { FEEMANAGEMENT_V3, FEEMANAGEMENT_V4 } from '@constants/routersConstant'
import { formatDate, getEnumLabel } from '@pages/fee-management-v4/fee-assignment/utils/FeeManagement.utils'
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
// Approval Popup Content Component
const ApprovalPopupContent = ({
  record,
  onApprove,
  onReject,
  onCancel
}: {
  record: FeeAssignment
  onApprove?: (record: FeeAssignment) => void
  onReject?: (record: FeeAssignment) => void
  onCancel: () => void
}) => (
  <div className='p-3'>
    <h3 className='text-base font-semibold mb-2'>Duyệt phí</h3>
    <p className='text-sm text-gray-600 mb-4'>
      Bạn muốn thực hiện hành động gì với cấu hình phí này?
    </p>
    <div className='flex gap-2 justify-end'>
      <ButtonComponent
        type='default'
        content='Hủy bỏ'
        icon={<CloseOutlined />}
        onClick={onCancel}
      />
      <ButtonComponent
        danger
        type='primary'
        content='Từ chối duyệt'
        icon={<CloseOutlined />}
        onClick={() => {
          onReject?.(record)
          onCancel()
        }}
      />
      <ButtonComponent
        type='primary'
        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
        content='Duyệt phí'
        icon={<CheckOutlined />}
        onClick={() => {
          onApprove?.(record)
          onCancel()
        }}
      />
    </div>
  </div>
)

// Approval Button with controlled Tippy
const ApprovalButton = ({
  record,
  onApprove,
  onReject
}: {
  record: FeeAssignment
  onApprove?: (record: FeeAssignment) => void
  onReject?: (record: FeeAssignment) => void
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <Tippy
      content={
        <ApprovalPopupContent
          record={record}
          onApprove={onApprove}
          onReject={onReject}
          onCancel={() => setVisible(false)}
        />
      }
      visible={visible}
      onClickOutside={() => setVisible(false)}
      interactive={true}
      placement='left'
      theme='light'
      arrow={true}
      appendTo={() => document.body}
      maxWidth='none'
    >
      <span>
        <ButtonComponent
          type='default'
          icon={
            <CheckOutlined
              style={{ color: 'green' }}
              {...({} as any)}
            />
          }
          onClick={() => setVisible(true)}
        />
      </span>
    </Tippy>
  )
}

function handleAccept(record: FeeAssignment) {
  alert('Approve ID:' + record.id)
}

function handleReject(record: FeeAssignment) {
  alert('Reject ID:' + record.id)
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

      render: (value, record, index: number) => getEnumLabel(value, serviceType)
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      align: 'center' as const,

      render: (value, record, index: number) =>
        (paymentMethodType[value as keyof typeof paymentMethodType] || '--')
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bankCode',
      align: 'center' as const,

      render: (value, record, index: number) => value || '--'
    },
    {
      title: 'Loại thẻ',
      dataIndex: 'cardType',
      align: 'center' as const,

      render: (value, record, index: number) => value || '--'
    },
    {
      title: 'Nhóm khách hàng',
      dataIndex: 'customerGroup',
      align: 'center' as const,

      render: (value, record, index: number) => value || '--'
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

      render: (value, record: FeeAssignment, index: number) => {
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

            {/* <ApprovalButton
              record={record}
              onApprove={handleAccept}
              onReject={handleReject}
            /> */}
          </div>
        )
      }
    }
  ]
}
