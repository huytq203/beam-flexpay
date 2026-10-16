import {
  CardComponent,
  ExportCsvButton,
  JournalSummary,
  Table
} from '@components/index'
import React from 'react'
import { getRefundErrorText } from '@pages/transaction-management/refund-management/utils/refund.utils'
import { CreateRefundDialog } from './components/CreateRefundDialog'
import { TransactionListError } from './components/TransactionListError'
import FormSearch from './components/FormSearch'
import getColumn from './columns/Transaction.column'
import useTransaction from './hooks/useTransaction'
import {
  SkeletonButton,
  SkeletonInput,
  SkeletonTable,
  SkeletonTitle
} from '@components/ui/skeletons/Skeleton'
import DialogFreeze from './components/DialogFreeze'
import DialogUnfreezeTransaction from './components/DialogUnfreezeTransaction'
import useExportTransactionCsv from './hooks/useExportTransactionCsv'
import { useCreateRefundDialog } from './hooks/useCreateRefundDialog'
import { useTransactionPermissions } from './hooks/useTransactionPermissions'

const TransactionManagement = () => {
  const {
    filter,
    filters,
    clearFilters,
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,
    isFetching,
    handleSearch,
    summary,
    activeStatus,
    handleSummaryStatusChange,
    canFreeze,
    selectedTransaction,
    selectedUnfreezeTransaction,
    unfreezeOrders,
    freezeTargets,
    openingFreezeTransactionId,
    openingUnfreezeTransactionId,
    handleOpenFreeze,
    handleCloseFreeze,
    handleOpenUnfreeze,
    handleCloseUnfreeze,
    refetch,
    isLoadingGetTransaction,
    isError,
    error
  } = useTransaction()
  const { canFull } = useTransactionPermissions()
  const refundDialog = useCreateRefundDialog()

  const { exportFile, isExporting, exportTooltip } =
    useExportTransactionCsv(filter)

  const columns = getColumn({
    canFreeze,
    canRefund: canFull,
    onFreeze: handleOpenFreeze,
    onRefund: refundDialog.open,
    onUnfreeze: handleOpenUnfreeze,
    openingFreezeTransactionId,
    openingUnfreezeTransactionId
  })

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent
        content={
          isLoadingGetTransaction ? (
            <div>
              <SkeletonTitle />
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                {Array.from({ length: 9 }).map((_, index) => (
                  <SkeletonInput key={index} />
                ))}
              </div>

              <div className='flex justify-end mt-3 gap-1'>
                <SkeletonButton size='md' />
                <SkeletonButton size='md' />
              </div>
            </div>
          ) : (
            <FormSearch
              filters={filters}
              handleSearch={handleSearch}
              onReset={clearFilters}
              status={activeStatus}
            />
          )
        }
      />
      <CardComponent
        content={
          <>
            <div className='flex justify-between items-center mb-3'>
              <span className='font-medium text-gray-600 text-lg'>
                Danh sách giao dịch
              </span>
              <ExportCsvButton
                onExport={exportFile}
                loading={isExporting}
                tooltip={exportTooltip}
              />
            </div>
            {isError ? (
              <TransactionListError
                message={getRefundErrorText(error)}
                onRetry={() => void refetch()}
              />
            ) : (
              <>
                <JournalSummary
                  ariaLabel='Tổng quan giao dịch'
                  summary={summary}
                  totalFallback={totalElements}
                  totalLabel='Tổng giao dịch'
                  isLoading={isLoadingGetTransaction}
                  activeStatus={activeStatus}
                  onStatusChange={handleSummaryStatusChange}
                />
                {isLoadingGetTransaction ? (
                  <SkeletonTable
                    columns={columns?.length || 10}
                    rows={pageSize || 5}
                    noContainer
                  />
                ) : (
                  <Table
                    rowKey='id'
                    bordered
                    size='small'
                    scroll={{ x: 'max-content' }}
                    columns={columns}
                    dataSource={dataSource}
                    loading={isFetching}
                    onRefresh={refetch}
                    pagination={{
                      current: page,
                      showSizeChanger: true,
                      pageSize: pageSize,
                      total: totalElements,
                      onChange: (nextPage, nextSize) => {
                        // Hai setter cùng ghi URL từ một bản cũ: chỉ gọi cái thay đổi.
                        if (nextSize !== pageSize) setPageSize(nextSize)
                        else setPage(nextPage)
                      },
                      showTotal: (total, range) =>
                        `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
                    }}
                  />
                )}
              </>
            )}
          </>
        }
      />

      {refundDialog.target && (
        <CreateRefundDialog
          transaction={refundDialog.target}
          onClose={refundDialog.close}
        />
      )}
      <DialogFreeze
        open={selectedTransaction !== null}
        sourceTransactionId={selectedTransaction?.transactionId ?? ''}
        transactionCode={selectedTransaction?.transactionCode}
        transactionAmount={selectedTransaction?.amount ?? 0}
        currency={selectedTransaction?.currency}
        targets={freezeTargets}
        onSuccess={handleCloseFreeze}
        onCancel={handleCloseFreeze}
      />
      <DialogUnfreezeTransaction
        open={selectedUnfreezeTransaction !== null}
        sourceTransactionId={selectedUnfreezeTransaction?.transactionId ?? ''}
        transactionCode={selectedUnfreezeTransaction?.transactionCode}
        currency={selectedUnfreezeTransaction?.currency}
        freezeOrders={unfreezeOrders}
        freezeSummary={selectedUnfreezeTransaction?.freeze}
        onSuccess={handleCloseUnfreeze}
        onCancel={handleCloseUnfreeze}
      />
    </div>
  )
}

export default TransactionManagement
