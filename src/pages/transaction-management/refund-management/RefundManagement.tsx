import { CardComponent, DialogModal, ModalComponent, Table } from '@components/index'
import React from 'react'
import DetailRefundModal from './components/DetailRefundModal'
import DialogConfirmRefund from './components/DialogConfirmRefund'
import Column from './columns/Refund.column'
import FormSearch from './components/FormSearch'

const RefundManagement = () => {
  const column = Column()
  return (
    <>
      <div className=' flex flex-col gap-3'>
        <CardComponent content={<FormSearch />} />
        <CardComponent
          content={
            <>
              <Table
                size='small'
                columns={column}
                bordered
                scroll={{ x: 'max-content' }}
              />
            </>
          }
        />
        <ModalComponent
          width='75%'
          onCancel={() => { }}
          onOk={() => { }}
          open={false}
          modalText={<DetailRefundModal />}
          title={<div>
            <p >Chi tiết hoàn: <span className='text-blue-700'> #378-49-802</span></p>
            <div className="flex items-center gap-2 text-sm ">
              <p className='font-medium text-gray-500'>Ngày tạo: 25/02/2022</p>
              <p className='text-yellow-600 bg-yellow-50 px-1 rounded-md border border-yellow-600'>Chờ duyệt</p>
            </div>
          </div>}
        />
        <DialogModal content={<DialogConfirmRefund/>} onCancel={()=>{}} onOk={()=>{}} open={false} title={<><p>Xử lý hoàn tiền</p> <p className='text-gray-500 text-sm'>Mã tham chiếu: #7849-0784-39</p> <hr /></>} />
      </div>
    </>
  )
}

export default RefundManagement
