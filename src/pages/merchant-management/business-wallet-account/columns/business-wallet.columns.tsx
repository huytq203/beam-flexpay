import type { ColumnType } from 'antd/es/table'

import { Can } from '@/app/permissions'
import { formatUTCToLocalDateTime } from '@/app/utils/helper-functions/date'
import { CheckCircleOutlined, EditOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import type { BusinessWalletRow } from '../types/business-wallet.type'

const statusLabels: Record<BusinessWalletRow['verificationStatus'], string> = {
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Từ chối'
}

export const createBusinessWalletColumns = ({ onEdit, onApprove }: { onEdit: (row: BusinessWalletRow) => void; onApprove: (row: BusinessWalletRow) => void }): ColumnType<BusinessWalletRow>[] => [
  { title: '#', dataIndex: 'no', align: 'center', width: 56 },
  {
    title: 'Doanh nghiệp', width: 250,
    render: (_, row) => <div className='flex flex-col'><strong>{row.legalName || '--'}</strong><span className='text-xs text-muted-foreground'>{row.registeredEmail}</span></div>
  },
  { title: 'Mã số thuế', dataIndex: 'taxCode', width: 140, render: (value?: string) => value || '--' },
  { title: 'Loại hình', dataIndex: 'businessType', width: 150, render: (value?: string) => value === 'ENTERPRISE' ? 'Doanh nghiệp' : value === 'HOUSEHOLD' ? 'Hộ kinh doanh' : '--' },
  { title: 'Xác minh', dataIndex: 'verificationStatus', width: 140, render: (value: BusinessWalletRow['verificationStatus']) => statusLabels[value] },
  { title: 'Liên kết ngân hàng', dataIndex: 'bankLinkStatus', width: 160, render: (value?: string) => value === 'BANK_LINKED' ? 'Đã liên kết' : 'Chưa liên kết' },
  { title: 'Ngày tạo', dataIndex: 'createdAt', width: 165, render: (value?: string) => value ? formatUTCToLocalDateTime(value) : '--' },
  {
    title: 'Thao tác', align: 'center', width: 100,
    render: (_, row) => <div className='flex items-center justify-center gap-2'>
      <Can screen='BUSINESS_WALLET_ACCOUNT' action='edit'><TooltipComponent title='Sửa hồ sơ'><ButtonComponent htmlType='button' type='default' size='small' aria-label='Sửa hồ sơ ví doanh nghiệp' icon={<EditOutlined aria-hidden />} onClick={() => onEdit(row)} /></TooltipComponent></Can>
      {row.verificationStatus === 'PENDING_APPROVAL' && <Can screen='BUSINESS_WALLET_ACCOUNT' action='approve'><TooltipComponent title='Phê duyệt KYB'><ButtonComponent htmlType='button' type='default' size='small' icon={<CheckCircleOutlined aria-hidden />} aria-label={`Phê duyệt ví ${row.legalName || row.registeredEmail}`} onClick={() => onApprove(row)} /></TooltipComponent></Can>}
    </div>
  }
]
