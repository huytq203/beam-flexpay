import { CardComponent } from '@components/common'
import React from 'react'

const InforUser = () => {

    
  return (
    <>
      <p>Thông tin khách hàng</p>
      <hr />
      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Họ và tên:</p>
            <p className="font-bold">Trần Quang A</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Số điện thoại:</p>
            <p className="font-medium">03333333</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Email:</p>
            <p className="font-medium">A@gmail.com</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Loại tài khoản:</p>
            <p className="font-medium">Cá nhân</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Số CCCD:</p>
            <p className="font-medium">043243217892</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Ngày cấp:</p>
            <p className="font-medium">10/10/2021</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Nơi cấp:</p>
            <p className="font-medium">Cục CS QLHC về TTXH</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Ngày sinh:</p>
            <p className="font-medium">01/01/1999</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Giới tính:</p>
            <p className="font-medium">Nam</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Quê quán:</p>
            <p className="font-medium">Hải Dương</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Nghề nghiệp:</p>
            <p className="font-medium">Tự do</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Chức vụ:</p>
            <p className="font-medium">N/A</p>
        </div>
      </div>
      <hr />
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
      <p>Thông tin khách hàng</p>
      <hr />
      <div className='flex flex-col gap-3'>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Mã ví:</p>
            <p className="font-bold">WALLET_001</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Trạng thái ví:</p>
            <p className="font-medium">Hoạt động</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Trạng thái EKC:</p>
            <p className="font-medium">Đã xác thực</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Ứng lương:</p>
            <p className="font-medium">Đang bật</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Liên kết NH:</p>
            <p className="font-medium">Đã liên kết (VCB)</p>
        </div>
        <hr />
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Tổng số dư:</p>
            <p className="font-medium">5,500,000 đ</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Số dư khả dụng:</p>
            <p className="font-medium">5,000,000 đ</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Số dư đóng băng:</p>
            <p className="font-medium">500,000 đ</p>
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
        <p>Thông tin xác thực eKYC</p>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Trạng thái:</p>
            <p className="font-medium">Đã xác thực</p>
        </div>
        <div className='flex justify-between items-center'>
            <p className='text-gray-500'>Độ chính xác AI:</p>
            <p className="font-medium">91%</p>
        </div>
      </div>
      <div className="flex justify-between gap-4">
  {/* CCCD Trước */}
  
  <div className="flex flex-col items-center gap-2">
    <div className="w-48 h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm">
      Mặt trước
    </div>
    <span className="text-xs text-gray-600">CCCD Trước</span>
  </div>

  {/* CCCD Sau */}
  <div className="flex flex-col items-center gap-2">
    <div className="w-48 h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm">
      Mặt sau
    </div>
    <span className="text-xs text-gray-600">CCCD Sau</span>
  </div>

  {/* Face Match */}
  <div className="flex flex-col items-center gap-2">
    <div className="w-48 h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm">
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
