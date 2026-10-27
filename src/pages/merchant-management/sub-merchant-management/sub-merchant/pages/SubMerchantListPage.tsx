import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  useGetSubMerchantPageQuery,
  useSetSubMerchantLockedMutation
} from '@/app/services/merchantHierarchyApi'
import { Can, SCREENS } from '@/app/permissions'
import { PlusOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton
} from '@components/index'

import { ManagementPageHeader } from '../../shared/ManagementPageHeader'
import { toSubMerchantRow } from '../../shared/hierarchyAdapter'
import type { ManagementListState } from '../../shared/management.types'
import { SubMerchantFilters } from '../components/SubMerchantFilters'
import { SubMerchantDetailModal } from '../components/SubMerchantDetailModal'
import { SubMerchantTable } from '../components/SubMerchantTable'
import { useSubMerchantListFilters } from '../hooks/useSubMerchantListFilters'
import {
  useSubMerchantExport,
  type SubMerchantExportParams
} from '../hooks/useSubMerchantExport'
import type { SubMerchantRow } from '../types/subMerchant.type'
import { globalMessage } from '@hooks/useMessage'

interface SubMerchantListPageProps {
  initialListState?: ManagementListState
}

export default function SubMerchantListPage({
  initialListState
}: SubMerchantListPageProps) {
  const navigate = useNavigate()
  const { filters, page, pageSize, search, reset, changePage } =
    useSubMerchantListFilters()
  const [viewingId, setViewingId] = useState<string>()
  const listParams: SubMerchantExportParams = {
    merchantId: filters.parentMerchant?.id,
    name: filters.query.trim() || undefined,
    status:
      filters.status === 'ACTIVE' ||
      filters.status === 'INACTIVE' ||
      filters.status === 'TERMINATED'
        ? filters.status
        : undefined
  }
  const query = useGetSubMerchantPageQuery({
    page,
    size: pageSize,
    ...listParams
  })
  const exporter = useSubMerchantExport(listParams)
  const [setLocked] = useSetSubMerchantLockedMutation()
  const rows = query.data?.content.map(toSubMerchantRow) ?? []
  const total = query.data?.totalElements ?? 0
  const listState =
    initialListState ??
    (query.isLoading || (query.isFetching && !query.data)
      ? 'loading'
      : query.isError
        ? 'error'
        : total === 0
          ? 'empty'
          : 'success')
  const toggleStatus = async (id: string, reason: string): Promise<boolean> => {
    const row = rows.find((item) => item.id === id)
    if (
      !row ||
      row.status === 'TERMINATED' ||
      row.status === 'SUSPENDED_BY_PARENT'
    )
      return false
    try {
      await setLocked({ id, lock: row.status === 'ACTIVE', reason }).unwrap()
      globalMessage.success(
        row.status === 'ACTIVE'
          ? 'Đã khóa Sub-merchant'
          : 'Đã mở khóa Sub-merchant'
      )
      return true
    } catch {
      globalMessage.error('Không thể cập nhật trạng thái Sub-merchant')
      return false
    }
  }
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path
  const isFiltered = Boolean(
    filters.query || filters.parentMerchant || filters.status
  )
  const openDetail = (row: SubMerchantRow): void => {
    setViewingId(row.id)
  }
  const openEdit = (row: SubMerchantRow): void => {
    void navigate(`${basePath}/edit/${row.id}`)
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <SubMerchantFilters
          onReset={reset}
          onSearch={search}
          value={filters}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <section
          aria-busy={listState === 'loading'}
          aria-label='Danh sách Sub-merchant'
        >
          <div className='mb-4'>
            <ManagementPageHeader
              actions={
                <Can
                  screen='MERCHANT_SUB_MERCHANT'
                  action='export'
                >
                  <ExportCsvButton
                    onExport={exporter.exportCsv}
                    loading={exporter.isExporting}
                    disabled={total === 0}
                  />
                </Can>
              }
              primaryAction={
                <Can
                  screen='MERCHANT_SUB_MERCHANT'
                  action='create'
                >
                  <ButtonComponent
                    content='Thêm Sub-merchant'
                    htmlType='button'
                    icon={<PlusOutlined aria-hidden />}
                    onClick={() => navigate(`${basePath}/create`)}
                  />
                </Can>
              }
              title='Danh sách sub-merchant'
            />
          </div>
          <SubMerchantTable
            filtered={isFiltered}
            onEdit={openEdit}
            onPageChange={changePage}
            onRetry={() => void query.refetch()}
            onToggleStatus={toggleStatus}
            onView={openDetail}
            page={page}
            pageSize={pageSize}
            rows={rows}
            state={listState}
            total={total}
          />
        </section>
      </CardComponent>
      <SubMerchantDetailModal
        subMerchantId={viewingId}
        onClose={() => setViewingId(undefined)}
      />
    </main>
  )
}
