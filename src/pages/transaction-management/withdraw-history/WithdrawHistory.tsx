import { CardComponent, Table, DialogModal, ModalComponent } from '@components/index'
import { CheckCircleFilled, InfoCircleFilled } from '@components/icons'
import DialogApproval from './components/DialogApproval'
import DialogApproveWithdraw from './components/DialogApproveWithdraw'
import DialogDetailWithdrawHistory from './components/ModalDetailWithdrawHistory'
import WithdrawHistorySearch from './components/WithdrawHistorySearch'
import getColumn from './columns/WithdrawHistory.column'
import useFetchDataWithdraw from './hooks/useFetchDataWithdraw'
import useHandle from './hooks/useHandle'

const WithdrawHistory = () => {
    const { dataWithdraw, setPage, setPageSize, dataSource, handleSearch, refetch, isFetching } = useFetchDataWithdraw()
    const { isDetailOpen, detailData, isDetailLoading, openDetail, closeDetail } = useHandle()
    const columns = getColumn({ onViewDetail: openDetail })

    return (
        <div className='space-y-3'>
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
                        onRefresh={() => {
                            refetch()
                        }}
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
                      <span className='flex items-center gap-1 text-blue-500'><InfoCircleFilled /> Chi tiết giao dịch: </span> <span className='font-bold text-gray-500'> {detailData?.journalCode ? `#${detailData.transactionCode}` : ''}</span>
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
