import React from 'react'

const DialogConfirmLinkAccount = () => {
  return (
    <div className='space-y-3 '>
      <p className='text-gray-500'>Bạn có chắc chắn muốn xác thực cho tài khoản ngân hàng này? Hành động này cho phép người dùng thực hiện ngay lập tức</p>
      <div className="bg-gray-100 p-3 border rounded-md">
        {[
          { label: 'Ngân hàng', value: 'TPBANK' },
          { label: 'Số tài khoản', value: '**** 2003' },
          { label: 'Chủ tài khoản', value: 'TRAN QUANG A' },
        ].map((item, idx) => (
          <div key={idx} className="flex justify-between border-b items-center">
            <p className='text-gray-500'>{item.label}</p>
            <p className='font-medium'>{item.value}</p>
          </div>
        ))}

      </div>
    </div>
  )
}

export default DialogConfirmLinkAccount