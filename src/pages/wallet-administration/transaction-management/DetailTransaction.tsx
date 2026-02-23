import { ButtonComponent, CardComponent, CopyableText, Table, TooltipComponent } from '@components/index'
import React, { useState } from 'react'
import Column from './columns/DetailTransaction.column'
import ReactJson from 'react-json-view'
import { LazyLog as LazyLogComponent } from "react-lazylog"
import { ArrowCounterClockwiseIcon, CheckCircleFilled, CopyIcon, EyeOutlined, PrinterOutlined, TerminalIcon } from '@components/icons'
import { message } from 'antd'
import CommonInfo from './components/CommonInfo'
import InfoUser from './components/InfoUser'
import UserFees from './components/UserFees'
import FeeNCC from './components/FeeNCC'
import useDetailTransaction from './hooks/useDetailTransaction'
import { useGetTransactionByIdQuery } from '@pages/wallet-administration/transaction-management/services/apiTransactionV2'
import dayjs from 'dayjs'
import { formatCurrency } from '@utils/formatNumber'
type ViewMode = 'TEXT' | 'JSON'
type TitleHover = 'Copy' | 'Copied!' | 'Wrong'
const LazyLog = LazyLogComponent as React.ComponentType<any>


const DetailTransaction = () => {
  const column = Column()
  const [viewMode, setViewMode] = useState<ViewMode>()

  const {id,getTransactionById}=useDetailTransaction()
  console.log(getTransactionById)
  const logLines = [
    "[08:30:00] INFO  Request sent to partner",
    "[08:30:00] INFO  Endpoint: /api/v1/transfer",
    "[08:30:00] INFO  Payload: amount=500000 currency=VND",
    "[08:30:00] INFO  Waiting for response...",
    "[08:30:00] INFO  Response status: 200",
    "[08:30:00] INFO  Transaction created. Status=PENDING"
  ]
  const rawJson = {
    requestId: "REQ-20260108-0001",
    partner: "PAYMENT_GATEWAY",
    endpoint: "/api/v1/transfer",
    method: "POST",
    createdAt: "2026-01-08T08:30:00+07:00",
    request: {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer ***"
      },
      body: {
        fromAccount: "123456789",
        toAccount: "987654321",
        amount: 500000,
        currency: "VND"
      }
    },
    response: {
      status: 200,
      body: {
        transactionId: "TXN-998877",
        status: "PENDING",
        message: "Transaction created"
      }
    },
    durationMs: 342
  }
  return (
    <>
      <div className="flex justify-between items-center mb-3 px-2">
        <div className="flex flex-col gap-1">
          <p className='text-xl font-bold'>Chi tiết giao dịch: <span className='text-blue-700'>{getTransactionById?.transactionCode??'--'}</span></p>
          <p className="text-sm text-gray-500">{dayjs(getTransactionById?.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
        </div>
        <div className="flex justify-center items-center gap-2">
          <ButtonComponent icon={<PrinterOutlined />} type='default' content='In phiếu' />
          <ButtonComponent icon={<ArrowCounterClockwiseIcon size={16} weight={'bold'} />} className='bg-orange-600 text-white hover:!bg-orange-500 hover:!text-white' content='Hoàn tiền' />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">

        <CardComponent className='col-span-1 md:col-span-3 order-1 md:order-1' content={<CommonInfo data={getTransactionById}/>} />
       
        <CardComponent className='col-span-1 md:col-span-2 order-4 md:order-2' content={<InfoUser data={getTransactionById}/>} />
       
        <CardComponent className='col-span-1 md:col-span-3 order-2 md:order-3' content={<UserFees data={getTransactionById}  />} />
      
        <CardComponent className='col-span-1 md:col-span-2 order-5 md:order-4' content={<FeeNCC data={getTransactionById}/>} />
       
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
            <p className='text-xl  text-green-600 font-medium'>{formatCurrency(getTransactionById?.netProfit??0,{ symbol: 'VNĐ', position: 'after' })}</p>
            <p className='text-gray-500 text-sm'>(Tổng thu user - Tổng trả NCC)</p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-5 order-7 md:order-7">
          <div className="bg-sky-950 text-white p-3 rounded-md bg-opacity-90">
            <div className="flex justify-between items-center pb-2 mb-3 border-b">
              <span className='flex justify-center items-center gap-1 font-bold'><TerminalIcon weight="bold" size={18} /> Nhật ký hệ thống & API (Logs)</span>

              <ButtonComponent className='bg-sky-900 text-white hover:!bg-sky-800 hover:!text-white ' type='default' onClick={() => setViewMode(viewMode === "TEXT" ? "JSON" : "TEXT")} content={viewMode === "TEXT" ? "Xem dạng JSON" : "Xem dạng Text"} />
              {/* <button onClick={() => setViewMode(viewMode === "TEXT" ? "JSON" : "TEXT")}>
                {viewMode === "TEXT" ? "Xem dạng JSON" : "Xem dạng Text"}
              </button> */}
            </div>

            <div className="log-body">
              {viewMode === "TEXT" ? (
                <div style={{ height: 300 }}>
                  <LazyLog
                    enableSearch
                    caseInsensitive
                    text={logLines.join("\n")}
                    follow
                    selectableLines
                    extraLines={1}
                  />
                </div>
              ) : (
                <div style={{ height: 300, overflow: 'auto' }}>
                  <ReactJson
                    src={rawJson}
                    theme="monokai"
                    collapsed={2}
                    enableClipboard
                    displayDataTypes={false}
                    displayObjectSize={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>

  )
}

export default DetailTransaction
