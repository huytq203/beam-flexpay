import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SCREENS } from '@/app/permissions'
import { useGetEscrowListQuery } from '@/app/services/merchantEscrowApi'
import { ButtonComponent, Table } from '@components/index'
import { AccessPageShell } from '../../merchant-access/components/AccessPageShell'
import { createEscrowListColumns } from '../columns/escrowList.columns'
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
export default function EscrowListPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState<EscrowListFilters>({})
  const [applied, setApplied] = useState<EscrowListFilters>({})
  // Trang BE đánh số từ 0, bảng antd từ 1.
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(DEFAULT_SIZE)

  const query = useGetEscrowListQuery({
    ...applied,
    page: page - 1,
    size
  })

  const columns = createEscrowListColumns({
    page,
    pageSize: size,
    onOpen: (row: EscrowRow) =>
      navigate(
        SCREENS.MERCHANT_ESCROW_DETAIL.path.replace(':masterId', row.masterId)
      )
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
    </AccessPageShell>
  )
}
