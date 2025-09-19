import { Table } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useOutboundFeeColumns } from './OutboundFeeManagement.schema'
import { OutboundFeeFindAllApiArg, OutboundFeeFindAllApiResponse, OutboundFeeType } from '@type/outbound-fee'
import { PATHS } from '@constants/pathConstant'
import { Pagination } from '@type/common'
import OutboundFeeDetailModal from './OutboundFeeDetailModal'

interface OutboundFeeManagementTableProps {
  outboundFees?: OutboundFeeType[]
  search: OutboundFeeFindAllApiArg
  setSearch: (search: OutboundFeeFindAllApiArg) => void
  pagination?: Pagination
}

const OutboundFeeManagementTable = ({ outboundFees, search, setSearch, pagination }: OutboundFeeManagementTableProps) => {
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

  console.log('outboundFees 1', outboundFees)

  return (
    <>
      <Table
        columns={useOutboundFeeColumns(t, handleView, handleEdit, handleDelete)}
        dataSource={outboundFees || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: pagination?.page || search.page,
          pageSize: pagination?.take || search.take,
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
        open={detailModalOpen}
        onCancel={handleCloseDetailModal}
        outboundFeeId={selectedOutboundFeeId}
      />
    </>
  )
}

export default OutboundFeeManagementTable