import { CardComponent, Input, TabComponent } from '@components/index'
import { ClockIcon } from '@components/icons'
import { items } from '@pages/wallet-administration/confirm-ekyc/columns/TabsConfirmEKYC.config'
import { TAB_CONTENT_MAP } from '@pages/wallet-administration/confirm-ekyc/constants/TabConfirmEKYC'
import { genderMap } from '../types/ConfirmEKYC.type'
import dayjs from 'dayjs'
import React, { Suspense, useState } from 'react'
import { ContentEKYC } from '@type/apiResponseEKYC'

interface Props {
  data?: ContentEKYC
  isLoading?: boolean
}

const ContenModalConfirm = ({ data }: { data?: ContentEKYC }) => {
  const [activeKey, setActiveKey] = useState('1')
  const record = data

  const ocrFields = [
    { label: 'Họ và tên', value: record?.fullName },
    { label: 'Số điện thoại', value: record?.username },
    { label: 'Số CCCD', value: record?.idNumber },
    { label: 'Ngày cấp', value: record?.issueDate ? dayjs(record.issueDate).format('DD/MM/YYYY') : undefined },
    { label: 'Nơi cấp', value: (record?.issuePlace.replace(/CỤC TRƯỞNG CỤC CẢNH SÁT\nQUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi, 'Cục CS QLHC về TTXH')) },
    { label: 'Ngày sinh', value: record?.dateOfBirth ? dayjs(record.dateOfBirth).format('DD/MM/YYYY') : undefined },
    { label: 'Giới tính', value: record?.gender ? genderMap[record.gender as string] ?? record.gender : undefined },
    { label: 'Quốc tịch', value: record?.nationality },
  ]

  const addressFields = [
    { label: 'Quê quán', value: record?.permanentAddress },
    { label: 'Nơi thường trú', value: record?.permanentAddress },
  ]

  return (
    <>
      <div className='flex gap-3'>
        <div className="flex flex-1 flex-col border p-2 rounded-md ">
          <TabComponent
            activeKey={activeKey}
            items={items}
            onChange={setActiveKey}
          />
          <Suspense fallback={<div>Loading...</div>}>
            {TAB_CONTENT_MAP[activeKey]}
          </Suspense>
        </div>
        <div className='flex-1 border rounded-md '>
          <div className='bg-gray-100 p-3'>
            <p className="font-medium">Dữ liệu trích xuất (OCR)</p>
          </div>
          <div className='grid grid-cols-2 gap-1 py-5'>
            {ocrFields.map((item, index) => (
              <div key={index} className='col-span-1 mx-2'>
                <span className="text-[12px] text-gray-500">{item.label}</span>
                <Input
                  readOnly
                  content={item.value ?? '—'}
                  value={item.value}
                />
              </div>
            ))}
            {addressFields.map((item, index) => (
              <div key={`addr-${index}`} className='col-span-2 mx-2'>
                <span className="text-[12px] text-gray-500">{item.label}</span>
                <textarea
                  readOnly
                  rows={2}
                  value={item.value ?? '—'}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5  bg-white resize-none focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='mt-3 overflow-hidden rounded-md border border-slate-200'>
        <div className='border-b border-slate-200 bg-slate-50 px-3 py-2.5'>
          <p className='font-medium text-slate-900'>Lịch sử xử lý</p>
        </div>
        <div
          className='flex min-h-36 flex-col items-center justify-center px-4 py-8 text-center'
          role='status'
        >
          <span className='flex size-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-700'>
            <ClockIcon size={22} weight='regular' aria-hidden />
          </span>
          <p className='mt-3 font-semibold text-slate-900'>
            Tính năng đang phát triển
          </p>
          <p className='mt-1 max-w-md text-sm text-slate-600'>
            Lịch sử xử lý hồ sơ eKYC sẽ được hiển thị tại đây khi tính năng hoàn
            thiện.
          </p>
        </div>
      </div>
    </>
  )
}

const BusinessComfirm = ({ data, isLoading }: Props) => {


  if (isLoading) {
    return <div className="flex justify-center items-center h-40 text-gray-400">Đang tải dữ liệu...</div>
  }

  return (
    <div>
      <div>
        <CardComponent content={<ContenModalConfirm data={data} />} />
      </div>
    </div>
  )
}

export default BusinessComfirm
