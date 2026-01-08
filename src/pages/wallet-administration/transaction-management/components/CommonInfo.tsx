import { CheckCircleFilled, EyeOutlined } from '@components/icons/common'
import { CopyableText, TooltipComponent } from '@components/common'
import React from 'react'

const CommonInfo = () => {
  return (
      <>

              <div className=' flex justify-between '>
                <span className='text-blue-700 font-medium'>1. Thông tin chung</span>
                <span className='flex justify-center items-center gap-1 bg-green-100 py-1 px-2 rounded-full text-green-700 text-xs'><CheckCircleFilled />Thành công</span>
              </div>
              <hr className='my-3' />
              <div className='grid grid-cols-3 gap-3 '>
                <div className='col-span-1'>
                  <CopyableText
                    label="Mã giao dịch:"
                    value="123456-RTX"
                  />
                </div>
                <div className='col-span-1'>
                  <div className=''>
                    <p className='text-gray-500'>Loại & Phương thức:</p>
                    <div className='font-medium'>
                      <p>Nạp tiền (Deposit)</p>
                      <p>VISA</p>
                    </div>
                  </div>
                </div>
                <div className='col-span-1'>
                  <CopyableText
                    label="Mã chuẩn chi:"
                    value="RTX-456"
                  />
                </div>
                <div className='col-span-1'>
                  <CopyableText
                    label="Mã đối soát:"
                    value="SET-678"
                  />
                </div>
                <div className='col-span-1'>
                  <div className=''>
                    <p className='text-gray-500'>Ngân hàng:</p>
                    <div className='font-medium'>
                      <p>Vietcombank(VCB)</p>

                    </div>
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className=''>
                    <p className='text-gray-500'>Số tài khoản:</p>
                    <div className='font-medium'>
                      <div className="flex items-center gap-1">
                        <span>213245******4235</span>
                        <TooltipComponent title="Xem chi tiết" children={<EyeOutlined className='text-gray-500' />} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className=''>
                    <p className='text-gray-500'>Thời gian tạo:</p>
                    <p className='font-medium'>20/10/2022 10:20:12</p>
                  </div>
                </div>
                <div className='col-span-1'>
                  <div className=''>
                    <p className='text-gray-500'>Thời gian hoàn thành:</p>
                    <p className='font-medium'>20/10/2022 10:20:12</p>
                  </div>
                </div>
              </div>
            </>
  )
}

export default CommonInfo