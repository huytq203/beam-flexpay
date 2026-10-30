import { Can } from '@/app/permissions'
import { ButtonComponent, ExportCsvButton, Table } from '@components/index'
import { AccessPageShell } from '../../merchant-access/components/AccessPageShell'
import { useAccessMerchants } from '../../merchant-access/hooks/useAccessMerchants'
import { createSettlementItemColumns } from '../columns/settlementItem.columns'
import { SETTLEMENT_PAGE_SIZE_OPTIONS } from '../constants/settlementItem.constants'
import { useSettlementItemList } from '../hooks/useSettlementItemList'
import type { SettlementItemRow } from '../types/settlementItem.types'
import {
  describeSettlementError,
  fromTableSorter
} from '../utils/settlementItem.utils'
import { SettlementItemBySub } from './SettlementItemBySub'
import { SettlementItemFilters } from './SettlementItemFilters'
import { SettlementItemTotals } from './SettlementItemTotals'

interface Props {
  onView: (item: SettlementItemRow) => void
}

export function SettlementItemsPanel({ onView }: Props) {
  const { getMerchant, getSubMerchant } = useAccessMerchants()
  const data = useSettlementItemList()
  const { listQuery, totalsQuery } = data
  const columns = createSettlementItemColumns({
    page: data.page,
    pageSize: data.pageSize,
    sort: data.sort,
    onView
  })

  return (
    <AccessPageShell
      title='Danh sách mục quyết toán'
      count={data.hasQuery ? listQuery.data?.totalElements : undefined}
      actions={
        <Can
          screen='MERCHANT_SETTLEMENT_ITEM'
          action='export'
        >
          <ExportCsvButton
            onExport={data.exportCsv}
            loading={data.isExporting}
            disabled={!data.hasQuery || !data.total}
          />
        </Can>
      }
      toolbar={
        <SettlementItemFilters
          draft={data.draft}
          error={data.filterError}
          getMerchant={getMerchant}
          getSub={getSubMerchant}
          onChange={data.setDraft}
          onApply={data.apply}
          onReset={data.reset}
        />
      }
    >
      {data.hasQuery && (
        <SettlementItemTotals
          totals={totalsQuery.data}
          loading={totalsQuery.isFetching}
          // Merchant/Sub sai hoặc ngoài phạm vi làm cả hai API lỗi: chỉ báo một lần ở danh sách.
          error={listQuery.isError ? undefined : totalsQuery.error}
          onRetry={() => void totalsQuery.refetch()}
        />
      )}
      {data.hasQuery && (
        <SettlementItemBySub rows={totalsQuery.data?.bySub ?? []} />
      )}
      {listQuery.isError && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
        >
          {describeSettlementError(listQuery.error, 'list')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void listQuery.refetch()}
          />
        </div>
      )}
      <Table<SettlementItemRow>
        columns={columns}
        dataSource={[...data.items]}
        loading={data.hasQuery && listQuery.isFetching}
        locale={{
          emptyText: data.hasQuery
            ? 'Không có mục quyết toán nào trong khoảng ngày đã chọn'
            : 'Chọn khoảng ngày thanh toán (tối đa 92 ngày) rồi bấm Tìm kiếm'
        }}
        onRefresh={data.hasQuery ? listQuery.refetch : undefined}
        onChange={(_pagination, _filters, sorter, extra) => {
          if (extra.action === 'sort') data.setSort(fromTableSorter(sorter))
        }}
        pagination={{
          current: data.page,
          pageSize: data.pageSize,
          total: data.total,
          showSizeChanger: true,
          pageSizeOptions: SETTLEMENT_PAGE_SIZE_OPTIONS,
          onChange: (page, size) => data.setPagination(page, size)
        }}
        rowKey='id'
        scroll={{ x: 'max-content' }}
        size='small'
      />
    </AccessPageShell>
  )
}
