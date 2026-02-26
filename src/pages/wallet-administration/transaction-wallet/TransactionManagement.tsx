import { CardComponent, DialogModal, Table } from '@components/index'
import { ArrowCounterClockwiseIcon, ArrowsCounterClockwiseIcon, FileDoneOutlined, FireIcon, SnowflakeIcon } from '@components/icons'
import React, { useState } from 'react'
import DialogFreeze from './components/DialogFreeze'
import DialogRefund from './components/DialogRefund'
import FormSearch from './components/FormSearch'
import UpdateStatusTransaction from './components/UpdateStatusTransaction'
import Column from './columns/Transaction.column'
import useTransaction from './hooks/useTransaction'
import DialogConfirm from './components/DialogConfirm'
import { SkeletonFilterGroup, SkeletonSearchGroup, SkeletonTable } from '@components/ui/skeletons/Skeleton'

const TransactionManagement = () => {

  const {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,

    navigate,
    handleSearch,
    isLoadingGetTransaction
  } = useTransaction()
  // const total=dataSource.
  const columns = Column({navigate})
  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={
        isLoadingGetTransaction ? (
          <SkeletonSearchGroup items={3} className='grid grid-cols-1 md:grid-cols-4  gap-4 mb-4' />
        ) : (
          <FormSearch handleSearch={handleSearch} />
        )
      } />
      <CardComponent content={
        isLoadingGetTransaction ? (
          <SkeletonTable columns={columns?.length || 10} rows={pageSize || 5} />
        ) : (
        <Table
        bordered
        size='small'
        scroll={{ x: 'max-content' }}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: page,
          showSizeChanger: true,
          pageSize: pageSize,
          total: totalElements,
          onChange: (page, pageSize) => {
            setPage(page)
            setPageSize(pageSize)
          }
        }}
      />)} 
      />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogFreeze />} title={<span className='flex items-center gap-2 text-blue-700'><SnowflakeIcon size={18} />Đóng băng giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogRefund />} title={<span className='flex items-center gap-2 text-orange-700'><ArrowCounterClockwiseIcon size={18} />Hoàn tiền giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<UpdateStatusTransaction />} title={<span className='flex items-center gap-2 text-blue'><ArrowsCounterClockwiseIcon size={18} />Cập nhật trạng thái giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogConfirm />} title={<span className='flex items-center gap-2 '><FileDoneOutlined />Duyệt giao dịch</span>} />

    </div>
  )
}

export default TransactionManagement