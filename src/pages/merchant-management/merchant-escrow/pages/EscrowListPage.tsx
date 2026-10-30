import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCREENS } from '@/app/permissions'
import { useGetEscrowListQuery } from '@/app/services/merchantEscrowApi'
import {
  ButtonComponent,
  CardComponent,
  TabComponent,
  Table
} from '@components/index'
import { AccessPageShell } from '../../merchant-access/components/AccessPageShell'
import { createEscrowListColumns } from '../columns/escrowList.columns'
import { EscrowConfigProposalsPanel } from '../components/EscrowConfigProposalsPanel'
import { EscrowOrderCreateDialog } from '../components/EscrowOrderCreateDialog'
import { EscrowOrderQueue } from '../components/EscrowOrderQueue'
import {
  EscrowFilters,
  type EscrowListFilters
} from '../components/EscrowFilters'
import type { EscrowRow } from '../types/merchantEscrow.types'

const DEFAULT_SIZE = 20
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

// Bỏ ô trống để không gửi `search=` rỗng lên BE.
const clean = (filters: EscrowListFilters): EscrowListFilters => {
  const search = filters.search?.trim()
  return { ...filters, search: search || undefined }
}

/** Danh sách ký quỹ theo Master (FR-MER-0625): lọc, phân trang, bấm mã để vào chi tiết. */
interface EscrowMasterListProps {
  /** Mở hàng chờ duyệt lệnh nạp đã lọc theo Master (SRS 3.6.26 STT 12). */
  onOpenQueue: (masterId: string) => void
}

function EscrowMasterList({ onOpenQueue }: EscrowMasterListProps) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<EscrowListFilters>({})
  const [applied, setApplied] = useState<EscrowListFilters>({})
  // flex.merchant bật `spring.data.web.pageable.one-indexed-parameters=true`: BE và bảng antd đều đánh
  // số trang từ 1, gửi nguyên `page`. Gửi page-1 thì trang 1 và trang 2 cùng ra trang đầu.
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_SIZE)

  const query = useGetEscrowListQuery({
    ...applied,
    page,
    size
  })

  // Master đang được lập lệnh nạp ngay trên dòng (SRS 3.6.26 STT 14); null = dialog đóng.
  const [orderTarget, setOrderTarget] = useState<EscrowRow | null>(null)

  const detailPath = (row: EscrowRow) =>
    SCREENS.MERCHANT_ESCROW_DETAIL.path.replace(':masterId', row.masterId)
  const columns = createEscrowListColumns({
    page,
    pageSize: size,
    onOpen: (row: EscrowRow) => navigate(detailPath(row)),
    // SRS 3.6.26 STT 12: số lệnh chờ duyệt mở hàng chờ phê duyệt đã lọc sẵn Master, ngay trong trang này.
    onOpenOrders: (row: EscrowRow) => onOpenQueue(row.masterId),
    onCreateOrder: setOrderTarget
  })

  return (
    <AccessPageShell
      title='Danh sách ký quỹ'
      count={query.data?.totalElements}
      actions={null}
      toolbar={
        <EscrowFilters
          draft={draft}
          onChange={setDraft}
          onApply={() => {
            setApplied(clean(draft))
            setPage(1)
          }}
          onReset={() => {
            setDraft({})
            setApplied({})
            setPage(1)
          }}
        />
      }
    >
      {query.isError && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          Không tải được danh sách ký quỹ.
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<EscrowRow>
        columns={columns}
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
        rowKey='masterId'
        scroll={{ x: 'max-content' }}
        size='small'
      />
      {/* Chỉ dựng khi mở để mỗi lần mở là form mới và tình trạng ký quỹ được tải lại. */}
      {orderTarget && (
        <EscrowOrderCreateDialog
          open
          masterId={orderTarget.masterId}
          masterLabel={`${orderTarget.code} - ${orderTarget.name}`}
          onClose={() => setOrderTarget(null)}
        />
      )}
    </AccessPageShell>
  )
}

/**
 * Trang Ký quỹ: tab mặc định là danh sách Master; tab "Chờ duyệt cấu hình" là hàng đợi đề xuất
 * cấu hình của mọi Master trong phạm vi, để người duyệt không phải mở từng Master; tab "Chờ duyệt
 * lệnh nạp" là hàng chờ phê duyệt lệnh nạp (SRS 3.6.29) — đặt chung trang thay vì thêm menu mới.
 */
export default function EscrowListPage() {
  const [tab, setTab] = useState('list')
  // Master đã chọn sẵn cho hàng chờ khi mở từ số lệnh chờ duyệt trên dòng; bấm tab tay thì bỏ lọc.
  const [queueMasterId, setQueueMasterId] = useState<string>()
  const openQueue = (masterId: string) => {
    setQueueMasterId(masterId)
    setTab('orders')
  }
  return (
    <div className='flex min-w-0 flex-col gap-3'>
      {/* TabComponent dùng chung không chuyển `activeKey` xuống antd (luôn ở dạng không điều khiển),
          nên đặt `key` theo tab để thanh tab dựng lại đúng tab khi đổi bằng code. */}
      <TabComponent
        key={tab}
        defaultActiveKey={tab}
        onChange={(next) => {
          setQueueMasterId(undefined)
          setTab(next)
        }}
        items={[
          { key: 'list', label: 'Danh sách ký quỹ' },
          { key: 'proposals', label: 'Chờ duyệt cấu hình' },
          { key: 'orders', label: 'Chờ duyệt lệnh nạp' }
        ]}
      />
      {/* Chỉ dựng tab đang mở để hàng chờ duyệt không tải khi người dùng chỉ xem danh sách. */}
      {tab === 'list' && <EscrowMasterList onOpenQueue={openQueue} />}
      {tab === 'proposals' && (
        <CardComponent className='border border-border bg-background shadow-none'>
          <EscrowConfigProposalsPanel />
        </CardComponent>
      )}
      {tab === 'orders' && (
        <CardComponent className='border border-border bg-background shadow-none'>
          <EscrowOrderQueue
            key={queueMasterId ?? 'all'}
            initialMasterId={queueMasterId}
          />
        </CardComponent>
      )}
    </div>
  )
}
