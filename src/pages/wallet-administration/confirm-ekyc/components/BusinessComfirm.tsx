import { CardComponent, Input, TabComponent, Table } from '@components/index'
import { Column } from '@pages/wallet-administration/confirm-ekyc/columns/BusinessConfirm.column'
import { items } from '@pages/wallet-administration/confirm-ekyc/columns/TabsConfirmEKYC.config'
import { TAB_CONTENT_MAP } from '@pages/wallet-administration/confirm-ekyc/constants/TabConfirmEKYC'
import React, { Suspense, useState } from 'react'

const ContenModalConfirm = () => {
  const [activeKey, setActiveKey] = useState('1')
const column=Column()
  return (
    <>
      <div className='flex gap-3'>
        <div className="flex flex-1 flex-col border p-2 rounded-md ">

        <TabComponent
          activeKey={activeKey}
          items={items}
          onChange={setActiveKey}
        />
        {/* Render tab content dựa trên activeKey */}
        <Suspense fallback={<div>Loading...</div>}>
          {TAB_CONTENT_MAP[activeKey]}
        </Suspense>
        </div>
        <div className='flex-1 border rounded-md '>
          <div className='bg-gray-100 p-3'>
            <p>Dữ liệu trích xuất(OCR)</p>
          </div>
          <div className='grid grid-cols-2 gap-1 py-5'>
            {[
              { label: 'Họ và tên', value: 'Trần Quang A' },
              { label: 'Số điện thoại', value: '03333333' },
              { label: 'Email', value: 'A@gmail.com' },
              { label: 'Loại tài khoản', value: 'Cá nhân' },
              { label: 'Số CCCD', value: '043243217892' },
              { label: 'Ngày cấp', value: '10/10/2021' },
              { label: 'Nơi cấp', value: 'Cục CS QLHC về TTXH' },
              { label: 'Ngày sinh', value: '01/01/1999' },
              { label: 'Giới tính', value: 'Nam' },
              { label: 'Quê quán', value: 'Hải Dương' }
            ].map((item, index) => (
              <div className='col-span-1 mx-2'>
                <span>{item.label}</span>
                <Input
                  disabled
                  content={item.value}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 border rounded-md p-3">
        <p className='font-bold'>Lịch sử xử lý </p>
        <Table bordered scroll={{x:'max-content'}} size='small' columns={column}/>
      </div>
    </>
  )
}
const BusinessComfirm = () => {
  return (
    <div>
      <div>
        <CardComponent content={<ContenModalConfirm />} />
      </div>
    </div>
  )
}

export default BusinessComfirm
