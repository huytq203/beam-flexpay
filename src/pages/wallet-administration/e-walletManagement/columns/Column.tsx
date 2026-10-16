import React from 'react'
import { ColumnType } from 'antd/es/table'
import { MoreOutlined } from '@components/icons'
import {
  DropDownComponent,
  TooltipComponent,
  TypographyText
} from '@components/index'
import { ButtonComponent } from '@components/index'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { formatNumber } from '@utils/formatNumber'
import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'
import StatusBadge from '@components/status-badge/StatusBadge'
import type { ScreenActionId } from '@/app/permissions'
import {
  buildWalletRowActions,
  type WalletModalType
} from './wallet-row-actions'

interface ColumnOptions {
  openModal?: (type: WalletModalType, account: AcountItem) => void
  handleGetFreeze?: () => void
  onViewDetail: (account: AcountItem) => void
  can: (action: ScreenActionId<'EWALLET_MANAGEMENT'>) => boolean
}

const EKYC_STATUS_CONFIG = {
  VERIFIED: {
    label: 'Đã EKYC',
    className: 'success-status'
  },
  NOT_VERIFIED: {
    label: 'Chưa EKYC',
    className: 'normal-status'
  }
} as const

const LOGIN_STATE_CONFIG = {
  LOGIN_LOCKED: {
    label: 'Khóa đăng nhập',
    className: 'danger-status'
  },
  LOGIN_ALLOWED: {
    label: 'Đăng nhập được',
    className: 'success-status'
  },
  LOGIN_UNKNOWN: {
    label: 'Đăng nhập: ?',
    className: 'warning-status'
  }
} as const

/** Keycloak trả null khi không xác định được tình trạng khóa đăng nhập. */
const getLoginState = (
  loginLocked: boolean | null | undefined
): keyof typeof LOGIN_STATE_CONFIG => {
  if (loginLocked === true) return 'LOGIN_LOCKED'
  if (loginLocked === false) return 'LOGIN_ALLOWED'
  return 'LOGIN_UNKNOWN'
}

export const getColumn = ({
  openModal,
  onViewDetail,
  can
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
          : record.ownerFullName || record.ownerUsername || '--'

        return (
          <div className='flex min-w-0 max-w-full flex-col gap-1'>
            <div className='flex min-w-0 items-center gap-1.5'>
              <TooltipComponent title={ownerName}>
                <span className='min-w-0 truncate text-xs font-semibold text-foreground'>
                  {ownerName}
                </span>
              </TooltipComponent>

              {!isSystem && record.ownerFullName && (
                <span className='text-xs text-muted-foreground font-semibold'>
                  - {record.ownerUsername}
                </span>
              )}
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
    {
      title: 'Trạng thái',
      align: 'left',
      width: 150,
      render: (_, record) => {
        // Ví hệ thống không gắn tài khoản đăng nhập nào, nên không có trạng thái đăng nhập để hiện.
        const isSystem = record.ownerType === 'SYSTEM'
        const loginState = getLoginState(record.loginLocked)
        return (
          <div className='flex flex-col items-start gap-1.5'>
            <StatusBadge status={String(record.status)} />
            <StatusBadge
              status={record.ekycStatus ?? 'NOT_VERIFIED'}
              config={EKYC_STATUS_CONFIG}
            />
            {!isSystem && loginState !== 'LOGIN_ALLOWED' && (
              <StatusBadge
                status={loginState}
                config={LOGIN_STATE_CONFIG}
              />
            )}
          </div>
        )
      }
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
        const items = buildWalletRowActions(record, {
          can,
          onViewDetail,
          openModal
        })

        if (!items?.length) return null

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
