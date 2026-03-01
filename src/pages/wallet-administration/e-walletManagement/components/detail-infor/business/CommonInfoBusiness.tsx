import { CardComponent, TabComponent } from '@components/index'
import { TYPEDATE } from '@constants/date.constant'
import LegalRecords from '@pages/wallet-administration/e-walletManagement/components/detail-infor/business/components/LegalRecords'
import Representative from '@pages/wallet-administration/e-walletManagement/components/detail-infor/business/components/Representative'
import { StatusKey, StatusLabel } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'
import { businessInfo } from '@pages/wallet-administration/e-walletManagement/constants/TabBusiness.config'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { TabContentProps } from '@pages/wallet-administration/e-walletManagement/types/Tabs.type'
import { formatCurrency } from '@utils/formatNumber'
import dayjs from 'dayjs'
import React, { useState } from 'react'


export interface props {
  data?: AcountItem
}

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
            {activeKey === '1' && <LegalRecords />}

            {activeKey === '2' && <Representative />}

          </div>
        </div>
      </div>
    </>
  )
}

const InforEwallet = ({ data }: props) => {
  if (!data) return null
  const STATUS_CLASS: Record<string, string> = {
    ACTIVE: 'text-green  text-[12px]  font-medium bg-green-100',
    FROZEN: 'text-red  text-[12px]  font-medium bg-red-100',
    WAITING: 'text-blue-600  font-medium bg-blue-50-100',
    REVIEW: 'text-yellow  font-medium bg-yellow-100',
  };
  const typeKeyStatus = data?.status as StatusKey
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
          <p className={`${STATUS_CLASS[typeKeyStatus]} text-[12px] rounded-md px-2`} >{StatusLabel[data.status as StatusKey]}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái EKC:</p>
          <p className='font-medium'>--</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ứng lương:</p>
          <p className='font-medium'>--</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Liên kết NH:</p>
          <p className='font-medium'>--</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Tổng số dư:</p>
          <p className="font-bold ">{formatCurrency(data.balance)}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư khả dụng:</p>
          <p className="font-bold text-green-700  ">{formatCurrency(data.totalCredit)}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư đóng băng:</p>
          <p className="font-bold text-red-700 ">{formatCurrency(data.holdBalance)}</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ngày mở ví:</p>
          <p className="font-medium">{dayjs(data.createdAt).format(TYPEDATE.fullTime)}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ngày xác thực:</p>
          <p className='font-medium'>--</p>
        </div>
        <hr />
        <p>Thông tin xác thực eKYC</p>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái:</p>
          <p className='font-medium'>--</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Độ chính xác AI:</p>
          <p className='font-medium'>--%</p>
        </div>
      </div>

    </>
  )
}
const CommonInfor = ({ accountData }: TabContentProps) => {
  console.log('CommonInforBusiness accountData:', accountData)
  return (
    <div className='flex gap-2 mt-3'>
      <CardComponent
        className='flex-[3]'
        content={<InforUser />}
      />
      <CardComponent
        className='flex-[2]'
        content={<InforEwallet data={accountData} />}
      />
    </div>
  )
}

export default CommonInfor
