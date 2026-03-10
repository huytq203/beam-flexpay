import { CardComponent, DialogModal, ModalComponent, Table } from '@components/index'
import { useSVG } from '@hooks/useSVG'
import { useGetEKYCByIdQuery } from '@services/apiEKYC'
import React, { useState } from 'react'
import FormSearch from './components/FormSearch'
import BusinessComfirm from './components/BusinessComfirm'
import { Column } from './columns/ConfirmEKYC.column'
import useConfirmEKYC from './hooks/useConfirmEKYC'
import DialogReject from '@pages/wallet-administration/confirm-ekyc/components/DialogReject'
import DialogCancel from '@pages/wallet-administration/confirm-ekyc/components/DialogCancel'

const ConfirmEKYC = () => {
  const { dataSource, isLoading, page, pageSize, setPage, setPageSize, total, handleSearch, handleReset } = useConfirmEKYC()

  const { svg } = useSVG()

  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data: detailData, isLoading: isDetailLoading } = useGetEKYCByIdQuery(selectedId!, {
    skip: !selectedId,
  })

  const openDetail = (id: string) => {
    setSelectedId(id)
    setIsDetailOpen(true)
  }

  const closeDetail = () => {
    setIsDetailOpen(false)
    setSelectedId(undefined)
  }

  const columns = Column({ svg, onViewDetail: openDetail })

  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch onSearch={handleSearch} onReset={handleReset} />} />
      <CardComponent content={
        <Table
          bordered
          size='small'
          scroll={{ x: 'max-content' }}
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total ?? 0,
            showSizeChanger: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} bản ghi`,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
        />
      } />

      <ModalComponent
        title='Chi tiết hồ sơ'
        onCancel={closeDetail}
        onOk={closeDetail}
        open={isDetailOpen}
        width='75%'
        modalText={<BusinessComfirm data={detailData} isLoading={isDetailLoading} />}
      />

      <DialogModal mode='DELETE' okText='Từ chối' onCancel={() => { }} onOk={() => { }} open={false} content={<DialogReject />} title={<span className='text-red-600'>Từ chối hồ sơ</span>} />
      <DialogModal mode='DELETE' okText='Hủy xác thực' onCancel={() => { }} onOk={() => { }} open={false} content={<DialogCancel />} title={<span className='text-red-600'>Hủy xác thực</span>} />
    </div>
  )
}

export default ConfirmEKYC