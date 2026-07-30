import React from 'react'
import { ColumnType } from 'antd/es/table'
import { MoreOutlined } from '@components/icons'
import {
  DropDownComponent,
  TooltipComponent,
  TypographyText
} from '@components/index'
import { MenuProps } from 'antd'
import { ButtonComponent } from '@components/index'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { formatNumber } from '@utils/formatNumber'
import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'
import { useNavigate } from 'react-router-dom'
import { StatusKey } from '../types/WalletAccount.enum'
import StatusBadge from '@components/status-badge/StatusBadge'
import { WALLETADMINISTRATION } from '@constants/routersConstant'
import * as Icon from '@components/icons'
import { cn } from '@/lib/utils/cn'
import { statusEKYC } from '../constants/StatusEKYC.constant'

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
  navigate: ReturnType<typeof useNavigate>
}

export const getColumn = ({
  openModal,
  navigate
}: ColumnOptions): ColumnType<AcountItem>[] => {
  return [
    {
      title: '#',
      align: 'center',
      dataIndex: 'no'
    },
    {
      title: 'Khách hàng / Mã TK',
      align: 'left',
      width: 200,
      render: (_, record) => {
        const isSystem = record.ownerType === 'SYSTEM'
        const ownerName = isSystem
          ? 'Hệ thống'
          : (record.ownerUsername ?? '--')

        const renderStatusEKYC = (status: string|null) => {
          const statusInfo = statusEKYC.find((item) => item.value === status)
          if (!statusInfo) return null

          return (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold leading-none',
                statusInfo.color
              )}
              title={statusInfo.label}
            >
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          )
        }

        return (
          <div className='flex min-w-0 max-w-full flex-col gap-1'>
            <div className='flex min-w-0 items-center gap-1.5'>
              <TooltipComponent title={ownerName}>
                <span className='min-w-0 truncate text-md font-semibold text-foreground'>
                  {ownerName}
                </span>
              </TooltipComponent>

              {!isSystem &&
                record.verificationStatus &&
                renderStatusEKYC(record.verificationStatus)}
            </div>

            {record.ownerId && (
              <div className='min-w-0 max-w-full'>
                <TooltipComponent title={record.ownerId}>
                  <TypographyText
                    className='inline-flex max-w-full cursor-pointer items-center font-mono text-[11px]! text-muted-foreground!'
                    copyable={{ text: record.ownerId }}
                  >
                    <span className='truncate'>{record.ownerId}</span>
                  </TypographyText>
                </TooltipComponent>
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: 'Loại tài khoản / GL Code',
      align: 'left',
      width: 200,
      render(_, record) {
        const ownerType = record?.ownerType
        const glCode = record?.glCode
        return (
          <div className='flex flex-col gap-0.5'>
            <span className='font-medium text-gray-800 text-[12px]'>
              {ownerType ?? '--'}
            </span>
            <span className='text-gray-400 text-[10px]'>{glCode ?? ''}</span>
          </div>
        )
      }
    },
    // {
    //   title: 'Thông tin liên hệ',
    //   align: 'left',
    //   render: (_, record) => (
    //     <div>
    //       <div className='text-gray-500 flex items-center gap-1'>
    //         <EnvelopeIcon />
    //         {(record as any).email ?? '--'}
    //       </div>
    //       <div className='text-gray-500 flex items-center gap-1'>
    //         <PhoneIcon />
    //         {(record as any).phone ?? '--'}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: 'Số dư ví',
      align: 'right',
      render: (_, record) => (
        <div
          className={`font-medium ${record.balance > 0 ? 'text-green' : record.balance === 0 ? 'text-gray-500' : 'text-red'}`}
        >
          {formatNumber(record.balance)} {record.currency}
        </div>
      )
    },
    {
      title: 'Số dư khả dụng',
      align: 'right',
      render: (_, record) => (
        <div
          className={`font-medium ${record.availableBalance > 0 ? 'text-blue' : record.availableBalance === 0 ? 'text-gray-500' : 'text-red'}`}
        >
          {formatNumber(record.availableBalance)} {record.currency}
        </div>
      )
    },
    {
      title: 'Số tiền đóng băng',
      align: 'right',
      render: (_, record) => (
        <div
          className={`font-medium ${record.holdBalance > 0 ? 'text-red' : 'text-gray-500'}`}
        >
          {formatNumber(record.holdBalance)} {record.currency}
        </div>
      )
    },
    // {
    //   title: 'Giới tính / CCCD',
    //   align: 'center',
    //   render: (_, record) => (
    //     <div>
    //       <div className='text-gray-500'>{(record as any).gioiTinh ?? '--'}</div>
    //       <div className='text-gray-500'>{(record as any).cccd ?? '--'}</div>
    //     </div>
    //   ),
    // },
    {
      title: 'Trạng thái',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <div className='flex flex-wrap items-center justify-center gap-1'>
          {/* <StatusBadge status={record.status as StatusKey} /> */}
          <StatusBadge
            status={String(record.status)}
            config={{
              true: {
                label: (
                  <span className='flex items-center gap-1'>
                    <Icon.UnlockOutlined />
                    Hoạt động
                  </span>
                ),
                className: 'success-status'
              },
              false: {
                label: (
                  <span className='flex items-center gap-1'>
                    <Icon.LockFilled /> Đã khóa
                  </span>
                ),
                className: 'danger-status'
              }
            }}
          />
        </div>
      )
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => {
        const d = dayjs(value)
        return <>{d.isValid() ? d.format(TYPEDATE.fullTime) : '--'}</>
      }
    },
    {
      title: 'Thời gian xác thực',
      dataIndex: 'verifiedAt',
      align: 'center',
      render: (value) => {
        const d = dayjs(value)
        return <>{d.isValid() ? d.format(TYPEDATE.fullTime) : '--'}</>
      }
    },
    {
      title: 'Thao tác',
      align: 'center',
      width: 100,
      render: (_, record) => {
        const isLocked = record.status === StatusKey.LOCKED
        const isFrozen = record.status === StatusKey.FROZEN
        const isSystem = record.ownerType === 'SYSTEM'

        const items: MenuProps['items'] = [
          {
            key: '1',
            label: 'Xem chi tiết',
            onClick: () =>
              navigate(
                `${WALLETADMINISTRATION}/e-walletManagement/${record.id}`
              )
          },
          {
            key: '2',
            label: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
            onClick: () => {
              openModal?.(isLocked ? 'unlock' : 'lock', record)
            },
            disabled: isSystem || isFrozen
          },
          {
            key: '3',
            label: 'Đóng băng số dư',
            onClick: () => openModal?.('freeze', record),
            disabled: isSystem || (record.balance ?? 0) === 0
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
