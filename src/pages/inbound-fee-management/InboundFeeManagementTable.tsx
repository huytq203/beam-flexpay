import { Table, Space, Button, Tag, Tooltip, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InboundFeeType, Pagination } from '@type/inbound-fee'
import { useInboundFeeRemoveMutation } from '@services/inboundFeeService'
import InboundFeeDetailModal from './InboundFeeDetailModal'
import { convertLocalStringNumber } from '@utils/helperFunctions'
import moment from 'moment'
import { PATHS } from '@constants/pathConstant'

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
  const [selectedFee, setSelectedFee] = useState<InboundFeeType | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [removeFee] = useInboundFeeRemoveMutation()

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '-'
    return `${convertLocalStringNumber(value)} VND`
  }

  const handleView = (record: InboundFeeType) => {
    setSelectedFee(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: InboundFeeType) => {
    navigate(`${PATHS.FEE_V2?.INBOUND_FEE?.UPDATE}/${record.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await removeFee({ id }).unwrap()
      message.success('Xóa phí thành công')
    } catch (error) {
      message.error('Xóa phí thất bại')
    }
  }

  const getApplicationTypeLabel = (type: string) => {
    switch (type) {
      case 'system':
        return <Tag color="blue">Hệ thống</Tag>
      case 'individual':
        return <Tag color="green">Đối tượng riêng</Tag>
      case 'account_group':
        return <Tag color="orange">Nhóm tài khoản</Tag>
      default:
        return type
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Nạp tiền'
      case 'withdrawal':
        return 'Rút tiền'
      case 'payment':
        return 'Thanh toán'
      case 'transfer':
        return 'Chuyển tiền'
      case 'refund':
        return 'Hoàn tiền'
      default:
        return type
    }
  }

  const getStatusLabel = (fee: InboundFeeType) => {
    const now = moment()
    const startDate = moment(fee.startDate)
    const endDate = fee.endDate ? moment(fee.endDate) : null

    if (now.isBefore(startDate)) {
      return <Tag color="warning">Chưa áp dụng</Tag>
    }
    if (endDate && now.isAfter(endDate)) {
      return <Tag color="default">Hết hạn</Tag>
    }
    return <Tag color="success">Đang áp dụng</Tag>
  }

  const columns = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => {
        const page = search?.page || 1
        const take = search?.take || 10
        return (page - 1) * take + index + 1
      }
    },
    {
      title: 'Đối tượng áp dụng',
      dataIndex: 'applicationType',
      key: 'applicationType',
      width: 150,
      render: (type: string) => getApplicationTypeLabel(type)
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      render: (type: string) => getTransactionTypeLabel(type)
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      width: 150,
      render: (method: string) => method || 'Tất cả'
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bank',
      key: 'bank',
      width: 120,
      render: (bank: string) => bank || 'Tất cả'
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'provider',
      key: 'provider',
      width: 100,
      render: (provider: string) => provider || 'Tất cả'
    },
    {
      title: 'Mức giao dịch',
      key: 'priceRange',
      width: 180,
      render: (record: InboundFeeType) => (
        <span>
          {formatCurrency(record.priceFrom)} - {formatCurrency(record.priceTo)}
        </span>
      )
    },
    {
      title: 'Phí linh hoạt (%)',
      dataIndex: 'flexibleFeePercent',
      key: 'flexibleFeePercent',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      title: 'Phí cố định',
      dataIndex: 'fixedFee',
      key: 'fixedFee',
      width: 120,
      align: 'right' as const,
      render: (value: number) => value ? formatCurrency(value) : '-'
    },
    {
      title: 'VAT (%)',
      dataIndex: 'vatPercent',
      key: 'vatPercent',
      width: 80,
      align: 'right' as const,
      render: (value: number) => `${value}%`
    },
    {
      title: 'Thời gian áp dụng',
      key: 'dateRange',
      width: 300,
      render: (record: InboundFeeType) => (
        <div>
          <span>{moment(record.startDate).format('DD/MM/YYYY HH:mm')}</span>
          <span> - </span>
          <span>{record.endDate ? moment(record.endDate).format('DD/MM/YYYY HH:mm') : 'Không giới hạn'}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (record: InboundFeeType) => getStatusLabel(record)
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (record: InboundFeeType) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa cấu hình phí này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const handleTableChange = (paginationInfo: any) => {
    setSearch({
      ...search,
      page: paginationInfo.current,
      take: paginationInfo.pageSize
    })
  }

  return (
    <>
      <Table
        columns={columns}
        dataSource={inboundFees}
        rowKey="id"
        scroll={{ x: 1800 }}
        pagination={{
          current: pagination?.page || 1,
          pageSize: pagination?.take || 10,
          total: pagination?.itemCount || 0,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
      />

      {selectedFee && (
        <InboundFeeDetailModal
          visible={detailModalVisible}
          onClose={() => {
            setDetailModalVisible(false)
            setSelectedFee(null)
          }}
          fee={selectedFee}
        />
      )}
    </>
  )
}

export default InboundFeeManagementTable