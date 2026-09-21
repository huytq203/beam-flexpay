import { useState } from 'react'

import { Can } from '@/app/permissions'
import { ButtonComponent, DialogModal, TooltipComponent } from '@components/index'

import { MerchantGatewayTableState } from '../../shared/MerchantGatewayTableState'
import type { ListState, MerchantGatewayTableStateProps } from '../../shared/merchantGateway.types'
import type { NotificationEvent, NotificationRow } from '../types/notification.type'

interface Props { rows: NotificationRow[]; state: ListState; page: number; pageSize: number; total: number; filtered: boolean; onEdit: (row: NotificationRow) => void; onToggleStatus: (id: string) => void; onPageChange: (page: number) => void; onRetry: () => void }
const eventLabels: Record<NotificationEvent, string> = { PAYMENT_SUCCESS: 'Thanh toán thành công', PAYMENT_FAILED: 'Thanh toán thất bại', REFUND: 'Hoàn tiền', SETTLEMENT: 'Đối soát' }
const channelLabels = { EMAIL: 'Email', SMS: 'SMS', WEBHOOK: 'Webhook' } as const
type Columns = MerchantGatewayTableStateProps<NotificationRow>['columns']

const columns = (onEdit: Props['onEdit'], onStatus: (row: NotificationRow) => void): Columns => [
  { title: 'Merchant', width: 210, render: (_, row) => <div className='flex flex-col gap-1'><span className='font-medium text-foreground'>{row.merchantName}</span><span className='text-xs text-muted-foreground'>{row.merchantCode}</span></div> },
  { title: 'Cấp', dataIndex: 'scope', width: 90, render: (scope: NotificationRow['scope']) => <span className='rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground'>{scope === 'MASTER' ? 'Master' : 'Sub'}</span> },
  { title: 'Sự kiện', dataIndex: 'event', width: 190, render: (event: NotificationEvent) => eventLabels[event] },
  { title: 'Kênh', dataIndex: 'channel', width: 110, render: (channel: NotificationRow['channel']) => channelLabels[channel] },
  { title: 'Đích nhận', dataIndex: 'maskedDestination', width: 250, render: (value: string) => <TooltipComponent title={value}><span className='block max-w-60 truncate font-mono text-sm'>{value}</span></TooltipComponent> },
  { title: 'Trạng thái', width: 150, render: (_, row) => <span className={row.status === 'ACTIVE' ? 'text-sm font-medium text-success' : 'text-sm font-medium text-muted-foreground'}>{row.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}</span> },
  { title: 'Cập nhật', dataIndex: 'updatedAt', width: 150 },
  { title: 'Thao tác', align: 'center', fixed: 'right', width: 190, render: (_, row) => <div className='flex justify-center gap-1'><Can screen='MERCHANT_NOTIFICATION' action='edit'><ButtonComponent content='Sửa' htmlType='button' onClick={() => onEdit(row)} type='text' /></Can><Can screen='MERCHANT_NOTIFICATION' action='update'><ButtonComponent content={row.status === 'ACTIVE' ? 'Tắt' : 'Bật'} htmlType='button' onClick={() => onStatus(row)} type='text' /></Can></div> }
]

export function NotificationTable({ rows, state, page, pageSize, total, filtered, onEdit, onToggleStatus, onPageChange, onRetry }: Props) {
  const [statusRow, setStatusRow] = useState<NotificationRow | null>(null)
  const tableColumns = columns(onEdit, setStatusRow)

  const renderTable = () => {
    if (state === 'loading') return <MerchantGatewayTableState columns={tableColumns} rowKey='id' rows={[]} state='loading' />
    if (state === 'error') return <MerchantGatewayTableState columns={tableColumns} onRetry={onRetry} rowKey='id' rows={[]} state='error' />
    if (state === 'empty') return <MerchantGatewayTableState columns={tableColumns} emptyKind={filtered ? 'filtered' : 'initial'} onRetry={onRetry} rowKey='id' rows={[]} state='empty' />
    return <MerchantGatewayTableState columns={tableColumns} onRefresh={onRetry} pagination={{ current: page, pageSize, total, showSizeChanger: false, onChange: onPageChange }} rowKey='id' rows={rows} state='success' />
  }

  return <>
    {renderTable()}
    {statusRow && <DialogModal destroyOnHidden onCancel={() => setStatusRow(null)} onOk={() => { onToggleStatus(statusRow.id); setStatusRow(null) }} open title='Xác nhận cập nhật trạng thái'>Bạn có chắc muốn {statusRow.status === 'ACTIVE' ? 'ngưng' : 'kích hoạt'} thông báo của {statusRow.merchantName}?</DialogModal>}
  </>
}
