import { CardComponent } from '@components/common'
import React from 'react'

const FormDetail = () => {
  return (
    <div>
      <CardComponent
        content={
          <>
            <div className='grid grid-cols-4'>
              <div className='col-span-1'>
                <img className='w-32 h-32 rounded-full' src="/images/user.jpg" alt="" />
              </div>
              <div className='col-span-3 grid grid-cols-2 gap-1'>
                <div className='col-span-1'>
                  <h1 className='font-bold'>TÊN ĐĂNG NHẬP</h1>
                  <p className='font-medium'>admin_hcm</p>
                </div>
                <div className='col-span-1'>
                  <h1 className='font-bold'>HỌ VÀ TÊN</h1>
                  <p className='font-medium'>Nguyễn Văn A</p>
                </div>
                <div className='col-span-1'>
                  <h1 className='font-bold'>EMAIL</h1>
                  <p className='font-medium'>nguyenvana@domain.com</p>
                </div>
                <div className='col-span-1'>
                  <h1 className='font-bold'>SỐ ĐIỆN THOẠI</h1>
                  <p className='font-medium'>0988 777 666</p>
                </div>
              </div>
            </div>
            <hr className='mt-3' />
            <div className=' flex flex-col gap-2 mt-3'>
              <h1 className='font-bold'>THÔNG TIN HỆ THỐNG</h1>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Nhóm quyền:</p>
                <p className='col-span-2'><span className='bg-blue-500 text-white p-1 rounded-md'>[admin]</span></p>
              </div>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Trạng thái:</p>
                <p className='col-span-2'><span className='bg-green-500 p-1 text-white rounded-md'>Hoạt động</span></p>
              </div>
            </div>
            <hr className='mt-3' />
            <div className='flex flex-col mt-3 gap-2'>
              <h1 className='font-bold'>THÔNG TIN NHẬT KÝ (Audit Log)</h1>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Ngày tạo:</p>
                <p className='col-span-2'><span className=' bg-gray-100 p-1 rounded-md'>10/12/2025 - 10:00:00</span></p>
              </div>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Người tạo:</p>
                <p className='col-span-2'>Super Admin</p>
              </div>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Đăng nhập lần cuối:</p>
                <p className='col-span-2'><span className=' bg-gray-100 p-1 rounded-md'>10/12/2025 - 10:00:00</span></p>
              </div>
            </div>
          </>
        }
      />
    </div>
  )
}

export default FormDetail
