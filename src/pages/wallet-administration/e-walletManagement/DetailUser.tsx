import { CardComponent, DialogModal, TabComponent } from '@components/index'
import useDetailUser from '@pages/wallet-administration/e-walletManagement/hooks/useDetailUser'
import React, { Suspense, useMemo } from 'react'
import { items } from './constants/TabBusiness.config'
import { TAB_CONTENT_MAP } from './constants/TabDetail.constant'
import { BankFilled } from '@components/icons'
import DialogAccount from './components/detail-infor/Personal/components/DialogAccount'
import DialogConfirmLinkAccount from './components/detail-infor/Personal/components/DialogConfirmLinkAccount'
import DialigLockAccount from './components/detail-infor/Personal/components/DialogLockAccount'
import { AcountItem } from './types/ResponseWalletAccount.type'
import { formatNumber } from '../../../app/utils/formatNumber'
import { ContentEKYC } from '@type/apiResponseEKYC'


interface props {
  data?: AcountItem
  dataEKYC?: ContentEKYC
}
const InforUser = ({ data, dataEKYC }: props) => {
  if (!data) return null

  const displayName = dataEKYC?.fullName || data.ownerUsername || 'NA';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <div className='flex justify-between'>
        <div className='flex items-center gap-5'>
          <div className='border w-16 h-16 bg-gray-200 flex justify-center items-center rounded-full '>
            <p className='font-bold text-[24px]'>{displayInitial}</p>
          </div>
          <div className='text-gray-600 flex flex-col gap-1' >
            <p className='font-extrabold text-xl'>{displayName}</p>
            <p>{displayName} - {dataEKYC?.username || data.ownerUsername}</p>

          </div>
        </div>
        <div className='flex flex-col items-end text-gray-600 '>
          <p className='font-medium'>Tổng số dư khả dụng</p>
          <p className='flex justify-end items-end gap-1'>
            <span className='text-green-700 text-2xl font-bold'>{formatNumber(data.availableBalance ?? (data.balance - data.holdBalance))}</span>
            <span className='text-sm font-bold'>{data.currency}</span>
          </p>
          <p className='text-red-700 '>* Đang đóng băng: {formatNumber(data.holdBalance) + ' ' + data.currency} </p>
        </div>
      </div>
    </>
  )
}

const DetailUser = () => {



  const { setActiveKey, activeKey, getAccountById, getEKYCById ,linkedBanks} = useDetailUser()
  const ownerType = getAccountById?.ownerType;
  const firstGroup = getEKYCById?.content?.[0]
  const dataEKYC = useMemo(() => {
    const latestAttempt = firstGroup?.attempts?.[0]
    return latestAttempt ? {
      ...latestAttempt,
      userId: firstGroup.userId,
      username: firstGroup.username,
      email: firstGroup.email,
      occupation: firstGroup.occupation,
      position: firstGroup.position,
      currentAddress: firstGroup.currentAddress
    } : undefined
  }, [firstGroup])


  const content = useMemo(() => {
    if (!ownerType) return null
    const tabContent = TAB_CONTENT_MAP[activeKey]?.[ownerType]
    if (!tabContent) return null
    if (typeof tabContent === 'function') {
      // Truyền nhiều data sources vào đây khi cần
      return tabContent({
        accountData: getAccountById,
        ekycData: dataEKYC,
        linkedBanks:linkedBanks,
        // transactionData: getTransactions?.data,
        // bankAccountData: getBankAccounts?.data,
      })
    }
    return tabContent
  }, [activeKey, ownerType, getAccountById, dataEKYC, linkedBanks])

  return (
    <div>
      <CardComponent
        className='mb-3!'
        content={<InforUser data={getAccountById} dataEKYC={dataEKYC} />}
      />
      <div className='px-5! mb-3! bg-white rounded-md'>
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
      <DialogModal mode='CONFIRM' content={<DialogAccount />} onCancel={() => { }} onOk={() => { }} open={false} title={<span><BankFilled /> Cập nhật thông tin tài khoản</span>} />

      <DialogModal mode='CONFIRM' content={<DialogConfirmLinkAccount />} onCancel={() => { }} onOk={() => { }} open={false} title={<span><BankFilled /> Xác thực liên kết thủ công</span>} />
      <DialogModal mode='DELETE' onCancel={() => { }} onOk={() => { }} open={false} content={<DialigLockAccount />} title={<span className='flex items-center gap-2 text-blue-700 text-red '>Khóa tài khoản</span>} />
    </div>
  )
}

export default DetailUser
