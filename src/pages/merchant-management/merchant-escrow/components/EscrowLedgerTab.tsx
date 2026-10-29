import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useClearEscrowReturnBlockMutation,
  useGetEscrowLedgerQuery,
  useVerifyEscrowLedgerMutation
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, feedback, Table } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ESCROW_LEDGER_KIND_LABEL } from '../constants/merchantEscrow.constants'
import type {
  EscrowLedgerEntry,
  EscrowVerification
} from '../types/merchantEscrow.types'

const DEFAULT_SIZE = 20

type Columns = NonNullable<TableComponentProps<EscrowLedgerEntry>['columns']>

const buildColumns = (showEventKey: boolean): Columns => [
  { title: 'STT', dataIndex: 'seq', width: 70, align: 'right' },
  {
    title: 'Loại',
    width: 240,
    render: (_, row) => ESCROW_LEDGER_KIND_LABEL[row.kind] ?? row.kind
  },
  {
    title: 'Số tiền',
    align: 'right',
    width: 160,
    // Số âm (hoàn trả, cấn trừ, khấu trừ) tô đỏ để kế toán nhìn ra chiều tiền đi ra.
    render: (_, row) => (
      <span
        className={`tabular-nums ${row.amountDelta < 0 ? 'text-danger-strong' : ''}`}
      >
        {formatCurrency(row.amountDelta)}
      </span>
    )
  },
  {
    title: 'Số dư sau',
    align: 'right',
    width: 160,
    render: (_, row) => (
      <span className='tabular-nums'>{formatCurrency(row.balanceAfter)}</span>
    )
  },
  { title: 'Ghi chú', dataIndex: 'note', width: 220 },
  ...(showEventKey
    ? [{ title: 'Khóa sự kiện', dataIndex: 'eventKey', width: 200 }]
    : []),
  {
    title: 'Thời điểm',
    width: 170,
    render: (_, row) => formatUTCToLocalDateTime(row.occurredAt)
  }
]

/** Sổ cái ký quỹ phân trang + kiểm tra tính toàn vẹn sổ. */
export function EscrowLedgerTab({ masterId }: { masterId: string }) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [result, setResult] = useState<EscrowVerification>()
  const query = useGetEscrowLedgerQuery({ masterId, page: page - 1, size })
  const [verify, verifying] = useVerifyEscrowLedgerMutation()
  const [clearBlock, clearing] = useClearEscrowReturnBlockMutation()

  const rows = query.data?.content ?? []
  // BE chỉ trả khóa sự kiện cho vai trò Kế toán (các vai khác null): không có thì ẩn cả cột.
  const showEventKey = rows.some((row) => row.eventKey != null)

  const runVerify = async () => {
    try {
      setResult(await verify(masterId).unwrap())
    } catch (error) {
      feedback.error(getApiErrorDetail(error, 'Không kiểm tra được sổ cái'))
    }
  }

  const runClear = async () => {
    try {
      await clearBlock(masterId).unwrap()
      feedback.success('Đã gỡ chặn hoàn trả')
      setResult(undefined)
    } catch (error) {
      feedback.error(getApiErrorDetail(error, 'Không gỡ được chặn hoàn trả'))
    }
  }

  // Sổ đứt quãng hoặc tổng đóng góp khác số dư là dấu hiệu sổ sai: BE chặn hoàn trả cho đến
  // khi người có quyền duyệt kiểm tra xong và gỡ chặn.
  const mismatch =
    result !== undefined && (!result.continuous || !result.contributionsMatch)

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center gap-2'>
        <ButtonComponent
          type='default'
          content='Kiểm tra sổ'
          loading={verifying.isLoading}
          onClick={() => void runVerify()}
        />
      </div>
      {result && (
        <div
          role={mismatch ? 'alert' : 'status'}
          className={`rounded-lg border p-3 text-sm ${mismatch ? 'border-danger-strong/30 text-danger-strong' : 'border-border'}`}
        >
          <p>Sổ liên tục: {result.continuous ? 'Có' : 'Không'}</p>
          {result.breaks.length > 0 && (
            <p>Điểm đứt: {result.breaks.join(', ')}</p>
          )}
          <p>
            Số dư sổ cái {formatCurrency(result.balance)}, tổng đóng góp{' '}
            {formatCurrency(result.contributionTotal)}
          </p>
          <p>
            Đóng góp khớp số dư: {result.contributionsMatch ? 'Có' : 'Không'}
          </p>
          {mismatch && (
            <>
              <p className='font-medium'>
                Đóng góp không khớp số dư hoặc sổ bị đứt: hoàn trả đang bị chặn
                cho đến khi kiểm tra xong.
              </p>
              <Can
                screen='MERCHANT_ESCROW_DETAIL'
                action='clearBlock'
              >
                <ButtonComponent
                  className='mt-2'
                  type='default'
                  content='Gỡ chặn hoàn trả'
                  loading={clearing.isLoading}
                  onClick={() => void runClear()}
                />
              </Can>
            </>
          )}
        </div>
      )}
      <Table<EscrowLedgerEntry>
        columns={buildColumns(showEventKey)}
        dataSource={[...rows]}
        loading={query.isFetching}
        onRefresh={query.refetch}
        pagination={{
          current: page,
          pageSize: size,
          total: query.data?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (nextPage, nextSize) => {
            setPage(nextPage)
            setSize(nextSize)
          }
        }}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
    </div>
  )
}
