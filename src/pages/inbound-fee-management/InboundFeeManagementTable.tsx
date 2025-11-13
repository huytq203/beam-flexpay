import { Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useInboundFeeColumns } from './InboundFeeManagement.schema'
import { InboundFeeType, Pagination } from '@type/inbound-fee'
import { PATHS } from '@constants/pathConstant'
import InboundFeeDetailModal from './InboundFeeDetailModal'

interface InboundFeeManagementTableProps {
  inboundFees?: InboundFeeType[]
  search: any
  setSearch: (search: any) => void
  pagination?: Pagination
}

const InboundFeeManagementTable = ({
  inboundFees,
  search,
  setSearch,
  pagination
}: InboundFeeManagementTableProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedInboundFeeId, setSelectedInboundFeeId] = useState<string>()

  const handleView = (record: InboundFeeType) => {
    setSelectedInboundFeeId(record.id)
    setDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedInboundFeeId(undefined)
  }

  const handleEdit = (record: InboundFeeType) => {
    navigate(`${PATHS.FEE_V2?.INBOUND_FEE?.UPDATE}/${record.id}`)
  }

  const handleDelete = (record: InboundFeeType) => {
    console.log('Delete record:', record)
    // Handle delete logic
  }

  const currentPage = pagination?.page || search.page
  const pageSize = pagination?.take || search.take

  return (
    <>
      <Table
        columns={useInboundFeeColumns(t, handleView, handleEdit, handleDelete, currentPage, pageSize)}
        dataSource={inboundFees || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pagination?.itemCount || 0,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />

      <InboundFeeDetailModal
        key={selectedInboundFeeId || 'detail-modal'}
        visible={detailModalOpen}
        onClose={handleCloseDetailModal}
        inboundFeeId={selectedInboundFeeId}
      />
    </>
  )
}

export default InboundFeeManagementTable
