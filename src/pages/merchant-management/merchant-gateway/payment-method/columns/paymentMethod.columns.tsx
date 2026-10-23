import type { TableProps } from 'antd'
import { Can } from '@/app/permissions'
import type { PaymentMethodListRow } from '@/app/services/merchantPaymentMethodApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ButtonComponent } from '@components/index'
import { EditOutlined } from '@components/icons'
import {
  LevelCell,
  MerchantCell,
  MethodsCell,
  StatusCell
} from '../components/PaymentMethodCells'

export const createPaymentMethodColumns = (
  page: number,
  size: number,
  onEdit: (row: PaymentMethodListRow) => void
): NonNullable<TableProps<PaymentMethodListRow>['columns']> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (
      <span className='tabular-nums'>{(page - 1) * size + index + 1}</span>
    )
  },
  {
    title: 'Merchant',
    width: 240,
    render: (_, row) => <MerchantCell row={row} />
  },
  {
    title: 'Cấp áp dụng',
    width: 170,
    render: (_, row) => <LevelCell row={row} />
  },
  {
    title: 'Hình thức đang bật',
    render: (_, row) => <MethodsCell row={row} />
  },
  {
    title: 'Trạng thái',
    width: 130,
    render: (_, row) => <StatusCell active={row.active} />
  },
  {
    title: 'Cập nhật lần cuối',
    dataIndex: 'updatedAt',
    width: 170,
    render: (value?: string) => (
      <span className='text-sm text-muted-foreground tabular-nums'>
        {formatUTCToLocalDateTime(value) || 'Chưa cập nhật'}
      </span>
    )
  },
  {
    title: 'Thao tác',
    align: 'center',
    fixed: 'right',
    width: 130,
    render: (_, row) => (
      <Can
        screen='MERCHANT_PAYMENT_METHOD'
        action='edit'
      >
        <ButtonComponent
          aria-label={`${row.configured ? 'Cập nhật' : 'Thiết lập'} ${row.subMerchantName ?? row.merchantName}`}
          size='small'
          type='default'
          content={row.configured ? 'Cập nhật' : 'Thiết lập'}
          icon={<EditOutlined aria-hidden />}
          onClick={() => onEdit(row)}
        />
      </Can>
    )
  }
]
