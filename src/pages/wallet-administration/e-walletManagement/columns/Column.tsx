import React from 'react'
import { ColumnType } from 'antd/lib/table'
import { EnvelopeIcon, MoreOutlined, PhoneIcon } from '@components/icons'
import { DropDownComponent } from '@components/index'
import { MenuProps } from 'antd/lib'
import { ButtonComponent } from '@components/index'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { formatNumber } from '@utils/formatNumber'
import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'
import { useNavigate } from 'react-router-dom'
import { StatusLabel, StatusKey } from '../constants/Ewallet.constant'



const status = (record: AcountItem) => {
  return (
    <div className='inline-flex gap-1'>
      {StatusKey.ACTIVE ? (
        <span className='inline-flex px-2 text-xs  rounded-md success-status'>
          {StatusLabel[record.status as StatusKey]}
        </span>
      ) :

        <span className='inline-flex px-2 text-xs  rounded-md danger-status'>
          {StatusLabel[record.status as StatusKey]}
        </span>

      }

      {/* {!record.kycStatus && (
        <span className='inline-flex px-2 text-xs rounded-md warning-status'>
          Chưa KYC
        </span>
      )}

      {record.kycStatus && (
        <span className='inline-flex px-2 text-xs rounded-md bg-green-50 text-green-800 border border-green-800'>
          Đã KYC
        </span>
      )}

      {record.ungLuong && (
        <span className='inline-flex px-2 text-xs rounded-md bg-blue-50 text-blue-800 border border-blue-800'>
          Ứng lương: {record?.ungLuong ? 'bật' : 'tắt'}
        </span>
      )}

      {!record?.ungLuong ? (
        <span className='inline-flex px-2 text-xs rounded-md bg-gray-50 text-gray-800 border border-gray-800'>
          Ứng lương: {record?.ungLuong ? 'bật' : 'tắt'}
        </span>
      ) : null} */}
    </div>
  )
}



export const Column = (): ColumnType<AcountItem>[] => {
  const navigate = useNavigate()
  return [
  {
    title: '#',
    align: 'center',
    dataIndex: 'no'
  },
  {
    title: 'Khách hàng / Mã TK',
    align: 'left',
    render: (_, record) => (
      <div>
        <div className='font-medium max-w-[17rem] overflow-hidden text-ellipsis whitespace-nowrap align-bottom'>{record.ownerType ?? '--'}</div>
        <div className='text-gray-500 text-sm max-w-[17rem] overflow-hidden text-ellipsis whitespace-nowrap align-bottom'>TK: {record.accout ?? '--'}</div>
      </div>
    )
  },
  {
    title: 'Thông tin liên hệ',

    align: 'left',
    render: (_, record) => (
      <div>
        <div className='text-gray-500 flex items-center gap-1'>
          <EnvelopeIcon />
          {record.email ?? '--'}
        </div>
        <div className='text-gray-500 flex items-center gap-1 '>
          <PhoneIcon />
          {record.phone ?? '--'}
        </div>
      </div>
    )
  },
  {
    title: 'Số dư ví',
    dataIndex: 'availableBalance',
    align: 'center',
    render(value, record, index) {
      return (
        <div className={` font-medium ${record.availableBalance > 0 ? 'text-green ' : record.availableBalance == 0 ? 'text-gray-500' : 'text-red'}`}>
          {formatNumber(record.availableBalance)} {record.currency}
        </div>
      )
    },

  },
  {
    title: 'Giới tính / CCCD',

    align: 'center',
    render: (_, record) => (
      <div>
        <div className='text-gray-500'>{record.gioiTinh ?? '--'}</div>
        <div className='text-gray-500 '>{record.cccd ?? '--'}</div>
      </div>
    )
  },
  {
    title: 'Trạng thái',
    align: 'center',
    render: (value, record, index) => <div >{status(record) ?? record.status}</div>
  },
  {
    title: 'Thời gian tạo',
    dataIndex: 'createdAt',
    align: 'center',
    render(value, record, index) {
      return (
        <>{dayjs(value).format(TYPEDATE.fullTime) ?? '--'}</>
      )
    },
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 100,
    render(value, record, index) {
      const items: MenuProps['items'] = [
        {
          key: '1',
          label: 'Xem chi tiết',
          onClick: () => navigate(`/wallet-administration/e-walletManagement/${record.id}`)
        },
        {
          key: '2',
          label: 'Khóa tài khoản'
        },
        {
          key: '3',
          label: 'Đóng băng số dư'
        },
        {
          key: '4',
          label: 'Đóng băng số dư'
        },
        {
          key: '5',
          label: 'Hủy ví',
          danger: true
        }
      ]
      return (
        <DropDownComponent
          items={items}
          content={
            <ButtonComponent
              type='text'
              size='small'
              content={<MoreOutlined />}
            />
          }
        />
      )
    }
  }
]
}
