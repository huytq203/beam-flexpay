import React from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { CustomSelect, DateInput, SelectInput } from '@components/common'
import { Table } from 'antd';
import { InputComponent } from './components'
import dayjs from 'dayjs';
const TestDemo = () => {
    // Mock API trigger cho CustomSelect

    const data = [
        { label: 'ACTIVE', value: 'Active' },
        { label: 'INACTIVE', value: 'Inactive' },
    ]

    const dataSource = [
        {
            key: '1',
            from: '0 VNĐ',
            to: '100,000,000 VNĐ',
            formula: '1.1%',
            minMax: 'Min: 5,000',
        },
        {
            key: '2',
            from: '100,000,001 VNĐ',
            to: 'Vô cùng',
            formula: '0.8% + 5,000',
            minMax: '-',
        },
    ];

    const columns = [
        {
            title: 'GIÁ TRỊ TỪ',
            dataIndex: 'from',
            key: 'from',
            className: 'text-xs uppercase text-gray-600 border', // Attempting to style header via column className might affect cells too, usually need onHeaderCell
            onHeaderCell: () => ({
                className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold',
            }),
        },
        {
            title: 'ĐẾN',
            dataIndex: 'to',
            key: 'to',
            className: 'border border-l-0',
            onHeaderCell: () => ({
                className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold',
            }),
        },
        {
            title: 'CÔNG THỨC',
            dataIndex: 'formula',
            key: 'formula',
            className: 'border border-l-0',
            render: (text: string) => <span className="font-mono">{text}</span>,
            onHeaderCell: () => ({
                className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold',
            }),
        },
        {
            title: 'MIN/MAX',
            dataIndex: 'minMax',
            key: 'minMax',
            className: 'border border-l-0',
            onHeaderCell: () => ({
                className: 'bg-gray-100 text-gray-600 text-xs uppercase font-semibold',
            }),
        },
    ];
    function handlePickDate(date: dayjs.Dayjs | null, dateString: string | string[]) {
        if (Array.isArray(dateString)) {
            console.log(date?.format("DD/MM/YYYY"));
        } else {
            console.log(date?.format("DD/MM/YYYY"));
        }
    }
    function handleChange(value:string)
    {
        console.log(value)
    }
    return (
        <div>
            <div className='flex flex-col justify-center item-center  mx-5 my-5 gap-2'>
                <div className="item1 bg-white rounded p-3 ">
                    <div className="header">
                        <p className="text-lg font-semibold">1. Thông tin chung</p>
                        <div className="content">
                            <form>
                                <div className="grid grid-cols-12 gap-2">
                                    <InputComponent lable='Tên chính sách phí' placeholder='Nhập thoong tin' customCss='col-span-8 flex flex-col' />
                                    <InputComponent lable='Độ ưu tiên' placeholder='Nhập thông tin' customCss='col-span-4 flex flex-col' />
                                    <div className="col-span-4 flex flex-col">
                                        <label htmlFor="">Hiệu lực từ</label>
                                        <DateInput onChange={handlePickDate} picker={'date'} />
                                    </div>
                                    <div className="col-span-4 flex flex-col">
                                        <label htmlFor="">Hiệu lực đến</label>
                                        <DateInput onChange={handlePickDate} picker={'date'} />
                                    </div>
                                    <div className="col-span-4 flex flex-col">
                                        <label htmlFor="">Trạng thái</label>
                                        <SelectInput  data={data } handleChange={handleChange } />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="item2 bg-white rounded p-3 ">
                    <div className="header flex justify-between items-center">
                        <p  className="text-lg font-semibold">2. Phạm vi áp dụng (Rule Assignment)</p>
                        <button className='text-blue-600 hover:text-blue-500 bg-blue-100 hover:bg-blue-200 border border-blue-400 p-1 rounded-lg'>+ Thêm điều kiện</button>
                    </div>
                    <div className="content">
                        <form action="">
                            <div className="itemCard rounded border p-3 bg-gray-100 flex flex-col">
                                <p>Chính sách này sẽ được kích hoạt khi giao dịch thỏa mãn <span className='font-bold'>TẤT CẢ</span> các điều kiện sau:</p>
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-4 flex flex-col">
                                        <label htmlFor="">Merchant</label>
                                         <SelectInput  data={data } handleChange={handleChange } />
                                    </div>
                                    <div className="col-span-4 flex flex-col">
                                        <label htmlFor="">Ngân hàng (Bank Code)</label>
                                        <SelectInput  data={data } handleChange={handleChange } />
                                    </div>
                                    <div className="col-span-4 flex flex-col">
                                        <label htmlFor="">Phương thức thanh toán</label>
                                         <SelectInput  data={data } handleChange={handleChange } />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="item3 bg-white rounded p-3 ">
                    <div className="header flex justify-between items-center">
                        <p  className="text-lg font-semibold">3. Công thức tính phí (Fee Components)</p>
                        <button className='text-blue-600 hover:text-blue-500 bg-blue-100 hover:bg-blue-200 border border-blue-400 p-1 rounded-lg'>+ Thêm thành phần phí</button>
                    </div>
                    <div className="content">
                        <form action="">
                            <div className="cardItem1 p-3 rounded-lg border hover:border-l-blue-600 transition-all">
                                <div className="flex">
                                    <span className='bg-indigo-100 text-indigo-700 w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-bold'>1</span>
                                    <div className="">
                                        <p  className=" font-semibold">Phí dịch vụ (MERCHANT_FEE) </p>
                                        <div className="flex gap-2">
                                            <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-gray-100'>Người trả: <span className='font-bold'>MERCHANT</span></span>
                                            <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-gray-100'>Người hưởng: <span className='font-bold'>SYSTEM</span></span>
                                            <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-yellow-50 text-yellow-700 border-yellow-200'>Cách tính: <span className='font-bold'>Lũy tiến (Progressive Tier)</span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 ml-14 ">
                                    <Table
                                        dataSource={dataSource}
                                        columns={columns}
                                        pagination={false}
                                        size="small"
                                        className="tier-table "
                                        rowClassName={() => 'text-gray-700'}
                                    />
                                </div>
                            </div>
                        </form>
                        <div className="cardItem2 p-3 rounded-lg border hover:border-l-blue-600 transition-all mt-2">
                            <div className="flex">
                                <span className='bg-green-100 text-green-700 w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-bold'>2</span>
                                <div className="mb-2">
                                    <p className="font-semibold">Phí dịch vụ (MERCHANT_FEE) </p>
                                    <div className="flex gap-2">
                                        <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-blue-50 text-blue-700 border-blue-200'>Base on: <span className='font-bold'>MERCHANT_FEE</span></span>
                                        <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-gray-100'>Người trả: <span className='font-bold'>MERCHANT</span></span>
                                        <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-gray-100'>Người hưởng:  <span className='font-bold'>TAX</span></span>
                                    </div>
                                </div>
                            </div>
                            <span className="ml-14  px-2 border rounded-sm">= 10% * MERCHANT_FEE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestDemo
