import { useState } from 'react'
import { Can } from '@/app/permissions'
import { useGetEscrowOrdersQuery } from '@/app/services/merchantEscrowApi'
import { useGetSubMerchantPageQuery } from '@/app/services/merchantHierarchyApi'
import { ButtonComponent, Table, TooltipComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import { formatCurrency } from '@utils/formatNumber'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ESCROW_ORDER_STATUS_LABEL,
  ESCROW_SOURCE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowOrder, EscrowOverview } from '../types/merchantEscrow.types'
import {
  CREATE_ORDER_LABEL,
  createOrderBlockReason,
  formatLocalDate
} from '../utils/escrowOrder.schema'
import { EscrowLoadError } from './EscrowLoadError'
import { EscrowOrderCreateDialog } from './EscrowOrderCreateDialog'
import { EscrowOrderDetailDrawer } from './EscrowOrderDetailDrawer'

const DEFAULT_SIZE = 20
/** Đủ cho mọi Sub của một Master trong vận hành hiện tại; chỉ dùng để hiện tên Sub nguồn. */
const SUB_PAGE_SIZE = 100

type Columns = NonNullable<TableComponentProps<EscrowOrder>['columns']>

const buildColumns = (
  onOpen: (order: EscrowOrder) => void,
  subLabelOf: (id: string | null) => string
): Columns => [
  {
    title: 'Mã lệnh',
    width: 170,
    render: (_, row) => (
      <button
        type='button'
        className='font-medium text-primary underline-offset-2 hover:underline'
        onClick={() => onOpen(row)}
      >
        {row.orderCode}
      </button>
    )
  },
  {
    title: 'Nguồn',
    width: 220,
    render: (_, row) => ESCROW_SOURCE_LABEL[row.source] ?? row.source
  },
  {
    title: 'Số tiền',
    align: 'right',
    width: 150,
    render: (_, row) => (
      <span className='tabular-nums'>{formatCurrency(row.amount)}</span>
    )
  },
  { title: 'Mã tham chiếu', dataIndex: 'transferReference', width: 160 },
  {
    title: 'Ngày ghi có',
    width: 120,
    render: (_, row) => (row.creditedOn ? formatLocalDate(row.creditedOn) : '')
  },
  {
    title: 'Sub nguồn',
    width: 200,
    render: (_, row) => (row.subMerchantId ? subLabelOf(row.subMerchantId) : '')
  },
  {
    title: 'Trạng thái',
    width: 200,
    render: (_, row) => (
      <span className='flex flex-wrap items-center gap-1'>
        <span>{ESCROW_ORDER_STATUS_LABEL[row.status] ?? row.status}</span>
        {/* Bước 7 workflow: chờ quá 7 ngày phải nổi bật, nhất là khi tiền của Sub đang bị giữ chỗ. */}
        {row.stale && (
          <span className='rounded-md bg-warning/10 px-1.5 py-0.5 text-xs font-medium text-warning-strong'>
            Chờ quá 7 ngày
          </span>
        )}
      </span>
    )
  },
  // BE chỉ trả mã người lập, chưa có tên.
  { title: 'Người lập', dataIndex: 'authorId', width: 200 },
  {
    title: 'Lúc tạo',
    width: 170,
    render: (_, row) => formatUTCToLocalDateTime(row.createdAt)
  }
]

interface EscrowOrdersTabProps {
  masterId: string
  /** Tổng quan của Master (trang chi tiết đã tải): quyết định nút tạo lệnh có bật không. */
  overview: EscrowOverview | undefined
}

/**
 * Tab "Lệnh nạp ký quỹ" ở chi tiết Master: danh sách lệnh nạp của Master, bấm mã lệnh để xem chi tiết
 * trong drawer, và nút tạo lệnh nạp cùng quy tắc vô hiệu với dòng danh sách (SRS 3.6.26 STT 14).
 */
export function EscrowOrdersTab({ masterId, overview }: EscrowOrdersTabProps) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_SIZE)
  const [openedId, setOpenedId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  // flex.merchant bật `spring.data.web.pageable.one-indexed-parameters=true`, nên `page` gửi đúng số
  // trang bảng antd (bắt đầu từ 1); gửi page-1 thì trang 1 và trang 2 cùng ra trang đầu.
  const query = useGetEscrowOrdersQuery({ masterId, page, size })
  const subs = useGetSubMerchantPageQuery({
    page: 1,
    size: SUB_PAGE_SIZE,
    merchantId: masterId
  })

  const subLabelOf = (id: string | null): string => {
    if (!id) return '—'
    const sub = subs.data?.content.find((item) => item.id === id)
    return sub ? `${sub.code} - ${sub.name}` : id
  }

  const reason = overview
    ? createOrderBlockReason(overview.current !== null, overview.requiredAmount)
    : null
  const createButton = (
    <ButtonComponent
      htmlType='button'
      content={CREATE_ORDER_LABEL}
      disabled={!overview || reason !== null}
      onClick={() => setCreating(true)}
    />
  )

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-end gap-2'>
        <Can
          screen='MERCHANT_ESCROW_ORDER'
          action='create'
        >
          {reason ? (
            <TooltipComponent title={reason}>
              <span className='inline-block'>{createButton}</span>
            </TooltipComponent>
          ) : (
            createButton
          )}
        </Can>
      </div>
      {query.isError && (
        <EscrowLoadError
          error={query.error}
          fallback='Không tải được danh sách lệnh nạp ký quỹ.'
          onRetry={() => void query.refetch()}
        />
      )}
      <Table<EscrowOrder>
        columns={buildColumns((order) => setOpenedId(order.id), subLabelOf)}
        dataSource={[...(query.data?.content ?? [])]}
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
      <EscrowOrderDetailDrawer
        orderId={openedId}
        subLabelOf={subLabelOf}
        onClose={() => setOpenedId(null)}
      />
      {creating && overview && (
        <EscrowOrderCreateDialog
          open
          masterId={masterId}
          masterLabel={`${overview.masterCode} - ${overview.masterName}`}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  )
}
