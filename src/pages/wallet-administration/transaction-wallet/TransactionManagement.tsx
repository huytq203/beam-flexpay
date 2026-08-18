import { CardComponent, DialogModal, Table } from '@components/index'
import { ArrowCounterClockwiseIcon, ArrowsCounterClockwiseIcon, FileDoneOutlined } from '@components/icons'
import React from 'react'
import DialogRefund from './components/DialogRefund'
import FormSearch from './components/FormSearch'
import UpdateStatusTransaction from './components/UpdateStatusTransaction'
import getColumn from './columns/Transaction.column'
import useTransaction from './hooks/useTransaction'
import DialogConfirm from './components/DialogConfirm'
import { SkeletonButton, SkeletonInput, SkeletonTable, SkeletonTitle } from '@components/ui/skeletons/Skeleton'
import DialogFreeze from './components/DialogFreeze'
import DialogUnfreezeTransaction from './components/DialogUnfreezeTransaction'

const TransactionManagement = () => {

  const {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,
    isFetching,
    handleSearch,
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
  } = useTransaction()

  const columns = getColumn({
    canFreeze,
    onFreeze: handleOpenFreeze,
    onUnfreeze: handleOpenUnfreeze,
    openingFreezeTransactionId,
    openingUnfreezeTransactionId
  })

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={
        isLoadingGetTransaction ? (
          <div>
            <SkeletonTitle />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <SkeletonInput key={index} />
              ))}
            </div>

            <div className="flex justify-end mt-3 gap-1">
              <SkeletonButton size="md" />
              <SkeletonButton size="md" />
            </div>
          </div>
        ) : (
          <FormSearch handleSearch={handleSearch} />
        )
      } />
      <CardComponent content={
        isLoadingGetTransaction ? (
          <SkeletonTable columns={columns?.length || 10} rows={pageSize || 5} noContainer />
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
              onChange: (page, pageSize) => {
                setPage(page)
                setPageSize(pageSize)
              },
              showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
            }}
          />
        )
      } />

      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogRefund />} title={<span className='flex items-center gap-2 text-orange-700'><ArrowCounterClockwiseIcon size={18} />Hoàn tiền giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<UpdateStatusTransaction />} title={<span className='flex items-center gap-2 text-blue'><ArrowsCounterClockwiseIcon size={18} />Cập nhật trạng thái giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogConfirm />} title={<span className='flex items-center gap-2'><FileDoneOutlined />Duyệt giao dịch</span>} />
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
