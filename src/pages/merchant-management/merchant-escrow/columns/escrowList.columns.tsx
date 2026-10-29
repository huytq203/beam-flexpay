import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import {
  formatUTCToLocalDate,
  formatUTCToLocalDateTime
} from '@utils/helper-functions/date'
import {
  ESCROW_RISK_LABEL,
  ESCROW_STATE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowRow } from '../types/merchantEscrow.types'

interface Options {
  page: number
  pageSize: number
  onOpen: (row: EscrowRow) => void
}

const money = (value: number | null) => (
  <span className='tabular-nums'>
    {value === null ? '' : formatCurrency(value)}
  </span>
)

// Nhãn rủi ro đầy đủ kèm ngưỡng "(30% đến dưới 80%)": ô bảng chỉ hiện phần tên, ngưỡng để ở tooltip.
const riskName = (label: string) => label.split(' (')[0]

export const createEscrowListColumns = ({
  page,
  pageSize,
  onOpen
}: Options): NonNullable<TableComponentProps<EscrowRow>['columns']> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Mã',
    width: 130,
    render: (_, row) => (
      <button
        type='button'
        className='font-medium text-primary underline-offset-2 hover:underline'
        onClick={() => onOpen(row)}
      >
        {row.code}
      </button>
    )
  },
  { title: 'Tên Master', dataIndex: 'name', width: 220 },
  {
    title: 'Số Sub hoạt động',
    dataIndex: 'activeSubMerchants',
    align: 'right',
    width: 130
  },
  {
    title: 'Trạng thái',
    width: 170,
    render: (_, row) => ESCROW_STATE_LABEL[row.state]
  },
  {
    title: 'Mức yêu cầu',
    align: 'right',
    width: 150,
    render: (_, row) => money(row.requiredAmount)
  },
  {
    title: 'Số dư',
    align: 'right',
    width: 150,
    render: (_, row) => money(row.balance)
  },
  {
    title: 'Thiếu/Dư',
    align: 'right',
    width: 150,
    // Thiếu thì hiện phần thiếu, ngược lại hiện phần dư (một trong hai luôn bằng 0).
    render: (_, row) => money(row.shortfall > 0 ? row.shortfall : row.surplus)
  },
  {
    title: '% đạt',
    align: 'right',
    width: 90,
    render: (_, row) => (row.percent === null ? '' : `${row.percent}%`)
  },
  {
    title: 'Rủi ro',
    width: 120,
    render: (_, row) =>
      row.risk ? (
        <span title={ESCROW_RISK_LABEL[row.risk]}>
          {riskName(ESCROW_RISK_LABEL[row.risk])}
        </span>
      ) : (
        ''
      )
  },
  {
    title: 'Hạn',
    width: 120,
    render: (_, row) => formatUTCToLocalDate(row.deadlineAt)
  },
  {
    title: 'Còn (ngày)',
    align: 'right',
    width: 110,
    render: (_, row) =>
      row.daysLeft === null ? (
        ''
      ) : (
        <span className={row.overdue ? 'font-medium text-danger-strong' : ''}>
          {row.daysLeft}
        </span>
      )
  },
  {
    title: 'Lệnh chờ duyệt',
    dataIndex: 'waitingOrders',
    align: 'right',
    width: 130
  },
  {
    title: 'Đồng bộ số dư lúc',
    width: 170,
    render: (_, row) => formatUTCToLocalDateTime(row.balanceSyncedAt)
  }
]
