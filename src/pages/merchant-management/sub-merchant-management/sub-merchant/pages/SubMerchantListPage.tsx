import { useNavigate } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { PlusOutlined, StorefrontIcon } from '@components/icons'
import { ButtonComponent, CardComponent, ExportCsvButton } from '@components/index'

import { ManagementPageHeader } from '../../shared/ManagementPageHeader'
import type { ManagementListState } from '../../shared/management.types'
import { SubMerchantFilters } from '../components/SubMerchantFilters'
import { SubMerchantTable } from '../components/SubMerchantTable'
import { useSubMerchants } from '../hooks/useSubMerchants'
import type { SubMerchantRow } from '../types/subMerchant.type'

interface SubMerchantListPageProps {
  initialListState?: ManagementListState
}

export default function SubMerchantListPage({ initialListState }: SubMerchantListPageProps) {
  const navigate = useNavigate()
  const list = useSubMerchants({ initialListState })
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path
  const isFiltered = Boolean(
    list.filters.query || list.filters.parentMerchantId || list.filters.status || list.filters.createdRange
  )
  const openDetail = (row: SubMerchantRow): void => {
    void navigate(`${basePath}/detail/${row.id}`)
  }
  const openEdit = (row: SubMerchantRow): void => {
    void navigate(`${basePath}/edit/${row.id}`)
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <SubMerchantFilters onReset={list.resetFilters} onSearch={list.setFilters} value={list.filters} />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <section aria-busy={list.listState === 'loading'} aria-label='Danh sách Sub-merchant'>
          <div className='mb-4'>
            <ManagementPageHeader
              actions={<ExportCsvButton disabled={list.total === 0} onExport={() => undefined} totalRows={list.total} />}
              description='Quản lý điểm kinh doanh trực thuộc Merchant cha, trạng thái vận hành và cấu hình kế thừa.'
              primaryAction={
                <Can screen='MERCHANT_SUB_MERCHANT' action='create'>
                  <ButtonComponent content='Thêm Sub-merchant' htmlType='button' icon={<PlusOutlined aria-hidden />} onClick={() => navigate(`${basePath}/create`)} />
                </Can>
              }
              title='Danh sách sub-merchant'
              total={list.total}
            />
          </div>
          <div className='mb-3 flex items-center gap-2 text-xs text-muted-foreground'>
            <StorefrontIcon aria-hidden className='text-secondary-foreground' size={17} />
            Số tiền hiển thị nguyên vẹn theo VND; thao tác trạng thái được ghi Audit Log.
          </div>
          <SubMerchantTable
            filtered={isFiltered}
            onEdit={openEdit}
            onPageChange={list.setPage}
            onRetry={list.retry}
            onToggleStatus={list.toggleStatus}
            onView={openDetail}
            page={list.page}
            pageSize={list.pageSize}
            rows={list.rows}
            state={list.listState}
            total={list.total}
          />
        </section>
      </CardComponent>
    </main>
  )
}
