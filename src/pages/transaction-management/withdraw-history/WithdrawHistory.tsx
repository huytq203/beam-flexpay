import {
  CardComponent,
  Table,
  DialogModal,
  ExportCsvButton,
  JournalSummary,
  ModalComponent
} from '@components/index'
import { CheckCircleFilled, InfoCircleFilled } from '@components/icons'
import { EXPORT_ORDER_HINT } from '@constants/export'
import DialogApproval from './components/DialogApproval'
import DialogApproveWithdraw from './components/DialogApproveWithdraw'
import DialogDetailWithdrawHistory from './components/ModalDetailWithdrawHistory'
import WithdrawHistorySearch from './components/WithdrawHistorySearch'
import getColumn from './columns/WithdrawHistory.column'
import useFetchDataWithdraw from './hooks/useFetchDataWithdraw'
import useHandle from './hooks/useHandle'

const WithdrawHistory = () => {
  const {
    dataWithdraw,
    page,
    pageSize,
    handleChangePage,
    filters,
    dataSource,
    handleSearch,
    clearFilters,
    activeStatus,
    handleSummaryStatusChange,
    refetch,
    isFetching,
    handleExport,
    isExporting
  } = useFetchDataWithdraw()
  const totalElements = dataWithdraw?.totalElements ?? 0
  const {
    isDetailOpen,
    detailData,
    withdrawalDetail,
    isDetailLoading,
    loadingId,
    openDetail,
    closeDetail
  } = useHandle()
  // Chi tiết có thể đã cho thấy trạng thái mới hơn; đóng ra phải kéo lại bảng để hai nơi cùng một giá trị.
  const handleCloseDetail = () => {
    closeDetail()
    void refetch()
  }
  const columns = getColumn({
    onViewDetail: openDetail,
    isDetailLoading,
    loadingId
  })

  return (
    <div className='space-y-3'>
      <div className=''>
        <CardComponent
          content={
            <WithdrawHistorySearch
              key={JSON.stringify(filters)}
              defaultValues={filters}
              handleSearch={handleSearch}
              onReset={clearFilters}
            />
          }
        />
      </div>
      <div className=''>
        <CardComponent
          content={
            <>
              <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
                <span className='font-medium text-gray-600 text-lg'>
                  Lịch sử rút tiền
                </span>
                <ExportCsvButton
                  onExport={handleExport}
                  loading={isExporting}
                  disabled={totalElements === 0}
                  totalRows={totalElements}
                  tooltip={`File tải về có tên bắt đầu bằng "Quan-ly-giao-dich_" vì dùng chung đường xuất với màn Quản lý giao dịch — nội dung vẫn đúng bộ lọc lệnh rút đang áp. ${EXPORT_ORDER_HINT}`}
                />
              </div>
              <JournalSummary
                ariaLabel='Tổng quan giao dịch rút tiền'
                summary={dataWithdraw?.summary}
                totalFallback={dataWithdraw?.totalElements}
                isLoading={isFetching && !dataWithdraw}
                activeStatus={activeStatus}
                onStatusChange={handleSummaryStatusChange}
              />
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
                  current: page,
                  pageSize,
                  total: totalElements,
                  showSizeChanger: true,
                  showTotal: (total, range) =>
                    `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`,
                  onChange: handleChangePage
                }}
              />
            </>
          }
        />
      </div>

      {isDetailOpen && detailData && withdrawalDetail && (
        <ModalComponent
          width='65%'
          onCancel={handleCloseDetail}
          onOk={handleCloseDetail}
          open
          title={
            <span className='flex items-center gap-1'>
              <span className='flex items-center gap-1 text-blue-500'>
                <InfoCircleFilled /> Chi tiết giao dịch:{' '}
              </span>{' '}
              <span className='font-bold text-gray-500'>
                #{detailData.transactionCode}
              </span>
            </span>
          }
          modalText={
            <DialogDetailWithdrawHistory
              data={detailData}
              withdrawalDetail={withdrawalDetail}
            />
          }
        />
      )}
      <DialogModal
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        styles={{
          content: {
            background: '#fafafa'
          }
        }}
        title={
          <span className=' flex items-center gap-1'>
            <CheckCircleFilled /> Duyệt yêu cầu rút tiền
          </span>
        }
        content={<DialogApproval />}
      />
      <DialogModal
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        styles={{
          content: {
            background: '#fafafa'
          }
        }}
        title={
          <span className=' flex items-center gap-1 text-blue'>
            <CheckCircleFilled /> Duyệt yêu cầu rút tiền
          </span>
        }
        content={<DialogApproveWithdraw />}
      />
    </div>
  )
}

export default WithdrawHistory
