import { CardComponent } from '@components/index'
import { CheckCircleFilled, UserIcon, WalletIcon } from '@components/icons'
import React from 'react'
import { TabContentProps } from '../../../types/Tabs.type'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { formatCurrency } from '@utils/formatNumber'
import dayjs from 'dayjs'
import { TYPEDATE } from '@constants/date.constant'
import { StatusKey, StatusLabel } from '@pages/wallet-administration/e-walletManagement/constants/Ewallet.constant'
interface props {
  data?: AcountItem
}
const InforUser = () => {


  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-teal-50 rounded-lg">
          <UserIcon className="text-blue" weight="fill" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Thông tin khách hàng</h2>
      </div>
      <hr className='my-3' />
      <div className="space-y-1">
        {[
          { label: 'Họ và tên', value: '--', bold: true },
          { label: 'Số điện thoại', value: '--' },
          { label: 'Email', value: '--' },
          { label: 'Loại tài khoản', value: '--' },
          { label: 'Số CCCD', value: '--' },
          { label: 'Ngày cấp', value: '--' },
          { label: 'Nơi cấp', value: '--' },
          { label: 'Ngày sinh', value: '--' },
          { label: 'Giới tính', value: '--' },
          { label: 'Quê quán', value: '--' },
          { label: 'Nghề nghiệp', value: '--' },
          { label: 'Chức vụ', value: '--' },
        ].map((item, index) => (
          <div key={index} className="flex justify-between items-start py-2 hover:bg-gray-100 -mx-2 px-2 rounded transition-colors">
            <span className=" text-gray-600 min-w-[140px]">{item.label}:</span>
            <span className={` text-right ${item.bold ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <hr className='my-3' />
      <div className="">
        <p className='text-gray-500'>Địa chỉ thường trú</p>
        <p className='font-medium'>--</p>
      </div>
    </>
  )
}

const InforEwallet = ({data}:props) => {
  if(!data) return null
    const STATUS_CLASS: Record<string, string> = {
    ACTIVE: 'text-green text-[12px]  font-medium bg-green-100',
    LOCKED: 'text-red  text-[12px]  font-medium bg-red-100',
    WAITING: 'text-blue-600 text-[12px]  font-medium bg-blue-50-100',
    REVIEW: 'text-yellow text-[12px]  font-medium bg-yellow-100',
  };
   const typeKeyStatus = data?.status as StatusKey
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2  bg-teal-50  rounded-lg">
          <WalletIcon className="text-blue" weight="fill" size={20} />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Thông tin ví</h2>
      </div>
      <hr className='my-3' />
      <div className='flex flex-col gap-3 '>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Mã ví:</p>
          <p className="font-medium">{data.glCode}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái ví:</p>
          <p className={`${STATUS_CLASS[typeKeyStatus]} text-[12px] rounded-md px-2`} >{StatusLabel[data.status as StatusKey]}</p>
        </div>
        {
          data.status === StatusKey.LOCKED && (
            <div className='flex justify-between items-center'>
              <p className='text-gray-500'>Lý do khóa:</p>
              <p className="font-medium ">{data?.lockedReason}</p>
            </div>
          )
        }
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái EKC:</p>
          <p className="font-medium text-blue-700 bg-blue-100 px-2  rounded-md text-sm">--</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ứng lương:</p>
          {/* <p className="font-medium text-green-700 bg-green-100 px-2  rounded-md text-sm"><CheckCircleFilled /> Đang bật</p> */}
          <p className="font-medium text-green-700 bg-green-100 px-2  rounded-md text-sm">--</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Liên kết NH:</p>
          <p className="font-medium text-blue-700">--</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Tổng số dư:</p>
          <p className="font-bold ">{formatCurrency(data.balance)}</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư khả dụng:</p>
          <p className="font-bold text-green-700  ">{formatCurrency(data.availableBalance??(data.balance-data.holdBalance))}</p>
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
          <p className="font-medium">--</p>
        </div>
        <hr />
        <p className='font-bold'>Thông tin xác thực eKYC</p>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái:</p>
          <p className="font-medium  text-blue-700 bg-blue-100 px-2  rounded-md text-sm">--</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Độ chính xác AI:</p>
          <p className="font-medium text-green-700">--%</p>
        </div>
      </div>
      <div className="flex justify-between gap-4 mt-3">
        {/* CCCD Trước */}

        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm">
            Mặt trước
          </div>
          <span className="text-xs text-gray-600">CCCD Trước</span>
        </div>

        {/* CCCD Sau */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm">
            Mặt sau
          </div>
          <span className="text-xs text-gray-600">CCCD Sau</span>
        </div>

        {/* Face Match */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm">
            Chân dung
          </div>
          <span className="text-xs text-gray-600">Face Match</span>
        </div>
      </div>
    </>
  )
}
const CommonInfor = ({ accountData }: TabContentProps) => {
  return (
    <div className='flex gap-2 mt-3'>
      <CardComponent
        className='flex-1'
        content={<InforUser />}
      />
      <CardComponent
        className='flex-1'
        content={<InforEwallet data={accountData}/>}
      />
    </div>
  )
}

export default CommonInfor
