import { Can } from '@/app/permissions'
import { ButtonComponent, TagComponent } from '@components/index'

import { MerchantGatewayTableState } from '../../shared/MerchantGatewayTableState'
import type { MerchantGatewayTableStateProps } from '../../shared/merchantGateway.types'
import type { PaymentMethodRow } from '../types/paymentMethod.type'

interface PaymentMethodTableProps {
  rows: PaymentMethodRow[]
  state: 'loading' | 'error' | 'empty' | 'success'
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onEdit: (row: PaymentMethodRow) => void
  onToggleStatus: (id: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

type PaymentMethodColumns = MerchantGatewayTableStateProps<PaymentMethodRow>['columns']

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
})

const methodLabels: Record<PaymentMethodRow['method'], string> = {
  QR_DONG: 'QR động',
  VI_DIEN_TU: 'Ví điện tử',
  THE_NOI_DIA: 'Thẻ nội địa'
}

const channelLabels: Record<PaymentMethodRow['channel'], string> = {
  WEB: 'Website',
  APP: 'Ứng dụng',
  POS: 'POS'
}

const baseColumns: PaymentMethodColumns = [
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
    title: 'Hình thức',
    dataIndex: 'method',
    width: 140,
    render: (method: PaymentMethodRow['method']) => methodLabels[method]
  },
  {
    title: 'Kênh',
    dataIndex: 'channel',
    width: 110,
    render: (channel: PaymentMethodRow['channel']) => channelLabels[channel]
  },
  {
    title: 'Hạn mức',
    width: 235,
    render: (_, row) => (
      <span className='tabular-nums'>
        {currencyFormatter.format(row.minAmount)} – {currencyFormatter.format(row.maxAmount)}
      </span>
    )
  },
  { title: 'Biểu phí', dataIndex: 'feeLabel', width: 160 },
  {
    title: 'Trạng thái',
    width: 145,
    render: (_, row) => (
      <TagComponent color={row.status === 'ACTIVE' ? 'success' : 'default'}>
        {row.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
      </TagComponent>
    )
  },
  { title: 'Cập nhật', dataIndex: 'updatedAt', width: 155 }
]

const getActionColumn = (
  onEdit: (row: PaymentMethodRow) => void,
  onToggleStatus: (id: string) => void
): PaymentMethodColumns[number] => ({
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 175,
    render: (_, row) => (
      <div className='flex items-center justify-center gap-1'>
        <Can screen='MERCHANT_PAYMENT_METHOD' action='edit'>
          <ButtonComponent aria-label={`Sửa hình thức ${row.merchantName}`} content='Sửa' htmlType='button' onClick={() => onEdit(row)} type='text' />
        </Can>
        <Can screen='MERCHANT_PAYMENT_METHOD' action='update'>
          <ButtonComponent aria-label={`Đổi trạng thái ${row.merchantName}`} content={row.status === 'ACTIVE' ? 'Tắt' : 'Bật'} htmlType='button' onClick={() => onToggleStatus(row.id)} type='text' />
        </Can>
      </div>
    )
})

const getColumns = (
  onEdit: (row: PaymentMethodRow) => void,
  onToggleStatus: (id: string) => void
): PaymentMethodColumns => [...baseColumns, getActionColumn(onEdit, onToggleStatus)]

export function PaymentMethodTable({
  rows,
  state,
  page,
  pageSize,
  total,
  filtered,
  onEdit,
  onToggleStatus,
  onPageChange,
  onRetry
}: PaymentMethodTableProps) {
  const columns = getColumns(onEdit, onToggleStatus)

  if (state === 'loading') {
    return <MerchantGatewayTableState columns={columns} rowKey='id' rows={[]} state='loading' />
  }

  if (state === 'error') {
    return <MerchantGatewayTableState columns={columns} onRetry={onRetry} rowKey='id' rows={[]} state='error' />
  }

  if (state === 'empty') {
    return <MerchantGatewayTableState columns={columns} emptyKind={filtered ? 'filtered' : 'initial'} onRetry={onRetry} rowKey='id' rows={[]} state='empty' />
  }

  return <MerchantGatewayTableState columns={columns} onRefresh={onRetry} pagination={{ current: page, pageSize, total, showSizeChanger: false, onChange: onPageChange }} rowKey='id' rows={rows} state='success' />
}
