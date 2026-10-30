import { WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useGetEscrowOrdersQuery } from '@/app/services/merchantEscrowApi'
import { useGetHierarchyParentsQuery } from '@/app/services/merchantHierarchyApi'
import {
  ButtonComponent,
  SelectComponent,
  Table,
  TooltipComponent
} from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ESCROW_ORDER_STATUS_LABEL,
  ESCROW_SOURCE_LABEL
} from '../constants/merchantEscrow.constants'
import type {
  EscrowOrder,
  EscrowOrderStatus
} from '../types/merchantEscrow.types'
import { formatWaitingTime } from '../utils/escrowOrder.schema'
import { EscrowLoadError } from './EscrowLoadError'
import { EscrowOrderDetailDrawer } from './EscrowOrderDetailDrawer'

/** STT 21: 20 dòng mặc định, chọn 20/50/100, phân trang ở BE (trang đánh số từ 1). */
const DEFAULT_SIZE = 20
const PAGE_SIZE_OPTIONS = [20, 50, 100]
/** STT 3: mặc định chỉ hiện lệnh cần xử lý. */
const DEFAULT_STATUS: EscrowOrderStatus = 'PENDING_APPROVAL'
/** Danh sách Master cho bộ lọc và tên trên cột; một lần tải 100 bản ghi đầu (xem ghi chú ở bàn giao). */
const MASTER_PAGE_SIZE = 100

const STATUS_OPTIONS = (
  Object.keys(ESCROW_ORDER_STATUS_LABEL) as EscrowOrderStatus[]
).map((value) => ({ value, label: ESCROW_ORDER_STATUS_LABEL[value] }))

/** Thời gian chờ chỉ có nghĩa khi lệnh còn nằm ở người duyệt hoặc người lập. */
const WAITING_STATUSES: EscrowOrderStatus[] = ['PENDING_APPROVAL', 'RETURNED']

const labelClass = 'mb-1 block text-sm font-medium text-foreground'

type Columns = NonNullable<TableComponentProps<EscrowOrder>['columns']>

const buildColumns = (
  onOpen: (order: EscrowOrder) => void,
  masterLabelOf: (id: string) => string
): Columns => [
  {
    title: 'Mã lệnh',
    width: 170,
    // STT 6: font monospace, bấm mở chi tiết bên phải.
    render: (_, row) => (
      <button
        type='button'
        className='font-mono font-medium text-primary underline-offset-2 hover:underline'
        onClick={() => onOpen(row)}
      >
        {row.orderCode}
      </button>
    )
  },
  {
    title: 'Master Merchant',
    width: 220,
    render: (_, row) => masterLabelOf(row.masterId)
  },
  {
    title: 'Nguồn',
    width: 210,
    render: (_, row) => ESCROW_SOURCE_LABEL[row.source] ?? row.source
  },
  {
    title: 'Số tiền',
    align: 'right',
    width: 170,
    render: (_, row) => (
      <span className='inline-flex items-center gap-1 tabular-nums'>
        {/* STT 12: cảnh báo nạp vượt mức yêu cầu. Các cảnh báo khác của SRS (số dư đổi so với lúc lập,
            Master vừa bị khóa) BE chưa trả trên danh sách. */}
        {row.overfundedBy > 0 && (
          <TooltipComponent
            title={`Nạp vượt mức yêu cầu ${formatCurrency(row.overfundedBy)}`}
          >
            <span
              role='img'
              aria-label={`Nạp vượt mức yêu cầu ${formatCurrency(row.overfundedBy)}`}
              className='text-warning-strong'
            >
              <WarningIcon
                aria-hidden
                size={16}
              />
            </span>
          </TooltipComponent>
        )}
        {formatCurrency(row.amount)}
      </span>
    )
  },
  {
    title: 'Trạng thái',
    width: 170,
    render: (_, row) => ESCROW_ORDER_STATUS_LABEL[row.status] ?? row.status
  },
  // BE chỉ trả mã người lập (UUID), chưa có họ tên.
  { title: 'Người lập', dataIndex: 'authorId', width: 200 },
  {
    title: 'Lúc lập',
    width: 160,
    render: (_, row) => formatUTCToLocalDateTime(row.createdAt)
  },
  {
    title: 'Thời gian chờ',
    width: 150,
    // STT 11 + FR-MER-0629-06: quá 7 ngày (cờ `stale` do BE tính) tô đỏ kèm nhãn "Treo lâu".
    render: (_, row) =>
      WAITING_STATUSES.includes(row.status) ? (
        <span
          className={`inline-flex items-center gap-1 ${row.stale ? 'font-medium text-danger-strong' : ''}`}
        >
          {formatWaitingTime(row.createdAt)}
          {row.stale && (
            <span className='rounded-md bg-danger/10 px-1.5 py-0.5 text-xs'>
              Treo lâu
            </span>
          )}
        </span>
      ) : (
        '—'
      )
  }
]

/**
 * Hàng chờ phê duyệt lệnh nạp ký quỹ (SRS 3.6.29, phần lệnh nạp). Lọc theo trạng thái và Master,
 * bấm mã lệnh mở drawer chi tiết có khối Duyệt/Từ chối/Trả lại.
 */
interface EscrowOrderQueueProps {
  /** Master lọc sẵn khi mở từ số lệnh chờ duyệt trên Danh sách ký quỹ (SRS 3.6.26 STT 12). */
  initialMasterId?: string
}

export function EscrowOrderQueue({ initialMasterId }: EscrowOrderQueueProps = {}) {
  const [status, setStatus] = useState<EscrowOrderStatus | undefined>(
    DEFAULT_STATUS
  )
  const [masterId, setMasterId] = useState<string | undefined>(initialMasterId)
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [openedId, setOpenedId] = useState<string | null>(null)

  const query = useGetEscrowOrdersQuery({ status, masterId, page, size })
  const masters = useGetHierarchyParentsQuery({
    page: 1,
    size: MASTER_PAGE_SIZE
  })
  const masterOptions = (masters.data?.content ?? []).map((master) => ({
    value: master.id,
    label: `${master.code} - ${master.name}`
  }))
  // Lệnh chỉ mang `masterId`; tên/mã lấy từ danh sách Master, không có thì hiện id.
  const masterLabelOf = (id: string) =>
    masterOptions.find((option) => option.value === id)?.label ?? id

  const filtered = status !== DEFAULT_STATUS || masterId !== undefined
  const resetFilters = () => {
    setStatus(DEFAULT_STATUS)
    setMasterId(undefined)
    setPage(1)
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='grid grid-cols-1 items-end gap-3 md:grid-cols-4'>
        <div>
          <label
            className={labelClass}
            htmlFor='escrow-order-filter-status'
          >
            Trạng thái
          </label>
          <SelectComponent
            id='escrow-order-filter-status'
            allowClear
            className='w-full'
            options={STATUS_OPTIONS}
            placeholder='Tất cả trạng thái'
            value={status}
            onChange={(next: EscrowOrderStatus | undefined) => {
              setStatus(next)
              setPage(1)
            }}
          />
        </div>
        <div>
          <label
            className={labelClass}
            htmlFor='escrow-order-filter-master'
          >
            Master Merchant
          </label>
          <SelectComponent
            id='escrow-order-filter-master'
            allowClear
            showSearch
            optionFilterProp='label'
            className='w-full'
            options={masterOptions}
            loading={masters.isFetching}
            placeholder='Tất cả Master'
            value={masterId}
            onChange={(next: string | undefined) => {
              setMasterId(next)
              setPage(1)
            }}
          />
        </div>
        <div>
          {filtered && (
            <ButtonComponent
              type='default'
              htmlType='button'
              content='Xóa bộ lọc'
              onClick={resetFilters}
            />
          )}
        </div>
      </div>
      {query.isError && (
        <EscrowLoadError
          error={query.error}
          fallback='Không tải được hàng chờ phê duyệt lệnh nạp.'
          onRetry={() => void query.refetch()}
        />
      )}
      <Table<EscrowOrder>
        columns={buildColumns((order) => setOpenedId(order.id), masterLabelOf)}
        dataSource={[...(query.data?.content ?? [])]}
        loading={query.isFetching}
        onRefresh={query.refetch}
        pagination={{
          current: page,
          pageSize: size,
          total: query.data?.totalElements ?? 0,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          onChange: (nextPage, nextSize) => {
            setPage(nextPage)
            setSize(nextSize)
          }
        }}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
      <EscrowOrderDetailDrawer
        orderId={openedId}
        // Hàng chờ gồm nhiều Master nên không tải sẵn Sub của từng Master; hiện mã Sub.
        subLabelOf={(id) => id ?? '—'}
        onClose={() => setOpenedId(null)}
      />
    </div>
  )
}
