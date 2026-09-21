import { useState } from 'react'

import { Can } from '@/app/permissions'
import {
  ButtonComponent,
  CopyableText,
  DialogModal,
  TooltipComponent
} from '@components/index'

import { MerchantGatewayTableState } from '../../shared/MerchantGatewayTableState'
import type { MerchantGatewayTableStateProps } from '../../shared/merchantGateway.types'
import type { KeyConnectionRow } from '../types/keyConnection.type'

type KeyConnectionColumns = MerchantGatewayTableStateProps<KeyConnectionRow>['columns']

interface KeyConnectionTableProps {
  rows: KeyConnectionRow[]
  state: 'loading' | 'error' | 'empty' | 'success'
  page: number
  pageSize: number
  total: number
  filtered: boolean
  onEdit: (row: KeyConnectionRow) => void
  onToggleStatus: (id: string) => void
  onPageChange: (page: number) => void
  onRetry: () => void
}

interface StatusChangeDialogProps {
  row: KeyConnectionRow | null
  onCancel: () => void
  onConfirm: (id: string) => void
}

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
    render: (clientId: string) => <CopyableText value={clientId} />
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
        {row.ipWhitelist.length === 0 ? 'Không giới hạn' : row.ipWhitelist.join(', ')}
      </span>
    )
  },
  {
    title: 'Webhook URL',
    dataIndex: 'webhookUrl',
    width: 260,
    render: (webhookUrl: string) => (
      <TooltipComponent title={webhookUrl}>
        <span className='block max-w-60 truncate text-sm text-foreground'>
          {webhookUrl}
        </span>
      </TooltipComponent>
    )
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
  { title: 'Cập nhật', dataIndex: 'updatedAt', width: 150 },
]

const getActionColumn = (
  onEdit: (row: KeyConnectionRow) => void,
  onRequestStatusChange: (row: KeyConnectionRow) => void
): KeyConnectionColumns[number] => ({
  title: 'Thao tác',
  align: 'center',
  fixed: 'right',
  width: 190,
  render: (_, row) => (
    <div className='flex items-center justify-center gap-1'>
      <Can screen='MERCHANT_KEY_CONNECTION' action='edit'>
        <ButtonComponent aria-label={`Sửa key ${row.merchantName}`} content='Sửa key' htmlType='button' onClick={() => onEdit(row)} type='text' />
      </Can>
      <Can screen='MERCHANT_KEY_CONNECTION' action='update'>
        <ButtonComponent aria-label={`Đổi trạng thái key ${row.merchantName}`} content={row.status === 'ACTIVE' ? 'Tắt' : 'Bật'} htmlType='button' onClick={() => onRequestStatusChange(row)} type='text' />
      </Can>
    </div>
  )
})

const createColumns = (
  onEdit: (row: KeyConnectionRow) => void,
  onRequestStatusChange: (row: KeyConnectionRow) => void
): KeyConnectionColumns => [
  ...BASE_COLUMNS,
  getActionColumn(onEdit, onRequestStatusChange)
]

function StatusChangeDialog({
  row,
  onCancel,
  onConfirm
}: StatusChangeDialogProps) {
  if (!row) return null

  const nextStatus = row.status === 'ACTIVE' ? 'ngưng hoạt động' : 'kích hoạt'

  return (
    <DialogModal
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => onConfirm(row.id)}
      open
      title='Xác nhận cập nhật trạng thái'
    >
      Bạn có chắc muốn {nextStatus} key của {row.merchantName}?
    </DialogModal>
  )
}

export function KeyConnectionTable({
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
}: KeyConnectionTableProps) {
  const [statusRow, setStatusRow] = useState<KeyConnectionRow | null>(null)
  const columns = createColumns(onEdit, setStatusRow)

  if (state === 'loading') {
    return <MerchantGatewayTableState state='loading' rows={[]} columns={columns} rowKey='id' />
  }

  if (state === 'error') {
    return <MerchantGatewayTableState state='error' rows={[]} columns={columns} rowKey='id' onRetry={onRetry} />
  }

  if (state === 'empty') {
    return <MerchantGatewayTableState state='empty' rows={[]} columns={columns} emptyKind={filtered ? 'filtered' : 'initial'} rowKey='id' />
  }

  return (
    <>
      <MerchantGatewayTableState
        columns={columns}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          onChange: onPageChange
        }}
        rowKey='id'
        rows={rows}
        state='success'
      />
      <StatusChangeDialog
        row={statusRow}
        onCancel={() => setStatusRow(null)}
        onConfirm={(id) => {
          onToggleStatus(id)
          setStatusRow(null)
        }}
      />
    </>
  )
}
