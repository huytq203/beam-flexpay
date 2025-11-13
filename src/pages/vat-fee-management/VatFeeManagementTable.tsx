import { Table, Tag, Space, Button, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { VatFeeFindAllApiArg, VatFee, VatFeeApplicationType } from '@type/vat-fee'
import { PATHS } from '@constants/pathConstant'
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import moment from 'moment'
import VatFeeDetailModal from './VatFeeDetailModal'
import { convertMiniPercentToPercent } from '@utils/helperFunctions'
import CellContent from '@components/cell-content/CellContent'

interface VatFeeManagementTableProps {
  vatFees?: VatFee[]
  search: VatFeeFindAllApiArg
  setSearch: (search: VatFeeFindAllApiArg) => void
  pagination?: {
    page: number
    take: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

const VatFeeManagementTable = ({ vatFees, search, setSearch, pagination }: VatFeeManagementTableProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedVatFeeId, setSelectedVatFeeId] = useState<string>()

  const formatApplicationType = (type: VatFeeApplicationType) => {
    switch (type) {
      case VatFeeApplicationType.SYSTEM:
        return { text: 'Hệ thống', color: 'blue' }
      case VatFeeApplicationType.ACCOUNT_GROUP:
        return { text: 'Nhóm tài khoản', color: 'green' }
      case VatFeeApplicationType.INDIVIDUAL:
        return { text: 'Đối tượng riêng', color: 'orange' }
      default:
        return { text: type, color: 'default' }
    }
  }


  const handleView = (record: VatFee) => {
    setSelectedVatFeeId(record.id)
    setDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setSelectedVatFeeId(undefined)
  }

  const handleEdit = (record: VatFee) => {
    navigate(PATHS.FEE_V2.VAT_FEE.UPDATE(record.id))
  }

  const handleDelete = (record: VatFee) => {
    console.log('Delete record:', record)
    // Handle delete logic
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span>{((search.page || 1) - 1) * (search.take || 10) + index + 1}</span>
      )
    },
    {
      title: 'Đối tượng áp dụng',
      dataIndex: 'applicationType',
      key: 'applicationType',
      width: 150,
      render: (type: VatFeeApplicationType) => {
        const formatted = formatApplicationType(type)
        return <CellContent data={formatted.text} color={formatted.color} />
      }
    },
    {
      title: 'Tài khoản/Nhóm',
      key: 'account',
      width: 200,
      render: (record: VatFee) => {
        if (record.applicationType === VatFeeApplicationType.SYSTEM) {
          return <CellContent data="Toàn hệ thống" />
        }
        if (record.applicationType === VatFeeApplicationType.ACCOUNT_GROUP) {
          return <CellContent data={record.accountGroupName || record.accountGroup || '-'} />
        }
        if (record.applicationType === VatFeeApplicationType.INDIVIDUAL) {
          return <CellContent data={record.fullname || record.accountNumber || '-'} />
        }
        return '-'
      }
    },
    {
      title: 'Mức thuế VAT',
      dataIndex: 'flexibleFeeMpct',
      key: 'flexibleFeeMpct',
      width: 120,
      align: 'center' as const,
      render: (mpct: number) => (
        <span className="font-semibold text-blue-600">{convertMiniPercentToPercent(mpct)}</span>
      )
    },
    {
      title: 'Thời gian áp dụng',
      key: 'dateRange',
      width: 360,
      render: (record: VatFee) => (
        <div>
          <span>{moment(record.startDate).format('DD/MM/YYYY HH:mm:ss')}</span>
          <span> - </span>
          <span>{record.endDate ? moment(record.endDate).format('DD/MM/YYYY HH:mm:ss') : 'Không giới hạn'}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 120,
      align: 'center' as const,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Đang hoạt động' : 'Không hoạt động'}
        </Tag>
      )
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <span>{moment(date).format('DD/MM/YYYY HH:mm:ss')}</span>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (record: VatFee) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <>
      <Table
        columns={columns}
        dataSource={vatFees || []}
        scroll={{ x: 1400 }}
        rowKey='id'
        size='small'
        bordered
        pagination={{
          current: pagination?.page || search.page,
          pageSize: pagination?.take || search.take,
          total: pagination?.itemCount || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} bản ghi`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange(page, pageSize) {
            setSearch({
              ...search,
              page,
              take: pageSize
            })
          }
        }}
      />

      <VatFeeDetailModal
        key={selectedVatFeeId || 'detail-modal'}
        open={detailModalOpen}
        onCancel={handleCloseDetailModal}
        vatFeeId={selectedVatFeeId}
      />
    </>
  )
}

export default VatFeeManagementTable