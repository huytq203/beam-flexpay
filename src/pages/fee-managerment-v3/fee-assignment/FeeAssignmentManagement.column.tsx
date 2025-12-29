import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined
} from '@components/icons/common'
import { ButtonComponent, TooltipComponent } from '@components/common'
import { FeeAssignment } from '@type/feeAssignment'
import { ColumnsType } from 'antd/es/table'
import Tippy from '@tippyjs/react'
import { useState } from 'react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import { useNavigate } from 'react-router-dom'
import { FEEMANAGEMENT_V3 } from '@constants/routersConstant'
import { formatDate, getEnumLabel } from '@pages/fee-managerment-v3/utils/FeeManagement.utils'
import { serviceType } from '@type/feePoliciesComponent'
import { statusType } from '@type/feePolicies'

interface prop {
  setSelectRowId: (value: string) => void
  setOpenModalDelete: (value: boolean) => void
  onApprove?: (record: FeeAssignment) => void
  onReject?: (record: FeeAssignment) => void
  onToggleStatus?: (record: FeeAssignment) => void
  navigate: (path: string) => void
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

export const feeAssignColumn = ({
  onToggleStatus,
  navigate,
}: prop): ColumnsType<FeeAssignment> => {
  return [
    {
      title: '#',
      align: 'center' as const,
      className: 'border border-b-0',
      width: 40,
      render: (value, record, index: number) => index + 1
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'serviceType',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (value, record, index: number) => getEnumLabel(value, serviceType)
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (value, record, index: number) => value
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bankCode',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (value, record, index: number) => value
    },
    {
      title: 'Loại thẻ',
      dataIndex: 'cardType',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (value, record, index: number) => value
    },
    {
      title: 'Nhóm khách hàng',
      dataIndex: 'customerGroup',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (value, record, index: number) => value
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (date: string) => formatDate(date)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (status: string) => <StatusBadge status={status} />
    },

    {
      title: 'Hành động',
      dataIndex: 'Action',
      fixed: 'right',
      width: 100,
      align: 'center' as const,
      className: 'border border-b-0 border-l-0',
      render: (value, record: FeeAssignment, index: number) => {
        return (
          <div className='flex gap-1 justify-center'>
            <TooltipComponent title={record.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}>
              <ButtonComponent
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
            <TooltipComponent title='Cập nhật'>
              <ButtonComponent
                type='default'
                icon={<EditOutlined />}
                onClick={() => {
                  navigate(FEEMANAGEMENT_V3 + `/fee-assignment/edit/${record?.id}`)
                }}
              />
            </TooltipComponent>
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
