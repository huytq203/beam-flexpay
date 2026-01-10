import { CardComponent, DialogModal, TabComponent } from '@components/common'
import useDetailUser from '@pages/wallet-administration/e-walletManagement/hooks/useDetailUser'
import React, { Suspense, lazy, useMemo } from 'react'
import { items } from './configs/Tabs.config'
import { useParams } from 'react-router-dom'
import { TabContentMap } from './types/Tabs.type'
import { TAB_CONTENT_MAP } from './constants/Tabs.constant'
import { BankFilled, CheckCircleFilled, SnowflakeIcon } from '@components/icons/common'
import DialogAccount from './components/detail-infor/personal/components/DialogAccount'
import DialogConfirmLinkAccount from './components/detail-infor/personal/components/DialogConfirmLinkAccount'
import DialogFreeze from '@pages/wallet-administration/transaction-management/components/DialogFreeze'
import DialigLockAccount from './components/detail-infor/personal/components/DialogLockAccount'
import DialogFreezeWallet from './components/detail-infor/personal/components/DialogFreezeWallet'



const InforUser = () => {
  return (
    <>
      <div className='flex justify-between'>
        <div className='flex items-center gap-5'>
          <div className='border w-16 h-16 bg-gray-200 flex justify-center items-center rounded-full '>
            NA
          </div>
          <div className='text-gray-600 flex flex-col gap-1' >
            <p className='font-extrabold text-xl'>Nguyen A</p>
            <p>nguyenA@gmail.com - 033333333</p>
            <p className='flex gap-2 justify-start items-center text-sm font-medium'>
              <span className='bg-gray-200 px-1 rounded '>Hạng bạc</span>
              <span className='flex gap-1 text-green-700 bg-green-100 px-1 rounded' ><CheckCircleFilled/>Đã xác thực KYC</span>
            </p>
          </div>
        </div>
        <div className='flex flex-col items-end text-gray-600 '>
          <p className='font-medium'>Tổng số dư khả dụng</p>
          <p className='flex justify-end items-end gap-1'>
            <span className='text-green-700 text-3xl font-bold'>5,000,000</span>
            <span className='text-sm font-bold'>VND</span>
          </p>
          <p className='text-red-700 text-lg'>* Đang đóng băng: 500,000 VND</p>
        </div>
      </div>
    </>
  )
}

const DetailUser = () => {
  const { setActiveKey, activeKey } = useDetailUser()
  const { id } = useParams<{ id: string }>()

  const content = useMemo(() => {
    return TAB_CONTENT_MAP[activeKey]?.[id || ''] || null
  }, [activeKey, id])

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
          <Suspense fallback={<div className='flex justify-center items-center'>Loading...</div>}>
            {content}
          </Suspense>
        </div>
      </div>
      <DialogModal mode='CONFIRM' content={<DialogAccount/>} onCancel={()=>{}} onOk={()=>{}} open={false} title={<span><BankFilled/> Cập nhật thông tin tài khoản</span>} />
      
      <DialogModal mode='CONFIRM' content={<DialogConfirmLinkAccount/>} onCancel={()=>{}} onOk={()=>{}} open={false} title={<span><BankFilled/> Xác thực liên kết thủ công</span>} />
      <DialogModal mode='WARNING' onCancel={() => { }} onOk={() => { }} open={false} content={<DialogFreeze />} title={<span className='flex items-center gap-2 text-blue-700'><SnowflakeIcon size={18} />Mở băng giao dịch</span>} />
      <DialogModal mode='DELETE' onCancel={() => { }} onOk={() => { }} open={false} content={<DialigLockAccount />} title={<span className='flex items-center gap-2 text-blue-700 text-red '>Khóa tài khoản</span>} />
    </div>
  )
}

export default DetailUser
