import { CardComponent, TabComponent } from '@components/common'
import CommonInfor from '@pages/wallet-administration/e-walletManagement/components/detail-infor/personal/CommonInfor'
import CommonInforBusiness from '@pages/wallet-administration/e-walletManagement/components/detail-infor/business/CommonInfor'
import useDetailUser from '@pages/wallet-administration/e-walletManagement/hooks/useDetailUser'
import React from 'react'
import { items } from './configs/Tabs.config'
import { useParams } from 'react-router-dom'

const InforUser = () => {
  return (
    <>
      <div className='flex justify-between'>
        <div className='flex items-center gap-5'>
          <div className='border w-16 h-16 bg-gray-200 flex justify-center items-center rounded-full '>
            NA
          </div>
          <div className=''>
            <p>Nguyen A</p>
            <p>nguyenA@gmail.com - 033333333</p>

            <p>
              <span>Hạng bạc</span>
              <span>Đã xác thưc EKC</span>
            </p>
          </div>
        </div>
        <div className='flex flex-col items-end'>
          <p>Tổng số dư khả dụng</p>
          <p>
            <span>5,000,000</span>
            <span>VND</span>
          </p>
          <p className='text-red-700'>* Đang đóng băng: 500,000 VND</p>
        </div>
      </div>
    </>
  )
}

const DetailUser = () => {
  const { setActiveKey, activeKey } = useDetailUser()
  const { id } = useParams<{ id: string }>()
  return (
    <div>
      <CardComponent
        className='mb-3'
        content={<InforUser />}
      />
      <div className='px-5  bg-white rounded-md'>
        <TabComponent
          activeKey={activeKey}
          items={items}
          onChange={setActiveKey}
        />
      </div>

      <div className=''>
        <div>
          {activeKey === '1' && id === '1' && <CommonInfor />}

          {activeKey === '1' && id === '2' && <CommonInforBusiness />}

          {activeKey === '2' && id === '2' && '123'}
        </div>
      </div>
    </div>
  )
}

export default DetailUser
