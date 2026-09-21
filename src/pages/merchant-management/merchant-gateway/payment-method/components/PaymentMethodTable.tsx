import { useState } from 'react'

import { Can } from '@/app/permissions'
import { ButtonComponent, DialogModal, TagComponent } from '@components/index'

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
    title: 'Cấp',
    dataIndex: 'scope',
    width: 100,
    render: (scope: PaymentMethodRow['scope']) => (
      <span className='rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground'>
        {scope === 'MASTER' ? 'Master' : 'Sub'}
      </span>
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
  onRequestStatusChange: (row: PaymentMethodRow) => void
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
          <ButtonComponent aria-label={`Đổi trạng thái ${row.merchantName}`} content={row.status === 'ACTIVE' ? 'Tắt' : 'Bật'} htmlType='button' onClick={() => onRequestStatusChange(row)} type='text' />
        </Can>
      </div>
    )
})

const getColumns = (
  onEdit: (row: PaymentMethodRow) => void,
  onRequestStatusChange: (row: PaymentMethodRow) => void
): PaymentMethodColumns => [...baseColumns, getActionColumn(onEdit, onRequestStatusChange)]

interface PaymentMethodStatusDialogProps {
  row: PaymentMethodRow | null
  onCancel: () => void
  onConfirm: (id: string) => void
}

function PaymentMethodStatusDialog({
  row,
  onCancel,
  onConfirm
}: PaymentMethodStatusDialogProps) {
  if (row === null) return null

  const isActivating = row.status === 'INACTIVE'
  const action = isActivating ? 'bật' : 'tắt'

  return (
    <DialogModal
      destroyOnHidden
      footer={
        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent block className='sm:w-auto!' content='Hủy' htmlType='button' onClick={onCancel} type='default' />
          <ButtonComponent block className='sm:w-auto!' content={`Xác nhận ${action}`} htmlType='button' onClick={() => onConfirm(row.id)} />
        </div>
      }
      onCancel={onCancel}
      onOk={() => {}}
      open
      title={`${isActivating ? 'Bật' : 'Tắt'} hình thức thanh toán`}
      width={{ xs: 'calc(100vw - 24px)', sm: 440 }}
    >
      <p className='text-sm text-muted-foreground'>
        Bạn có chắc muốn {action} hình thức thanh toán của {row.merchantName}?
      </p>
    </DialogModal>
  )
}

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
  const [pendingStatusRow, setPendingStatusRow] = useState<PaymentMethodRow | null>(null)
  const columns = getColumns(onEdit, setPendingStatusRow)

  const handleStatusConfirmation = (id: string): void => {
    onToggleStatus(id)
    setPendingStatusRow(null)
  }

  if (state === 'loading') {
    return <MerchantGatewayTableState columns={columns} rowKey='id' rows={[]} state='loading' />
  }

  if (state === 'error') {
    return <MerchantGatewayTableState columns={columns} onRetry={onRetry} rowKey='id' rows={[]} state='error' />
  }

  if (state === 'empty') {
    return <MerchantGatewayTableState columns={columns} emptyKind={filtered ? 'filtered' : 'initial'} onRetry={onRetry} rowKey='id' rows={[]} state='empty' />
  }

  return (
    <>
      <MerchantGatewayTableState columns={columns} onRefresh={onRetry} pagination={{ current: page, pageSize, total, showSizeChanger: false, onChange: onPageChange }} rowKey='id' rows={rows} state='success' />
      <PaymentMethodStatusDialog
        row={pendingStatusRow}
        onCancel={() => setPendingStatusRow(null)}
        onConfirm={handleStatusConfirmation}
      />
    </>
  )
}
