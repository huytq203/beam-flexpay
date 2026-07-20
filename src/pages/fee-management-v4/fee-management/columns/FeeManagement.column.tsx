import { ButtonComponent, TooltipComponent } from '@components/index'

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
import { PATHS } from '@constants/pathConstant'
import { ColumnsType } from 'antd/es/table'
interface Props {
  navigate: NavigateFunction
  handleActive: (id: string) => void
  handleInactive: (id: string) => void
  isLoadingPatchActivateFee: boolean
  isLoadingPatchDeactivateFee: boolean
  loadingId: string | null
}


export const getColumnFeePolicy = ({ navigate, handleActive, handleInactive, loadingId }: Props): ColumnsType => [
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
    width: 100,
    fixed: 'right',
    align: 'center',
    render(value, record) {
      const isActive = record?.status === statusType.ACTIVE
      const isLocked = record?.status === statusType.LOCKED
      return (
        <div className='flex gap-2 justify-center'>
          <TooltipComponent title='Sửa chính sách'>
            <ButtonComponent
              type='default'
              size='small'
              icon={<Icons.EditOutlined />}
              onClick={() => {
                navigate(PATHS.FEE_V4.EDIT_FEE_POLICY(record?.id || ''))
              }}
            />
          </TooltipComponent>
          <TooltipComponent title={isActive ? 'Hủy kích hoạt' : 'Kích hoạt'}>
            <ButtonComponent
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
        </div>
      )
    },

  }
]
