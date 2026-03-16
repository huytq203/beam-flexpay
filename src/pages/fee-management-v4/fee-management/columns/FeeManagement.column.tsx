import { ButtonComponent, TooltipComponent } from '@components/index'

import usePermissionChek from '@hooks/usePermissionCheck'
import { ColumnsType } from 'antd/es/table'
import { feeDomain, serviceType } from '@pages/fee-management-v3/constants/feePoliciesComponent'
import { feePolicies, statusType } from '@pages/fee-management-v3/constants/feePolicies'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
import { TYPEDATE } from '@constants/date.constant'
import { getEnumLabel } from '../utils/FeeManagement.utils'
import StatusBadge from '@components/status-badge/StatusBadge'
import { STATUS_CONFIG } from '../constants/FeeManagement.constant'
import * as Icons from '@components/icons'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'
interface Props{
  navigate: any
}

export const getColumnFeePolicy = ({navigate}: Props): ColumnsType<feePolicies> => [
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
      render: (date: string) => dayjs.utc(date).utcOffset(7).format(TYPEDATE.fullTime)
    },
    {
      title: 'Hiệu lực đến',
      dataIndex: 'validTo',
      render: (date: string) => {
        if (!date) {
          return 'Vô thời hạn'
        }
        else {
          return dayjs.utc(date).utcOffset(7).format(TYPEDATE.fullTime)
        }
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      align: 'center',
      render(value, record, index) {
          return <StatusBadge status={value} config={STATUS_CONFIG} />
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      align: 'center',
      render(value, record, index) {
          return (
           <div className='flex gap-2 justify-center'>
             <ButtonComponent
              type='default'
              size='small'
              icon={<Icons.EditOutlined />}
              onClick={()=>{
                navigate(PATHS.FEE_V4.EDIT_FEE_POLICY(record?.id||''))
              }}
            />
            <ButtonComponent
              type='default'
              size='small'
              icon={<Icons.LockOutlined />}
            />
           </div>
          )
      },
     
    }
  ]
