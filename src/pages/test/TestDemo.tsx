import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import {
  CustomSelect,
  DateInput,
  SelectInput,
  TextArea,
  Input,
  ModalComponent,
  ButtonComponent
} from '@components/common'
import FeeComponent from './components/FeeComponent'
import dayjs from 'dayjs'
import FormAddFee from '@pages/test/components/FormAddFee'
const TestDemo = () => {
  // Mock API trigger cho CustomSelect
  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [modalText, setModalText] = useState('Content of the modal')

  const handleOk = () => {
    setModalText('The modal will be closed after two seconds')
    setConfirmLoading(true)
    setTimeout(() => {
      setOpen(false)
      setConfirmLoading(false)
    }, 2000)
  }

  const handleCancel = () => {
    setOpen(false)
  }
  const dataSource = [
    {
      key: '1',
      from: '0 VNĐ',
      to: '100,000,000 VNĐ',
      formula: '1.1%',
      minMax: 'Min: 5,000'
    },
    {
      key: '2',
      from: '100,000,001 VNĐ',
      to: 'Vô cùng',
      formula: '0.8% + 5,000',
      minMax: '-'
    }
  ]

  const columns = [
    {
      title: 'GIÁ TRỊ TỪ',
      dataIndex: 'from',
      key: 'from',
      className: 'text-xs uppercase text-gray-600 border', // Attempting to style header via column className might affect cells too, usually need onHeaderCell
      onHeaderCell: () => ({
        className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold'
      })
    },
    {
      title: 'ĐẾN',
      dataIndex: 'to',
      key: 'to',
      className: 'border border-l-0',
      onHeaderCell: () => ({
        className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold'
      })
    },
    {
      title: 'CÔNG THỨC',
      dataIndex: 'formula',
      key: 'formula',
      className: 'border border-l-0',
      render: (text: string) => <span className='font-mono'>{text}</span>,
      onHeaderCell: () => ({
        className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold'
      })
    },
    {
      title: 'MIN/MAX',
      dataIndex: 'minMax',
      key: 'minMax',
      className: 'border border-l-0',
      onHeaderCell: () => ({
        className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold'
      })
    }
  ]
  const data = [
    { label: 'ACTIVE', value: 'Active' },
    { label: 'INACTIVE', value: 'Inactive' }
  ]

  function handlePickDate(
    date: dayjs.Dayjs | null,
    dateString: string | string[]
  ) {
    if (Array.isArray(dateString)) {
      console.log(date?.format('DD/MM/YYYY'))
    } else {
      console.log(date?.format('DD/MM/YYYY'))
    }
  }
  function handleChange(value: string) {
    console.log(value)
  }
  return (
    <div>
      <div className='flex flex-col justify-center item-center  mx-5 my-5 gap-2'>
        <div className='item1 bg-white rounded p-3 '>
          <div className='header'>
            <p className='text-lg font-semibold'>1. Thông tin chung</p>
            <div className='content'>
              <form>
                <div className='grid grid-cols-12 gap-2'>
                  <div className='col-span-12 flex flex-col'>
                    <label htmlFor=''>Tên chính sách phí</label>
                    <Input placeholder='Nhập tên chính sách...' />
                  </div>
                  {/* <InputComponent lable='Độ ưu tiên' placeholder='Nhập thông tin' customCss='col-span-4 flex flex-col' /> */}
                  <div className='col-span-6 flex flex-col'>
                    <label htmlFor=''>Hiệu lực từ</label>
                    <DateInput
                      onChange={handlePickDate}
                      picker={'date'}
                    />
                  </div>
                  <div className='col-span-6 flex flex-col'>
                    <label htmlFor=''>Hiệu lực đến</label>
                    <DateInput
                      onChange={handlePickDate}
                      picker={'date'}
                    />
                  </div>
                  <div className='col-span-6 flex flex-col'>
                    <label htmlFor=''>Mức độ ưu tiên</label>
                    <SelectInput
                      data={data}
                      handleChange={handleChange}
                    />
                  </div>
                  <div className='col-span-6 flex flex-col'>
                    <label htmlFor=''>Trạng thái hoạt đông</label>
                    <SelectInput
                      data={data}
                      handleChange={handleChange}
                    />
                  </div>
                  <div className='col-span-12 flex flex-col'>
                    <label htmlFor=''>Mô tả</label>
                    <TextArea
                      rows={4}
                      placeholder='Nhập mô tả về chính sách phí...'
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className='item3 bg-white rounded p-3 '>
          <div className='header flex justify-between items-center'>
            <p className='text-lg font-semibold'>2. Thiết lập phí</p>
            <ButtonComponent
              content='Thêm thành phần phí'
              onclick={() => setOpen(true)}
              icon={
                <svg
                  width={20}
                  height={20}
                >
                  <use href='/icons.svg#hugeicons-plus-sign-circle' />
                </svg>
              }
            />
          </div>
          <div className='content'>
            <FeeComponent
              columns={columns}
              dataSource={dataSource}
            />
            <ModalComponent
              open={open}
              onOk={handleOk}
              onCancel={handleCancel}
              confirmLoading={confirmLoading}
              modalText={<FormAddFee />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestDemo
