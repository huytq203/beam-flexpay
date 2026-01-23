import { CardComponent, Table, DialogModal, ModalComponent, UploadCombined } from '@components/index'
import { CheckCircleFilled, ClockIcon, InfoCircleFilled } from '@components/icons/common'
import React, { useEffect, useState } from 'react'
import DialogApproval from './components/DialogApproval'
import DialogApproveWithdraw from './components/DialogApproveWithdraw'
import DialogDetailWithdrawHistory from './components/ModalDetailWithdrawHistory'
import WithdrawHistorySearch from './components/WithdrawHistorySearch'
import Column from './columns/WithdrawHistory.column'

const WithdrawHistory = () => {
    const statusCards = [
        { count: 50, label: 'Chờ duyệt', borderClass: 'border-l-yellow-500', bgClass: 'bg-yellow-100', textClass: 'text-yellow-600' },
        { count: 50, label: 'Đã duyệt - Chờ chi', borderClass: 'border-l-blue-500', bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
        { count: 50, label: 'Thành công', borderClass: 'border-l-teal-500', bgClass: 'bg-teal-100', textClass: 'text-teal-600' },
        { count: 50, label: 'Thất bại/lỗi', borderClass: 'border-l-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600' },
    ]
    const columns = Column()

    const [data, setData] = useState([])
    const dataSource = data
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch('http://localhost:4000/withdrawHistory')
                const data = await res.json()
                setData(data.data.content)
            } catch (error: any) {
                console.log(error?.data?.detail)
            }
        }
        getUser()
    }, [])
    return (
        <div className='space-y-3'>
            <div className="grid md:grid-cols-4 gap-3">
                {statusCards.map(({ count, label, borderClass, bgClass, textClass }, index) => (
                    <CardComponent
                        key={index}
                        className={`border-l-2 ${borderClass}`}
                        content={
                            <div className="flex items-center gap-3">
                                <div className={`p-2 ${bgClass} rounded-full ${textClass}`}>
                                    <ClockIcon size={24} weight='fill' />
                                </div>
                                <div>
                                    <p className='font-bold text-lg'>{count}</p>
                                    <p className='text-sm text-gray-500'>{label}</p>
                                </div>
                            </div>
                        }
                    />
                ))}

            </div>
            <div className="">
                <CardComponent content={<WithdrawHistorySearch />} />
            </div>
            <div className="">
                <CardComponent content={<Table columns={columns} size='small' bordered dataSource={dataSource} />} />
            </div>


            <ModalComponent
                width='65%'
                onCancel={() => { }}
                onOk={() => { }}
                open={false}
                title={<span className=' flex items-center gap-1'><InfoCircleFilled />Chi tiết giao dịch #TRX-4890328-37849</span>}
                modalText={<DialogDetailWithdrawHistory />}
            />
            <DialogModal
                onCancel={() => { }}
                onOk={() => { }}
                open={false} 
                styles={{
                    content:{
                         background: '#fafafa'
                    }
                }}
                title={<span className=' flex items-center gap-1'><CheckCircleFilled/> Duyệt yêu cầu rút tiền</span>}
                content={<DialogApproval/>}
                />
            <DialogModal
                onCancel={() => { }}
                onOk={() => { }}
                open={false} 
                styles={{
                    content:{
                         background: '#fafafa'
                    }
                }}
                title={<span className=' flex items-center gap-1 text-blue'><CheckCircleFilled/> Duyệt yêu cầu rút tiền</span>}
                content={<DialogApproveWithdraw/>}
                />
        </div>
    )
}

export default WithdrawHistory