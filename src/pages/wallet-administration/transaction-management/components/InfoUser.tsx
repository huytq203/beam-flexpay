import { ButtonComponent } from '@components/index'
import React from 'react'

const InfoUser = () => {
  return (
    <>
          <div className="">
            <p className='text-violet-500 font-medium'>5. Người thực hiện</p>
          </div>
          <hr className='my-3' />
          <div className="flex items-center gap-1 mb-3">
            <div className="flex justify-center items-center w-10 h-10 bg-violet-100 rounded-full">A</div>
            <div className="">
              <p className='font-medium text-lg'>Trần Quang A</p>
              <p className='text-gray-500 text-xs'>033333333</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Mã ví:</p>
              <p className='font-medium'>W-43829732</p>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Trạng thái ví:</p>
              <p className='text-green-700 font-medium'>Đang hoạt động</p>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Cấp độ (Tier):</p>
              <p className='text-yellow-700 font-medium bg-yellow-50 px-2 rounded-md'>Gold</p>
            </div>
          </div>
          <div className="flex">

            <ButtonComponent className='w-full' content='Xem hồ sơ User' />
          </div>
        </>
  )
}

export default InfoUser