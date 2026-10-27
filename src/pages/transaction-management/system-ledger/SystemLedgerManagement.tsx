import { CardComponent, ExportCsvButton, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { useState } from 'react'
import { systemLedgerColumns } from './columns/SystemLedger.column'
import FormSearch from './components/FormSearch'
import { LedgerEntryDetail } from './components/LedgerEntryDetail'
import { LedgerLoadError } from './components/LedgerLoadError'
import { LedgerSummary } from './components/LedgerSummary'
import useSystemLedger from './hooks/useSystemLedger'
import type { LedgerRow } from './utils/groupLedgerByJournal'

/**
 * Tách từng bút toán bằng vạch trên đậm hơn ở dòng đầu. Phải `!` vì antd gắn viền
 * thẳng vào `td` với độ ưu tiên cao hơn utility.
 */
const getJournalRowClassName = (row: LedgerRow, index: number) =>
  row.isJournalStart && index > 0
    ? '*:border-t! *:border-t-secondary-foreground/30!'
    : ''

const SystemLedgerManagement = () => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])

  const {
    dataSource,
    totalElements,
    page,
    pageSize,
    handleChangePage,
    filter,
    handleSearch,
    clearFilters,
    summary,
    activeDirection,
    handleSummaryDirectionChange,
    refetch,
    isLoading,
    isFetching,
    isError,
    handleExport,
    isExporting
  } = useSystemLedger()

  // Mở một dòng tại một thời điểm: sổ cái đọc theo từng bút toán, không đối chiếu chéo.
  const handleExpand = (expanded: boolean, record: LedgerRow) => {
    setExpandedRowKeys(expanded ? [record.id] : [])
  }

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent
        content={
          <FormSearch
            key={JSON.stringify(filter)}
            defaultValues={filter}
            handleSearch={handleSearch}
            onReset={clearFilters}
            direction={activeDirection}
          />
        }
      />
      <CardComponent
        content={
          <section aria-labelledby='system-ledger-title'>
            <div className='mb-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h2
                  id='system-ledger-title'
                  className='m-0 font-display text-lg font-semibold'
                >
                  Sổ cái hệ thống
                </h2>
                <ExportCsvButton
                  onExport={handleExport}
                  loading={isExporting}
                  disabled={isError || !totalElements}
                  totalRows={totalElements}
                  // tooltip={`File lấy trọn bộ lọc đang áp, không giới hạn theo trang. ${EXPORT_ORDER_HINT}`}
                />
              </div>
            </div>
            <LedgerSummary
              summary={summary}
              totalFallback={totalElements}
              isLoading={isLoading}
              isError={isError}
              activeDirection={activeDirection}
              onDirectionChange={handleSummaryDirectionChange}
            />
            {isError && (
              <LedgerLoadError
                onRetry={() => void refetch()}
                isRetrying={isFetching}
              />
            )}
            {isLoading ? (
              <SkeletonTable
                columns={systemLedgerColumns.length}
                rows={pageSize}
                noContainer
              />
            ) : (
              <Table<LedgerRow>
                size='small'
                columns={systemLedgerColumns}
                dataSource={dataSource}
                loading={isFetching}
                onRefresh={refetch}
                rowKey='id'
                rowClassName={getJournalRowClassName}
                locale={{
                  emptyText: isError
                    ? 'Chưa có dữ liệu do tải sổ cái thất bại'
                    : 'Không có bút toán nào khớp bộ lọc'
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <LedgerEntryDetail record={record} />
                  ),
                  expandedRowKeys,
                  onExpand: handleExpand
                }}
                pagination={{
                  current: page,
                  pageSize,
                  total: totalElements,
                  onChange: handleChangePage
                }}
              />
            )}
          </section>
        }
      />
    </div>
  )
}

export default SystemLedgerManagement
