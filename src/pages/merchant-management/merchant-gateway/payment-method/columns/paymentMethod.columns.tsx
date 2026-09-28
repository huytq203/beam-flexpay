import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import type { PaymentMethod, PaymentMethodSummary } from '@/app/services/merchantGatewayApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent, TagComponent } from '@components/index'
import { EditOutlined } from '@components/icons'

export const methodOptions: { label: string; value: PaymentMethod }[] = [
  { label: 'QR', value: 'QR' },
  { label: 'Thẻ nội địa', value: 'DOMESTIC_CARD' },
  { label: 'Thẻ quốc tế', value: 'INTERNATIONAL_CARD' },
  { label: 'Ví liên kết', value: 'LINKED_WALLET' },
  { label: 'Tài khoản định danh', value: 'VIRTUAL_ACCOUNT' }
]

const methodLabel = (code: PaymentMethod) => methodOptions.find((item) => item.value === code)?.label ?? code

export const createPaymentMethodColumns = (page: number, size: number, onEdit: (merchantId: string) => void): NonNullable<TableProps<PaymentMethodSummary>['columns']> => [
  { title: '#', align: 'center', width: 64, render: (_value, _row, index) => (page - 1) * size + index + 1 },
  { title: 'Cấp áp dụng', width: 240, render: (_, row) => <div className='flex min-w-0 items-center gap-2'><TagComponent color={row.appliedLevel === 'MASTER' ? 'cyan' : 'default'}>{row.appliedLevel === 'MASTER' ? 'Master' : row.appliedLevel === 'SUB' ? 'Sub' : row.appliedLevel || '—'}</TagComponent><div className='min-w-0'><div className='truncate text-sm font-medium text-foreground'>{row.merchantName}</div><div className='text-xs text-muted-foreground'>{row.merchantCode}</div></div></div> },
  { title: 'Hình thức đang bật', render: (_, row) => row.enabledMethods?.length ? <div className='flex flex-wrap gap-1'>{row.enabledMethods.map((method) => <TagComponent key={method}>{methodLabel(method)}</TagComponent>)}</div> : <span className='text-xs text-muted-foreground'>Chưa bật</span> },
  { title: 'Trạng thái', width: 125, render: (_, row) => <TagComponent color={row.active ? 'success' : 'default'}>{row.active ? 'Đang dùng' : 'Ngừng'}</TagComponent> },
  { title: 'Cập nhật lần cuối', dataIndex: 'updatedAt', width: 170, render: (value?: string) => formatUTCToLocalDateTime(value) || '—' },
  { title: 'Thao tác', align: 'center', fixed: 'right', width: 75, render: (_, row) => <Can screen='MERCHANT_PAYMENT_METHOD' action='edit'><ButtonComponent aria-label={`${row.configured ? 'Cập nhật' : 'Thiết lập'} ${row.merchantName}`} title={row.configured ? 'Cập nhật' : 'Thiết lập'} size='small' type='default' icon={<EditOutlined aria-hidden />} onClick={() => onEdit(row.merchantId)} /></Can> }
]
