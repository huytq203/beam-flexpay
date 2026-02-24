import { CardComponent, TimeLineComponent } from '@components/index'
import { BankFilled, HistoryOutlined, PenTool, UserIcon } from '@components/icons'
import React from 'react'

const ModalDetailWithdrawHistory = () => {
    return (
        <div>
            <div className="grid grid-cols-2 h-full gap-3 mb-3">
                <CardComponent className='col-span-1 flex-1 h-full ' content={<>

                    <div className="h-full">
                        <p className='font-medium flex items-center gap-1'><UserIcon weight='fill' />Thông tin yêu cầu</p>
                        <hr className='my-3' />
                        <div className="">
                            {[
                                { label: 'Mã giao dịch', value: 'TRX-4673826' },
                                { label: 'Loại giao dịch', value: 'Rút tiền ví' },
                                { label: 'Người yêu cầu', value: 'Trần Quang A' },
                                { label: 'Số điện thoại', value: '0943367432' },
                                { label: 'Số tiền rút', value: '5.000.000 đ' },
                                { label: 'Trạng thái', value: 'Chờ duyệt' },
                            ].map((item, idx) => {
                                const isAmount = item.label === 'Số tiền rút'
                                const isStatus = item.label === 'Trạng thái'

                                return (
                                    <div key={idx} className="flex justify-between items-center">
                                        <p className="text-gray-500">{item.label}:</p>

                                        <p
                                            className={`
                                                font-medium
                                                ${isAmount
                                                    ? ' text-red-600'
                                                    : isStatus
                                                        ? ' text-yellow-600'
                                                        : ''
                                                }
                                                `
                                            }
                                        >
                                            {item.value}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>} />
                <CardComponent className='flex-1 col-span-1' content={<>
                    <div className="">
                        <p className='font-medium flex items-center gap-1'><BankFilled />Thông tin thụ hưởng</p>
                        <hr className='my-3' />
                        <div className="">
                            {[
                                { label: 'Ngân hàng', value: 'Vietcombank (VCB)' },
                                { label: 'Số tài khoản', value: '047839' },
                                { label: 'Tên chủ TK', value: 'NGUYEN VAN A' },
                                { label: 'Chi nhánh', value: 'Hồ Chí Minh' },
                            ].map((item, idx) => {

                                return (
                                    <div key={idx} className="flex justify-between items-center">
                                        <p className="text-gray-500">{item.label}:</p>

                                        <p className='font-medium'>
                                            {item.value}
                                        </p>
                                    </div>
                                )
                            })}
                            <hr className='my-3' />
                            <div className="">
                                <p>Ngân hàng chi tiền (Hệ thống):</p>
                                <p className='text-gray-500 italic'>--Chưa thực hiện chi tiền--</p>
                            </div>
                        </div>
                    </div>
                </>} />
                <CardComponent className=' col-span-2' content={<>
                    <div className="">
                        <p className='font-medium flex items-center gap-1'><HistoryOutlined />Lịch sử xử lý (Audit Log)</p>
                    </div>
                    <hr className='my-3' />
                    <div className="h-56 overflow-auto">

                        <TimeLineComponent items={[
                            {
                                title: 'Tạo yêu cầu rút tiền',
                                time: '2025-09-01 10:15',
                                color: 'blue',
                            },
                            {
                                title: 'Hệ thống kiểm tra số dư',
                                time: '2025-09-01 10:16',
                                color: 'green',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                            {
                                title: 'Admin từ chối',
                                time: '2025-09-01 11:02',
                                color: 'red',
                            },
                        ]} />
                    </div>

                </>} />
            </div>
            <CardComponent content={
                <>
                    <p className='font-medium flex items-center gap-1'><PenTool size={16} />Ghi chú nội bộ của admin:</p>
                    <div className="bg-yellow-50 border rounded-md p-3 text-gray-500">
                        <p>Chưa có ghi chú nội dung nào</p>
                    </div>
                </>
            } />
        </div>
    )
}

export default ModalDetailWithdrawHistory