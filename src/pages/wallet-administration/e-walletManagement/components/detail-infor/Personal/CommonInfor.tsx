import { CardComponent } from '@components/index'
import { CheckCircleFilled, UserIcon, WalletIcon } from '@components/icons'
import React from 'react'

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
          { label: 'Họ và tên', value: 'Trần Quang A', bold: true },
          { label: 'Số điện thoại', value: '03333333' },
          { label: 'Email', value: 'A@gmail.com' },
          { label: 'Loại tài khoản', value: 'Cá nhân' },
          { label: 'Số CCCD', value: '043243217892' },
          { label: 'Ngày cấp', value: '10/10/2021' },
          { label: 'Nơi cấp', value: 'Cục CS QLHC về TTXH' },
          { label: 'Ngày sinh', value: '01/01/1999' },
          { label: 'Giới tính', value: 'Nam' },
          { label: 'Quê quán', value: 'Hải Dương' },
          { label: 'Nghề nghiệp', value: 'Tự do' },
          { label: 'Chức vụ', value: 'N/A' },
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
        <p className='font-medium'>Số 10, ngõ 123, Đường XYZ, TP Hải Dương</p>
      </div>
    </>
  )
}

const InforEwallet = () => {
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
          <p className="font-medium">WALLET_001</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái ví:</p>
          <p className="font-medium text-green-700 bg-green-100 px-1  rounded">Hoạt động</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái EKC:</p>
          <p className="font-medium text-blue-700 bg-blue-100 px-1  rounded">Đã xác thực</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ứng lương:</p>
          <p className="font-medium text-green-700 bg-green-100 px-1  rounded"><CheckCircleFilled /> Đang bật</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Liên kết NH:</p>
          <p className="font-medium text-blue-700">Đã liên kết (VCB)</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Tổng số dư:</p>
          <p className="font-extrabold ">5,500,000 đ</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư khả dụng:</p>
          <p className="font-extrabold text-green-700  ">5,000,000 đ</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Số dư đóng băng:</p>
          <p className="font-extrabold text-red-700 ">500,000 đ</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ngày mở ví:</p>
          <p className="font-medium">01/01/2025</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Ngày xác thực:</p>
          <p className="font-medium">02/01/2025</p>
        </div>
        <hr />
        <p className='font-bold'>Thông tin xác thực eKYC</p>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Trạng thái:</p>
          <p className="font-medium  text-blue-700 bg-blue-100 px-1  rounded">Đã xác thực</p>
        </div>
        <div className='flex justify-between items-center'>
          <p className='text-gray-500'>Độ chính xác AI:</p>
          <p className="font-medium text-green-700">91%</p>
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
const CommonInfor = () => {
  return (
    <div className='flex gap-2 mt-3'>
      <CardComponent
        className='flex-1'
        content={<InforUser />}
      />
      <CardComponent
        className='flex-1'
        content={<InforEwallet />}
      />
    </div>
  )
}

export default CommonInfor
