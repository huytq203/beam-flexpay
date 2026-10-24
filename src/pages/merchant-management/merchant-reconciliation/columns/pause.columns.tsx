import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import { SubMerchantName } from '../components/SubMerchantName'
import type { SettlementPause } from '../types/reconciliation.types'

type Columns = NonNullable<TableProps<SettlementPause>['columns']>

export interface PauseColumnOptions {
  page: number
  pageSize: number
  onConfirm: (row: SettlementPause) => void
}

export const createPauseColumns = ({
  page,
  pageSize,
  onConfirm
}: PauseColumnOptions): Columns => [
  {
    title: '#',
    width: 56,
    align: 'center',
    render: (_, __, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Sub-merchant',
    width: 240,
    render: (_, row) => <SubMerchantName subId={row.subMerchantId} />
  },
  {
    title: 'Lý do tạm dừng',
    dataIndex: 'reason',
    render: (value: string) => (
      <p
        className='max-w-[56ch] whitespace-normal break-words text-sm'
        title={value}
      >
        {value || '—'}
      </p>
    )
  },
  {
    title: 'Tạm dừng từ',
    dataIndex: 'since',
    render: (value: string) => formatUTCToLocalDateTime(value) || '—'
  },
  {
    title: 'Leo thang',
    dataIndex: 'escalated',
    align: 'center',
    render: (value: boolean) =>
      value ? (
        <TagComponent color='warning'>Quá 24 giờ</TagComponent>
      ) : (
        <TagComponent color='default'>Chưa</TagComponent>
      )
  },
  {
    title: 'Thao tác',
    fixed: 'right',
    align: 'center',
    render: (_, row) => (
      <Can
        screen='MERCHANT_RECONCILIATION'
        action='confirm'
      >
        <ButtonComponent
          aria-label={`Xác nhận đã xử lý tạm dừng ${row.subMerchantId}`}
          content='Xác nhận đã xử lý'
          htmlType='button'
          onClick={() => onConfirm(row)}
          size='small'
          type='default'
        />
      </Can>
    )
  }
]
