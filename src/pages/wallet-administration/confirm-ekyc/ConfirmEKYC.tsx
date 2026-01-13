import { CardComponent, DialogModal, ModalComponent, Table } from '@components/common'
import { useSVG } from '@hooks/useSVG'
import React from 'react'
import FormSearch from './components/FormSearch'
import PersonalConfirm from './components/PersonalConfirm'
import BusinessComfirm from './components/BusinessComfirm'
import { Column } from './configs/ConfirmEKYC.column'
import useConfirmEKYC from './hooks/useConfirmEKYC'
import DialogReject from '@pages/wallet-administration/confirm-ekyc/components/DialogReject'
import DialogCancel from '@pages/wallet-administration/confirm-ekyc/components/DialogCancel'

const ConfirmEKYC = () => {
  const { dataEKYC } = useConfirmEKYC()
  const { svg } = useSVG()
  const columns = Column({ svg })
  console.log(dataEKYC)
  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch />} />
      <CardComponent content={<Table bordered size='small' scroll={{ x: 'max-content' }} columns={columns} dataSource={dataEKYC} />} />

      <ModalComponent
        onCancel={() => { }}
        onOk={() => { }}
        open={false}
        width='75%'
        modalText={<BusinessComfirm/>}
        
        />
        <DialogModal mode='DELETE' okText='Từ chối' onCancel={()=>{}} onOk={()=>{}} open={false} content={<DialogReject/>} title={<span className='text-red-600'>Từ chối hồ sơ</span>}  />
        <DialogModal mode='DELETE' okText='Hủy xác thực' onCancel={()=>{}} onOk={()=>{}} open={false} content={<DialogCancel/>} title={<span className='text-red-600'>Hủy xác thực</span>}  />
    </div>
  )
}

export default ConfirmEKYC