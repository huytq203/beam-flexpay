import { Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useOutboundFeeColumns } from './OutboundFeeManagement.schema'
import { OutboundFeeType, Pagination } from '@type/outbound-fee'
import { PATHS } from '@constants/pathConstant'
import OutboundFeeDetailModal from './OutboundFeeDetailModal'

interface OutboundFeeManagementTableProps {
  outboundFees?: OutboundFeeType[]
  search: any
  setSearch: (search: any) => void
  pagination?: Pagination
}

const OutboundFeeManagementTable = ({
                                      outboundFees,
                                      search,
                                      setSearch,
                                      pagination
                                    }: OutboundFeeManagementTableProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedOutboundFeeId, setSelectedOutboundFeeId] = useState<string>()

  const handleView = (record: OutboundFeeType) => {
    setSelectedOutboundFeeId(record.id)
    setDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedOutboundFeeId(undefined)
  }

  const handleEdit = (record: OutboundFeeType) => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.UPDATE(record.id))
  }

  const handleDelete = (record: OutboundFeeType) => {
    console.log('Delete record:', record)
    // Handle delete logic
  }

  const currentPage = pagination?.page || search.page
  const pageSize = pagination?.take || search.take

  return (
    <>
      <Table
        columns={useOutboundFeeColumns(t, handleView, handleEdit, handleDelete, currentPage, pageSize)}
        dataSource={outboundFees || []}
        scroll={{ x: '100%' }}
        rowKey="id"
        size="small"
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

      <OutboundFeeDetailModal
        visible={detailModalOpen}
        onClose={handleCloseDetailModal}
        outboundFeeId={selectedOutboundFeeId}
      />
    </>
  )
}

export default OutboundFeeManagementTable
