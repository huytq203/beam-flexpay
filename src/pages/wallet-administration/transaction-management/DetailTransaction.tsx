import { CardComponent } from '@components/common'
import React from 'react'

const DetailTransaction = () => {
  return (
    <>
    <p>Chi tiết giao dịch: 123uhdfhdlkjsns</p>
      <div className='flex gap-3'>
        <div className='flex-[3]'>
          <CardComponent
            content={
              <>
                <div className=' flex justify-between'>
                  <span>1. Thông tin chung</span>
                  <span>Thành công</span>
                </div>
                <hr />
                <div className='grid grid-cols-3'>
                  <div className='col-span-1'>
                    <div className=''>
                      <p>Mã giao dịch</p>
                      <p>jfklsdajklaj</p>
                    </div>
                  </div>
                  <div className='col-span-1'>
                    <div className=''>
                      <p>Loại & Phương thức</p>
                      <p>jfklsdajklaj</p>
                    </div>
                  </div>
                  <div className='col-span-1'>
                    <div className=''>
                      <p>Thông tin đối soát</p>
                      <p>jfklsdajklaj</p>
                    </div>
                  </div>
                  <div className='col-span-1'>
                    <div className=''>
                      <p>Ngân hàng</p>
                      <p>jfklsdajklaj</p>
                    </div>
                  </div>
                  <div className='col-span-1'>
                    <div className=''>
                      <p>Thời gian</p>
                      <p>jfklsdajklaj</p>
                    </div>
                  </div>
                </div>
              </>
            }
          />
        </div>
        <div className='flex-[2]'>
          <CardComponent content={<></>} />
        </div>
      </div>
    </>
  )
}

export default DetailTransaction
