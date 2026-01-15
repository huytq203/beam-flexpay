import React from 'react'

const FeeNCC = () => {
  return (
    <>
          <div className="">
            <p className='font-medium text-yellow-500'>6. Chi phí NCC (COST)</p>
          </div>
          <hr className='my-3' />
          <div className="flex flex-col gap-3 px-3">
            <div className="flex justify-between items-center">
              <p className='text-gray-500'>Nhà cung cấp:</p>
              <p className='font-medium'>Napas</p>
            </div>
            <div className="flex justify-between items-center p-1 bg-orange-100  rounded-md">
              <p className=' font-medium'>Tổng phí phải trả:</p>
              <p>5,500 VND</p>
            </div>
            <ul className='list-disc pl-5'>
              <li>
                <div className="flex justify-between items-center text-sm">
                  <p className='text-gray-500'>Cố định:</p>
                  <p className='text-gray-500'>500 VND</p>
                </div>
              </li>
              <li>
                <div className="flex justify-between items-center text-sm">
                  <p className='text-gray-500'>% (0.5%):</p>
                  <p className='text-gray-500'>5000 VND</p>
                </div>
              </li>
            </ul>


          </div>
          <div className="mt-3 text-gray-500 italic text-sm">
            <p>Cấu hình phí áp dụng 01/01/2025</p>

          </div>
        </>
  )
}

export default FeeNCC