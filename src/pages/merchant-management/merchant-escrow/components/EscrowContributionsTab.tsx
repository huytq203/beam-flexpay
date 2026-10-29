import { useState } from 'react'
import type { Dayjs } from 'dayjs'
import { useGetEscrowContributionsQuery } from '@/app/services/merchantEscrowApi'
import { DateInput, Table } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import { ESCROW_LEDGER_KIND_LABEL } from '../constants/merchantEscrow.constants'
import type {
  EscrowContributionRow,
  EscrowLedgerKind
} from '../types/merchantEscrow.types'

const money = (value: number) => (
  <span className='tabular-nums'>{formatCurrency(value)}</span>
)

type Columns = NonNullable<
  TableComponentProps<EscrowContributionRow>['columns']
>

/** Đóng góp của từng Sub vào ký quỹ Master, tách theo hình thức nạp (`byForm`). */
export function EscrowContributionsTab({ masterId }: { masterId: string }) {
  const [asOf, setAsOf] = useState<Dayjs | null>(null)
  // BE nhận ISO-8601 UTC (sai định dạng thì 500): lấy cuối ngày đã chọn để "tính đến hết ngày".
  const query = useGetEscrowContributionsQuery({
    masterId,
    asOf: asOf ? asOf.endOf('day').toISOString() : undefined
  })
  const rows = query.data ?? []

  // Các hình thức có mặt trong dữ liệu quyết định cột động.
  const forms = Array.from(new Set(rows.flatMap((r) => Object.keys(r.byForm))))
  const columns: Columns = [
    {
      title: 'Sub-merchant',
      width: 240,
      render: (_, row) =>
        row.subCode ? `${row.subCode} - ${row.subName ?? ''}` : 'Không gắn Sub'
    },
    ...forms.map((form) => ({
      title: ESCROW_LEDGER_KIND_LABEL[form as EscrowLedgerKind] ?? form,
      align: 'right' as const,
      width: 180,
      render: (_: unknown, row: EscrowContributionRow) =>
        money(row.byForm[form] ?? 0)
    })),
    {
      title: 'Tổng đóng góp',
      align: 'right',
      width: 160,
      render: (_, row) => money(row.amount)
    }
  ]

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex max-w-xs flex-col gap-1'>
        <label
          htmlFor='escrow-as-of'
          className='text-xs font-medium text-muted-foreground'
        >
          Tính đến hết ngày
        </label>
        <DateInput
          id='escrow-as-of'
          format='DD/MM/YYYY'
          placeholder='Hiện tại'
          value={asOf}
          onChange={(value: Dayjs | null) => setAsOf(value)}
        />
      </div>
      <Table<EscrowContributionRow>
        columns={columns}
        dataSource={[...rows]}
        loading={query.isFetching}
        onRefresh={query.refetch}
        pagination={false}
        rowKey={(row) => row.subMerchantId ?? 'none'}
        scroll={{ x: 'max-content' }}
        size='small'
      />
    </div>
  )
}
