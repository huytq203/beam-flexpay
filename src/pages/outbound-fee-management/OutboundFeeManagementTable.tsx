import { Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useOutboundFeeColumns } from './OutboundFeeManagement.schema'
import { OutboundFeeType, Pagination } from '@type/outbound-fee'
import { PATHS } from '@constants/pathConstant'
import OutboundFeeDetailModal from './OutboundFeeDetailModal'
import OutboundFeeApproveModal from './OutboundFeeApproveModal'
import OutboundFeeRejectModal from './OutboundFeeRejectModal'
import OutboundFeeDeleteModal from './OutboundFeeDeleteModal'

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

  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedOutboundFeeForApprove, setSelectedOutboundFeeForApprove] = useState<OutboundFeeType | null>(null)

  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [selectedOutboundFeeForReject, setSelectedOutboundFeeForReject] = useState<OutboundFeeType | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedOutboundFeeForDelete, setSelectedOutboundFeeForDelete] = useState<OutboundFeeType | null>(null)

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
    setSelectedOutboundFeeForDelete(record)
    setDeleteModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false)
    setSelectedOutboundFeeForDelete(null)
  }

  const handleApprove = (record: OutboundFeeType) => {
    setSelectedOutboundFeeForApprove(record)
    setApproveModalOpen(true)
  }

  const handleCloseApproveModal = () => {
    setApproveModalOpen(false)
    setSelectedOutboundFeeForApprove(null)
  }

  const handleReject = (record: OutboundFeeType) => {
    setSelectedOutboundFeeForReject(record)
    setRejectModalOpen(true)
  }

  const handleCloseRejectModal = () => {
    setRejectModalOpen(false)
    setSelectedOutboundFeeForReject(null)
  }

  const currentPage = pagination?.page || search.page
  const pageSize = pagination?.take || search.take

  return (
    <>
      <Table
        columns={useOutboundFeeColumns(
          t,
          handleView,
          handleEdit,
          handleDelete,
          handleApprove,
          handleReject,
          currentPage,
          pageSize
        )}
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

      {/* Detail Modal */}
      <OutboundFeeDetailModal
        key={selectedOutboundFeeId || 'detail-modal'}
        visible={detailModalOpen}
        onClose={handleCloseDetailModal}
        outboundFeeId={selectedOutboundFeeId}
      />

      {/* Approve Modal */}
      <OutboundFeeApproveModal
        open={approveModalOpen}
        outboundFee={selectedOutboundFeeForApprove}
        onClose={handleCloseApproveModal}
      />

      {/* Reject Modal */}
      <OutboundFeeRejectModal
        open={rejectModalOpen}
        outboundFee={selectedOutboundFeeForReject}
        onClose={handleCloseRejectModal}
      />

      {/* Delete Modal */}
      <OutboundFeeDeleteModal
        open={deleteModalOpen}
        outboundFee={selectedOutboundFeeForDelete}
        onClose={handleCloseDeleteModal}
      />
    </>
  )
}

export default OutboundFeeManagementTable
