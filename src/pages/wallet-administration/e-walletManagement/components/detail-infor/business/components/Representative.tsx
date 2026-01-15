const Representative = () => {
  return (
    <>
      <div className='grid grid-cols-2 gap-2 mb-3'>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Họ và tên:</p>
                <p className="font-medium">Trần Quang A</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Chức vụ:</p>
                <p className="font-medium">Tổng giám đốc</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Số CCCD:</p>
                <p className="font-medium">43290600932</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Ngày cấp:</p>
                <p className="font-medium">10/10/2025</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Số điện thoại:</p>
                <p className="font-medium">03333333</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Email:</p>
                <p className="font-medium">A@gmail.com</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Ngày sinh:</p>
                <p className="font-medium">01/01/1999</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Giới tính:</p>
                <p className="font-medium">Nam</p>
            </div>
        </div>
        <div className="col-span-1">
            <div className="">
                <p className="text-gray-500">Địa chỉ thường trú:</p>
                <p className="font-medium">XXX, Đường YYY, TP ZZZ</p>
            </div>
        </div>
      </div>
      <hr />
      <p className="font-bold text-gray-500 py-2">HÌNH ẢNH XÁC THỰC EKYC</p>
       <div className='flex justify-between gap-4'>
        {/* CCCD Trước */}

        <div className='flex flex-col items-center gap-2'>
          <div className='w-60 h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm'>
            Mặt trước
          </div>
          <span className='text-xs text-gray-600'>CCCD Trước</span>
        </div>

        {/* CCCD Sau */}
        <div className='flex flex-col items-center gap-2'>
          <div className='w-60 h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm'>
            Mặt sau
          </div>
          <span className='text-xs text-gray-600'>CCCD Sau</span>
        </div>

        {/* Face Match */}
        <div className='flex flex-col items-center gap-2'>
          <div className='w-60 h-24 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm'>
            Chân dung
          </div>
          <span className='text-xs text-gray-600'>Face Match</span>
        </div>
      </div>
    </>
  )
}
export default Representative
