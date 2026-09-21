import { Can } from '@/app/permissions'
import { EditOutlined, LockFilled, LockKeyOpenIcon } from '@components/icons'
import {
  ButtonComponent,
  CopyableText,
  TooltipComponent
} from '@components/index'

import type { MerchantGatewayTableStateProps } from '../../shared/merchantGateway.types'
import type { KeyConnectionRow } from '../types/keyConnection.type'
import { maskWebhookUrl } from '../utils/keyConnection.utils'

export type KeyConnectionColumns = MerchantGatewayTableStateProps<KeyConnectionRow>['columns']

const getStatusLabel = (status: KeyConnectionRow['status']): string =>
  status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'

const BASE_COLUMNS: KeyConnectionColumns = [
  {
    title: 'Merchant',
    width: 210,
    render: (_, row) => (
      <div className='flex min-w-0 flex-col gap-1'>
        <span className='font-medium text-foreground'>{row.merchantName}</span>
        <span className='text-xs text-muted-foreground'>{row.merchantCode}</span>
      </div>
    )
  },
  {
    title: 'Cấp',
    dataIndex: 'scope',
    width: 100,
    render: (scope: KeyConnectionRow['scope']) => (
      <span className='rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground'>
        {scope === 'MASTER' ? 'Master' : 'Sub'}
      </span>
    )
  },
  {
    title: 'Client ID',
    dataIndex: 'clientId',
    width: 190,
    render: (clientId: string) => (
      <CopyableText label='Client ID' value={clientId} />
    )
  },
  {
    title: 'Secret',
    dataIndex: 'maskedSecret',
    width: 160,
    render: (maskedSecret: string) => (
      <span className='font-mono text-sm'>{maskedSecret}</span>
    )
  },
  {
    title: 'IP whitelist',
    width: 180,
    render: (_, row) => (
      <span className='text-sm text-muted-foreground'>
        {row.ipWhitelist.length === 0
          ? 'Không giới hạn'
          : `${row.ipWhitelist.length} IP`}
      </span>
    )
  },
  {
    title: 'Webhook URL',
    dataIndex: 'webhookUrl',
    width: 260,
    render: (webhookUrl: string) => {
      const maskedUrl = maskWebhookUrl(webhookUrl)
      return <TooltipComponent title={maskedUrl}>
        <span className='block max-w-60 truncate text-sm text-foreground'>
          {maskedUrl}
        </span>
      </TooltipComponent>
    }
  },
  {
    title: 'Trạng thái',
    width: 150,
    render: (_, row) => (
      <span
        className={
          row.status === 'ACTIVE'
            ? 'text-sm font-medium text-emerald-700'
            : 'text-sm font-medium text-muted-foreground'
        }
      >
        {getStatusLabel(row.status)}
      </span>
    )
  },
  { title: 'Cập nhật', dataIndex: 'updatedAt', width: 150 }
]

const getActionColumn = (
  onEdit: (row: KeyConnectionRow) => void,
  onRequestStatusChange: (row: KeyConnectionRow) => void
): KeyConnectionColumns[number] => ({
  title: 'Thao tác',
  align: 'center',
  fixed: 'right',
  width: 100,
  render: (_, row) => (
    <div className='flex items-center justify-center gap-1'>
      <Can screen='MERCHANT_KEY_CONNECTION' action='edit'>
        <TooltipComponent title='Sửa key kết nối'>
          <ButtonComponent
            aria-label={`Sửa key ${row.merchantName}`}
            htmlType='button'
            icon={<EditOutlined aria-hidden />}
            onClick={() => onEdit(row)}
            type='text'
          />
        </TooltipComponent>
      </Can>
      <Can screen='MERCHANT_KEY_CONNECTION' action='update'>
        <TooltipComponent title={row.status === 'ACTIVE' ? 'Tắt key kết nối' : 'Bật key kết nối'}>
          <ButtonComponent
            aria-label={`Đổi trạng thái key ${row.merchantName}`}
            danger={row.status === 'ACTIVE'}
            htmlType='button'
            icon={row.status === 'ACTIVE' ? <LockFilled aria-hidden /> : <LockKeyOpenIcon aria-hidden size={16} />}
            onClick={() => onRequestStatusChange(row)}
            type='text'
          />
        </TooltipComponent>
      </Can>
    </div>
  )
})

export const createKeyConnectionColumns = (
  onEdit: (row: KeyConnectionRow) => void,
  onRequestStatusChange: (row: KeyConnectionRow) => void
): KeyConnectionColumns => [
  ...BASE_COLUMNS,
  getActionColumn(onEdit, onRequestStatusChange)
]
