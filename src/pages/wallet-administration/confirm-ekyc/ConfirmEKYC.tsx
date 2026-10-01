import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ExportCsvButton,
  ModalComponent,
  Table
} from '@components/index'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import React, { useState } from 'react'
import FormSearch from './components/FormSearch'
import BusinessComfirm from './components/BusinessComfirm'
import { getColumn } from './columns/ConfirmEKYC.column'
import useConfirmEKYC from './hooks/useConfirmEKYC'
import DialogReject from '@pages/wallet-administration/confirm-ekyc/components/DialogReject'
import DialogCancel from '@pages/wallet-administration/confirm-ekyc/components/DialogCancel'
import { EkycReviewPanel } from './components/EkycReviewPanel'
import { getReviewSessionId } from './utils/ekycReviewTarget'

const ConfirmEKYC = () => {
  const {
    dataSource,
    isFetching,
    isError,
    refetch,
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    handleSearch,
    handleReset,
    handleExport,
    isExporting
  } = useConfirmEKYC()

  // Link ảnh S3 chỉ sống vài phút; modal luôn đọc dòng mới nhất của trang đang tải.
  const [selectedSnapshot, setSelectedSnapshot] = useState<
    EKYCListItem | undefined
  >()
  const selectedProfile = dataSource
    ? dataSource.find((row) => row.groupKey === selectedSnapshot?.groupKey)
    : isError
      ? undefined
      : selectedSnapshot
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [review, setReview] = useState<{
    groupKey: string
    decision: 'approve' | 'reject'
  } | null>(null)
  const reviewRecord = dataSource?.find(
    (row) => row.groupKey === review?.groupKey
  )
  const reviewSessionId = reviewRecord ? getReviewSessionId(reviewRecord) : null

  const openDetail = (record: EKYCListItem) => {
    setSelectedSnapshot(record)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedSnapshot(undefined)
  }

  const columns = getColumn({
    onViewDetail: openDetail,
    onReview: (record, decision) =>
      setReview({ groupKey: record.groupKey, decision })
  })

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent
        content={
          <FormSearch
            onSearch={(values) => {
              closeDetail()
              setReview(null)
              handleSearch(values)
            }}
            onReset={() => {
              closeDetail()
              setReview(null)
              handleReset()
            }}
          />
        }
      />
      {isError && (
        <div
          role='alert'
          className='flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger-strong bg-background p-3 text-sm text-danger-strong'
        >
          <span>Không tải được danh sách eKYC. Vui lòng thử lại.</span>
          <ButtonComponent
            type='default'
            content='Tải lại'
            onClick={() => void refetch()}
          />
        </div>
      )}
      <CardComponent
        content={
          <>
            <div className='mb-3 flex items-center justify-between gap-3'>
              <span className='text-lg font-medium text-gray-600'>
                Danh sách hồ sơ eKYC
              </span>
              <ExportCsvButton
                onExport={handleExport}
                loading={isExporting}
                disabled={(total ?? 0) === 0}
                tooltip='File tải về áp dụng bộ lọc hiện tại và không giới hạn theo trang.'
              />
            </div>
            <Table
              bordered
              size='small'
              scroll={{ x: 'max-content' }}
              columns={columns}
              dataSource={dataSource}
              loading={isFetching}
              onRefresh={refetch}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total ?? 0,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `Hiển thị ${range[0]}-${range[1]} / ${total} bản ghi`,
                onChange: (p, ps) => {
                  closeDetail()
                  setReview(null)
                  setPage(p)
                  setPageSize(ps)
                }
              }}
            />
          </>
        }
      />

      <ModalComponent
        title='Chi tiết hồ sơ'
        onCancel={closeDetail}
        onOk={closeDetail}
        open={isDetailOpen && Boolean(selectedProfile)}
        width='min(1120px, calc(100vw - 24px))'
        modalText={
          <BusinessComfirm
            key={selectedProfile?.groupKey}
            data={selectedProfile}
            onRetry={() => void refetch()}
          />
        }
      />

      <ModalComponent
        title={`${review?.decision === 'reject' ? 'Từ chối' : 'Duyệt'} eKYC${reviewRecord?.fullName ? `: ${reviewRecord.fullName}` : ''}`}
        open={Boolean(review && reviewSessionId)}
        onCancel={() => setReview(null)}
        footer={null}
        width='min(680px, calc(100vw - 24px))'
        modalText={
          review && reviewSessionId ? (
            <EkycReviewPanel
              key={`${reviewSessionId}-${review.decision}`}
              sessionId={reviewSessionId}
              initialDecision={review.decision}
              onUpdated={() => void refetch()}
              onSuccess={() => setReview(null)}
              onCancel={() => setReview(null)}
            />
          ) : null
        }
      />

      <DialogModal
        mode='DELETE'
        okText='Từ chối'
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        content={<DialogReject />}
        title={<span className='text-red-600'>Từ chối hồ sơ</span>}
      />
      <DialogModal
        mode='DELETE'
        okText='Hủy xác thực'
        onCancel={() => {}}
        onOk={() => {}}
        open={false}
        content={<DialogCancel />}
        title={<span className='text-red-600'>Hủy xác thực</span>}
      />
    </div>
  )
}

export default ConfirmEKYC
