const LegalRecords = () => {
  return (
    <>
      {' '}
      <div className='grid grid-cols-2 gap-2 mb-3'>
        <div className='col-span-2'>
          <div className=''>
            <p className='text-gray-500'>Tên công ty (Theo ĐKKD):</p>
            <p className='font-medium'>CÔNG TY TNHH CÔNG NGHỆ TƯƠNG LAI</p>
          </div>
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Mã số thuế:</p>
            <p className='font-medium'>4789327498732</p>
          </div>
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Ngày thành lập:</p>
            <p className='font-medium'>10/10/2025</p>
          </div>
        </div>
        <div className='col-span-1'>
          <div className=''>
            <p className='text-gray-500'>Địa chỉ trụ sở chính:</p>
            <p className='font-medium'>XXX, Đường YYY, TP ZZZ</p>
          </div>
        </div>
      </div>
      <hr />
      <p className='font-bold text-gray-500 pt-8 pb-4'>Đính kèm hồ sơ</p>
      <div className='flex justify-between gap-4'>

        <div className='flex flex-1 flex-col items-center gap-2'>
          <div className='w-full h-40 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm'>
           Xem ảnh
          </div>
        </div>

        <div className='flex flex-1 flex-col items-center gap-2'>
          <div className='w-full h-40 flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm'>
           Xem ảnh
          </div>
        </div>

      
      </div>
    </>
  )
}
export default LegalRecords
