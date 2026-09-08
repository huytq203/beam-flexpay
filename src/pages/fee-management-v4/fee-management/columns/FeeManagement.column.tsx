import { ButtonComponent, FeeDirectionBadge, TooltipComponent } from '@components/index'

import { feeDomain, serviceType } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
import { TYPEDATE } from '@constants/date.constant'
import { getEnumLabel } from '../utils/FeeManagement.utils'
import StatusBadge from '@components/status-badge/StatusBadge'
import { STATUS_CONFIG, statusType } from '../constants/FeeManagement.constant'
import * as Icons from '@components/icons'
import { NavigateFunction } from 'react-router-dom'
import { ColumnsType } from 'antd/es/table'
import FeePolicyApprovalAction from '../components/FeePolicyApprovalAction'
import type { FeePolicy } from '../types/FeeManagement.type'
import { Can } from '@/app/permissions'
import type { FeePolicyScreenId } from '../constants/feePolicyScope'
interface Props {
  navigate: NavigateFunction
  /** Màn đang hiển thị bảng — quyết định quyền và đường dẫn sửa. */
  screen: FeePolicyScreenId
  editPath: (id: string) => string
  handleActive: (id: string) => void
  handleInactive: (id: string) => void
  isLoadingPatchActivateFee: boolean
  isLoadingPatchDeactivateFee: boolean
  loadingId: string | null
}


export const getColumnFeePolicy = ({
  navigate,
  screen,
  editPath,
  handleActive,
  handleInactive,
  loadingId
}: Props): ColumnsType<FeePolicy> => [
  {
    title: '#',
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
    title: 'Chiều tiền / Loại dịch vụ',
    dataIndex: 'serviceType',
    width: 190,
    render: (value: string) => (
      <FeeDirectionBadge
        serviceType={value}
        caption={getEnumLabel(value, serviceType)}
      />
    )
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
      if (!date) {
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
    render(value) {
      return <StatusBadge status={value} config={STATUS_CONFIG} />
    },
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 132,
    fixed: 'right',
    align: 'center',
    render(value, record) {
      const isActive = record?.status === statusType.ACTIVE
      const isLocked = record?.status === statusType.LOCKED
      return (
        <div className='flex gap-2 justify-center'>
          <Can screen={screen} action='edit'>
            <TooltipComponent title='Sửa chính sách'>
              <ButtonComponent
                aria-label='Sửa chính sách'
                type='default'
                size='small'
                icon={<Icons.EditOutlined />}
                onClick={() => {
                  navigate(editPath(record?.id || ''))
                }}
              />
            </TooltipComponent>
          </Can>
          <Can screen={screen} action='approve'>
            <FeePolicyApprovalAction policy={record} />
          </Can>
          <Can screen={screen} action='toggleActive'>
            <TooltipComponent title={isActive ? 'Hủy kích hoạt' : 'Kích hoạt'}>
              <ButtonComponent
                aria-label={isActive ? 'Hủy kích hoạt' : 'Kích hoạt'}
                disabled={isLocked}
                type="default"
                size="small"
                icon={isActive ? <Icons.UnlockOutlined /> : <Icons.LockOutlined />}
                loading={loadingId === record.id}
                onClick={() =>
                  isActive
                    ? handleInactive(record?.id || '')
                    : handleActive(record?.id || '')
                }
              />
            </TooltipComponent>
          </Can>
        </div>
      )
    },

  }
]
