import { CardComponent, ExportCsvButton, Table } from '@components/index'
import { InfoCircleOutlined } from '@components/icons'
import { EXPORT_ORDER_HINT } from '@constants/export'
import React from 'react'
import getSystemLedgerColumn from './columns/SystemLedger.column'
import FormSearch from './components/FormSearch'
import { LedgerEntryDetail } from './components/LedgerEntryDetail'
import { LedgerSummary } from './components/LedgerSummary'
import { LEDGER_POSTED_ONLY_NOTE } from './constants/SystemLedger.constant'
import useSystemLedger from './hooks/useSystemLedger'
import { LedgerEntry } from './types/SystemLedger.type'

const SystemLedgerManagement = () => {
  const [expandedRowKeys, setExpandedRowKeys] = React.useState<string[]>([])

  const {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,
    navigate,
    handleSearch,
    summary,
    activeDirection,
    handleSummaryDirectionChange,
    refetch,
    isFetching,
    handleExport,
    isExporting
  } = useSystemLedger()

  const columns = getSystemLedgerColumn({ navigate })

  // Mở một dòng tại một thời điểm — sổ cái đọc theo từng bút toán, không đối chiếu chéo.
  const handleExpand = (expanded: boolean, record: LedgerEntry) => {
    setExpandedRowKeys(expanded ? [record.id] : [])
  }

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent
        content={
          <FormSearch
            handleSearch={handleSearch}
            direction={activeDirection}
          />
        }
      />
      <CardComponent
        content={
          <>
            <div className='mb-3'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <span className='font-medium text-gray-600 text-lg'>
                  Sổ cái hệ thống
                </span>
                <ExportCsvButton
                  onExport={handleExport}
                  loading={isExporting}
                  disabled={totalElements === 0}
                  totalRows={totalElements}
                  tooltip={`File lấy trọn bộ lọc đang áp, không giới hạn theo trang. ${EXPORT_ORDER_HINT}`}
                />
              </div>
              <p className='mt-1 flex max-w-[74ch] items-start gap-1.5 text-xs text-muted-foreground'>
                <InfoCircleOutlined className='mt-0.5 shrink-0' />
                <span>{LEDGER_POSTED_ONLY_NOTE}</span>
              </p>
            </div>
            <LedgerSummary
              summary={summary}
              totalFallback={totalElements}
              isLoading={isFetching && !summary}
              activeDirection={activeDirection}
              onDirectionChange={handleSummaryDirectionChange}
            />
            <Table
              bordered
              size='small'
              scroll={{ x: 'max-content' }}
              columns={columns}
              dataSource={dataSource}
              loading={isFetching}
              onRefresh={refetch}
              rowKey='id'
              expandable={{
                expandedRowRender: (record: LedgerEntry) => (
                  <LedgerEntryDetail record={record} />
                ),
                rowExpandable: () => true,
                expandedRowKeys,
                onExpand: handleExpand
              }}
              pagination={{
                current: page,
                showSizeChanger: true,
                pageSize,
                total: totalElements,
                onChange: (page, pageSize) => {
                  setPage(page)
                  setPageSize(pageSize)
                },
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
              }}
            />
          </>
        }
      />
    </div>
  )
}

export default SystemLedgerManagement
