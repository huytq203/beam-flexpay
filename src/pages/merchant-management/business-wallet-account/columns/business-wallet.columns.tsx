import type { ColumnType } from 'antd/es/table'

import { Can } from '@/app/permissions'
import { formatUTCToLocalDateTime } from '@/app/utils/helper-functions/date'
import { EditOutlined, SendOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import StatusBadge from '@components/status-badge/StatusBadge'
import {
  BANK_LINK_STATUS_CONFIG,
  BUSINESS_TYPE_CONFIG,
  VERIFICATION_STATUS_CONFIG
} from '../constants/businessWallet.constants'
import { KybReviewAction } from '../components/KybReviewAction'
import type { BusinessWalletRow } from '../types/business-wallet.type'

export const createBusinessWalletColumns = ({
  onEdit,
  onApprove,
  onReject,
  onSubmit
}: {
  onEdit: (row: BusinessWalletRow) => void
  onApprove: (row: BusinessWalletRow) => void
  onReject: (row: BusinessWalletRow) => void
  onSubmit: (row: BusinessWalletRow) => void
}): ColumnType<BusinessWalletRow>[] => [
  { title: '#', dataIndex: 'no', align: 'center', width: 56 },
  {
    title: 'Doanh nghiệp',
    width: 250,
    render: (_, row) => (
      <div className='flex flex-col'>
        <strong>{row.legalName || '--'}</strong>
        <span className='text-xs text-muted-foreground'>
          {row.registeredEmail}
        </span>
      </div>
    )
  },
  {
    title: 'Mã số thuế',
    dataIndex: 'taxCode',
    width: 140,
    render: (value?: string) => value || '--'
  },
  {
    title: 'Loại hình',
    dataIndex: 'businessType',
    width: 150,
    render: (value?: BusinessWalletRow['businessType']) =>
      value ? (
        <StatusBadge
          status={value}
          config={BUSINESS_TYPE_CONFIG}
        />
      ) : (
        '--'
      )
  },
  {
    title: 'Xác minh',
    dataIndex: 'verificationStatus',
    width: 140,
    render: (value: BusinessWalletRow['verificationStatus']) => (
      <StatusBadge
        status={value}
        config={VERIFICATION_STATUS_CONFIG}
      />
    )
  },
  {
    title: 'Liên kết ngân hàng',
    dataIndex: 'bankLinkStatus',
    width: 160,
    render: (value?: BusinessWalletRow['bankLinkStatus']) => (
      <StatusBadge
        status={value ?? 'BANK_UNLINKED'}
        config={BANK_LINK_STATUS_CONFIG}
      />
    )
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    width: 165,
    render: (value?: string) => (value ? formatUTCToLocalDateTime(value) : '--')
  },
  {
    title: 'Thao tác',
    align: 'center',
    width: 100,
    render: (_, row) => (
      <div className='flex items-center justify-center gap-2'>
        <Can
          screen='BUSINESS_WALLET_ACCOUNT'
          action='edit'
        >
          <TooltipComponent title='Sửa hồ sơ'>
            <ButtonComponent
              htmlType='button'
              type='default'
              size='small'
              aria-label='Sửa hồ sơ ví doanh nghiệp'
              icon={<EditOutlined aria-hidden />}
              onClick={() => onEdit(row)}
            />
          </TooltipComponent>
        </Can>
        {(row.verificationStatus === 'DRAFT' ||
          row.verificationStatus === 'REJECTED') && (
          <Can
            screen='BUSINESS_WALLET_ACCOUNT'
            action='edit'
          >
            <TooltipComponent title='Gửi duyệt KYB'>
              <ButtonComponent
                htmlType='button'
                type='default'
                size='small'
                icon={<SendOutlined aria-hidden />}
                aria-label={`Gửi duyệt ví ${row.legalName || row.registeredEmail}`}
                onClick={() => onSubmit(row)}
              />
            </TooltipComponent>
          </Can>
        )}
        {row.verificationStatus === 'PENDING_APPROVAL' && (
          <Can
            screen='BUSINESS_WALLET_ACCOUNT'
            action='approve'
          >
            <KybReviewAction
              row={row}
              onApprove={onApprove}
              onReject={onReject}
            />
          </Can>
        )}
      </div>
    )
  }
]
