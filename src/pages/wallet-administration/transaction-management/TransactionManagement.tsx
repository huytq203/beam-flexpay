import { CardComponent, DialogModal, Table } from '@components/common'
import { ArrowCounterClockwiseIcon, ArrowsCounterClockwiseIcon, FireIcon, SnowflakeIcon } from '@components/icons/common'
import React from 'react'
import DialogFreeze from './components/DialogFreeze'
import DialogRefund from './components/DialogRefund'
import FormSearch from './components/FormSearch'
import UpdateStatusTransaction from './components/UpdateStatusTransaction'
import { Column } from './config/Transaction.column'

const TransactionManagement = () => {
  const columns = Column()
  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch />} />
      <CardComponent content={<Table bordered size='small' scroll={{ x: 'max-content' }} columns={columns} />} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogFreeze/>} title={<span className='flex items-center gap-2 text-blue-700'><SnowflakeIcon size={18}/>Đóng băng giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={false} content={<DialogRefund/>} title={<span className='flex items-center gap-2 text-orange-700'><ArrowCounterClockwiseIcon size={18}/>Hoàn tiền giao dịch</span>} />
      <DialogModal onCancel={() => { }} onOk={() => { }} open={true} content={<UpdateStatusTransaction/>} title={<span className='flex items-center gap-2 text-blue'><ArrowsCounterClockwiseIcon size={18}/>Cập nhật trạng thái giao dịch</span>} />

    </div>
  )
}

export default TransactionManagement