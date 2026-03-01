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
import { StatusKey } from '../types/WalletAccount.type'
import StatusBadge from '@components/status-badge/StatusBadge'

type ModalType = 'freeze' | 'unfreeze' | 'lock' | 'unlock' | null

interface SelectedAccount {
  id: string
  ownerId?: string
  ownerName?: string
  balance?: number
  holdBalance?: number
  currency?: string
}

interface ColumnOptions {
  openModal?: (type: ModalType, account: SelectedAccount) => void
  handleGetFreeze?: () => void
}

export const Column = ({ openModal, handleGetFreeze }: ColumnOptions = {}): ColumnType<AcountItem>[] => {
  const navigate = useNavigate()

  return [
    {
      title: '#',
      align: 'center',
      dataIndex: 'no',
    },
    {
      title: 'Khách hàng / Mã TK',
      align: 'left',
      render: (_, record) => (
        <div>
          <div className='font-medium max-w-[17rem] overflow-hidden text-ellipsis whitespace-nowrap'>
            {record.ownerUsername ?? '--'}
          </div>
          <div className='text-gray-500 text-sm max-w-[17rem] overflow-hidden text-ellipsis whitespace-nowrap'>
            TK: {record.glCode ?? '--'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thông tin liên hệ',
      align: 'left',
      render: (_, record) => (
        <div>
          <div className='text-gray-500 flex items-center gap-1'>
            <EnvelopeIcon />
            {(record as any).email ?? '--'}
          </div>
          <div className='text-gray-500 flex items-center gap-1'>
            <PhoneIcon />
            {(record as any).phone ?? '--'}
          </div>
        </div>
      ),
    },
    {
      title: 'Số dư ví',
      align: 'center',
      render: (_, record) => (
        <div className={`font-medium ${record.balance > 0 ? 'text-green' : record.balance === 0 ? 'text-gray-500' : 'text-red'}`}>
          {formatNumber(record.balance)} {record.currency}
        </div>
      ),
    },
    {
      title: 'Giới tính / CCCD',
      align: 'center',
      render: (_, record) => (
        <div>
          <div className='text-gray-500'>{(record as any).gioiTinh ?? '--'}</div>
          <div className='text-gray-500'>{(record as any).cccd ?? '--'}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      align: 'center',
      render: (_, record) => <StatusBadge status={record.status as StatusKey} />,
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => <>{dayjs(value).format(TYPEDATE.fullTime) ?? '--'}</>,
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const isLocked = record.status === StatusKey.LOCKED
        const isFrozen = record.status === StatusKey.FROZEN
        const isActive = record.status === StatusKey.ACTIVE
        const isSystem = record.ownerType === 'SYSTEM'

        const accountPayload: SelectedAccount = {
          id: record.id,
          ownerId: record.ownerId,
          ownerName: record.ownerUsername,
          balance: record.availableBalance,
          holdBalance: record.holdBalance,
          currency: record.currency,
        }

        const items: MenuProps['items'] = [
          {
            key: '1',
            label: 'Xem chi tiết',
            onClick: () => navigate(`/wallet-administration/e-walletManagement/${record.id}`),
          },
          {
            key: '2',
            label: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
            onClick: () => openModal?.(isLocked ? 'unlock' : 'lock', accountPayload),
            disabled: isSystem || isFrozen,
          },
          {
            key: '3',
            label: 'Đóng băng số dư',
            onClick: () => openModal?.('freeze', accountPayload),
            disabled: isSystem || (accountPayload.balance ?? 0) === 0,
          },
         
           {
            key: '5',
            label: 'Hủy ví',
            danger: true,
          },
        ]

        return (
          <DropDownComponent
            items={items}
            content={
              <ButtonComponent type='text' size='small' content={<MoreOutlined />} />
            }
          />
        )
      },
    },
  ]
}
