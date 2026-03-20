import { CardComponent, Table, DialogModal, ModalComponent, UploadCombined } from '@components/index'
import { CheckCircleFilled, ClockIcon, InfoCircleFilled } from '@components/icons'
import React from 'react'
import DialogApproval from './components/DialogApproval'
import DialogApproveWithdraw from './components/DialogApproveWithdraw'
import DialogDetailWithdrawHistory from './components/ModalDetailWithdrawHistory'
import WithdrawHistorySearch from './components/WithdrawHistorySearch'
import getColumn from './columns/WithdrawHistory.column'
import useFetchDataWithdraw from './hooks/useFetchDataWithdraw'
import useHandle from './hooks/useHandle'

const WithdrawHistory = () => {
    const statusCards = [
        { count: 50, label: 'Chờ duyệt', borderClass: 'border-l-yellow-500', bgClass: 'bg-yellow-100', textClass: 'text-yellow-600' },
        { count: 50, label: 'Đã duyệt - Chờ chi', borderClass: 'border-l-blue-500', bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
        { count: 50, label: 'Thành công', borderClass: 'border-l-teal-500', bgClass: 'bg-teal-100', textClass: 'text-teal-600' },
        { count: 50, label: 'Thất bại/lỗi', borderClass: 'border-l-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600' },
    ]
    const { dataWithdraw, isLoadingWithdraw, setPage, setPageSize, sort, sortBy, dataSource, handleSearch, isFetching } = useFetchDataWithdraw()
    const { isDetailOpen, detailData, isDetailLoading, openDetail, closeDetail } = useHandle()
    const columns = getColumn({ onViewDetail: openDetail })

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
                <CardComponent content={<WithdrawHistorySearch handleSearch={handleSearch} />} />
            </div>
            <div className="">
                <CardComponent content={
                    <Table
                        columns={columns}
                        size='small'
                        bordered
                        dataSource={dataSource}
                        loading={isFetching}
                        pagination={{
                            current: dataWithdraw?.pageable?.pageNumber ? dataWithdraw.pageable.pageNumber + 1 : 1,
                            pageSize: dataWithdraw?.pageable?.pageSize ?? 10,
                            total: dataWithdraw?.totalElements ?? 0,
                            showSizeChanger: true,
                            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`,
                            onChange: (page, pageSize) => {
                                setPage(page)
                                setPageSize(pageSize)
                            },
                        }}
                    />
                } />
            </div>

            <ModalComponent
                width='65%'
                onCancel={closeDetail}
                onOk={closeDetail}
                open={isDetailOpen}
                title={
                    <span className='flex items-center gap-1'>
                      <span className='flex items-center gap-1 text-blue-500'><InfoCircleFilled /> Chi tiết giao dịch: </span> <span className='font-bold text-gray-500'> {detailData?.journalCode ? `#${detailData.journalCode}` : ''}</span>
                    </span>
                }
                modalText={<DialogDetailWithdrawHistory data={detailData} isLoading={isDetailLoading} />}
            />
            <DialogModal
                onCancel={() => { }}
                onOk={() => { }}
                open={false}
                styles={{
                    content: {
                        background: '#fafafa'
                    }
                }}
                title={<span className=' flex items-center gap-1'><CheckCircleFilled /> Duyệt yêu cầu rút tiền</span>}
                content={<DialogApproval />}
            />
            <DialogModal
                onCancel={() => { }}
                onOk={() => { }}
                open={false}
                styles={{
                    content: {
                        background: '#fafafa'
                    }
                }}
                title={<span className=' flex items-center gap-1 text-blue'><CheckCircleFilled /> Duyệt yêu cầu rút tiền</span>}
                content={<DialogApproveWithdraw />}
            />
        </div>
    )
}

export default WithdrawHistory