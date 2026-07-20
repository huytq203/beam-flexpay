import { ButtonComponent, CardComponent, Table } from '@components/index'
import Column from './columns/DetailTransaction.column'
import { ArrowCounterClockwiseIcon, PrinterOutlined } from '@components/icons'
import CommonInfo from './components/CommonInfo'
import InfoUser from './components/InfoUser'
import UserFees from './components/UserFees'
import FeeNCC from './components/FeeNCC'
import useDetailTransaction from './hooks/useDetailTransaction'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'

const DetailTransaction = () => {
  const column = Column()

  const { getTransactionById } = useDetailTransaction()

  return (
    <>
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="flex flex-col gap-1">
          <p className='text-xl font-bold'>Chi tiết giao dịch: <span className='text-blue-700'>{getTransactionById?.transactionCode ?? '--'}</span></p>
          <p className="text-sm text-gray-500">{dayjs(getTransactionById?.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
        </div>
        <div className="flex justify-center items-center gap-2">
          <ButtonComponent icon={<PrinterOutlined />} type='default' content='In phiếu' />
          <ButtonComponent icon={<ArrowCounterClockwiseIcon size={16} weight={'bold'} />} className='bg-orange-600 text-white hover:!bg-orange-500 hover:!text-white' content='Hoàn tiền' />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

        <CardComponent className='col-span-1 md:col-span-3 order-1 md:order-1' content={<CommonInfo data={getTransactionById} />} />

        <CardComponent className='col-span-1 md:col-span-2 order-4 md:order-2' content={<InfoUser data={getTransactionById} />} />

        <CardComponent className='col-span-1 md:col-span-3 order-2 md:order-3' content={<UserFees data={getTransactionById} />} />

        <CardComponent className='col-span-1 md:col-span-2 order-5 md:order-4' content={<FeeNCC data={getTransactionById} />} />

        <CardComponent className='col-span-1 md:col-span-3 order-3 md:order-5' content={<>
          <div>
            <p className='font-medium'>3. Bảng hạch toán luồng tiền</p>
          </div>
          <hr className='my-3' />
          <Table columns={column} bordered size='small' scroll={{ x: 'max-content' }} />
        </>} />

        <div className='col-span-1 md:col-span-2  order-6 md:order-6' >
          <div className=" flex flex-col justify-center items-center border border-blue-700 bg-blue-100 rounded-md py-5 ">
            <p className=' text-xl text-gray-500 font-bold'>LỢI NHUẬN RÒNG (NET PROFIT)</p>
            <p className='text-xl  text-green-600 font-medium'>{formatCurrency(0, { symbol: 'VNĐ', position: 'after' })}</p>
            <p className='text-gray-500 text-sm'>(Tổng thu user - Tổng trả NCC)</p>
          </div>
        </div>

      </div>

    </>

  )
}

export default DetailTransaction
