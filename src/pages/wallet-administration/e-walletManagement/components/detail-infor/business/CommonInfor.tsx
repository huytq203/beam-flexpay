import { CardComponent, TabComponent } from '@components/index'
import LegalRecords from '@pages/wallet-administration/e-walletManagement/components/detail-infor/business/components/LegalRecords'
import Representative from '@pages/wallet-administration/e-walletManagement/components/detail-infor/business/components/Representative'
import { businessInfo } from '@pages/wallet-administration/e-walletManagement/columns/Tabs.config'
import React, { useState } from 'react'



 
const InforUser = () => {
  const [activeKey, setActiveKey] = useState('1')

  return (
    <>
    <div className="flex flex-col">

      <TabComponent
        activeKey={activeKey}
        items={businessInfo}
        onChange={setActiveKey}
        className='!w-full '
      />

        <div className=''>
        <div>
          {activeKey === '1' &&   <LegalRecords />}

          {activeKey === '2' &&  <Representative />}

        </div>
      </div>
    </div>
    </>
  )
}

const InforEwallet = () => {
  return (
    <>
      <p>Thông tin khách hàng</p>
      <hr />
      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Mã ví:</p>
          <p className='font-bold'>WALLET_001</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái ví:</p>
          <p className='font-medium'>Hoạt động</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái EKC:</p>
          <p className='font-medium'>Đã xác thực</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ứng lương:</p>
          <p className='font-medium'>Đang bật</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Liên kết NH:</p>
          <p className='font-medium'>Đã liên kết (VCB)</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Tổng số dư:</p>
          <p className='font-medium'>5,500,000 đ</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư khả dụng:</p>
          <p className='font-medium'>5,000,000 đ</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư đóng băng:</p>
          <p className='font-medium'>500,000 đ</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ngày mở ví:</p>
          <p className='font-medium'>01/01/2025</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ngày xác thực:</p>
          <p className='font-medium'>02/01/2025</p>
        </div>
        <hr />
        <p>Thông tin xác thực eKYC</p>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái:</p>
          <p className='font-medium'>Đã xác thực</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Độ chính xác AI:</p>
          <p className='font-medium'>91%</p>
        </div>
      </div>
     
    </>
  )
}
const CommonInfor = () => {
  return (
    <div className='flex gap-2 mt-3'>
      <CardComponent
        className='flex-[3]'
        content={<InforUser />}
      />
      <CardComponent
        className='flex-[2]'
        content={<InforEwallet />}
      />
    </div>
  )
}

export default CommonInfor
