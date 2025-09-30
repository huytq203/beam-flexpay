import { Modal, Descriptions, Tag, Divider } from 'antd'
import { InboundFeeType } from '@type/inbound-fee'
import { convertLocalStringNumber } from '@utils/helperFunctions'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

interface InboundFeeDetailModalProps {
  visible: boolean
  onClose: () => void
  fee: InboundFeeType
}

const InboundFeeDetailModal = ({ visible, onClose, fee }: InboundFeeDetailModalProps) => {
  const { t } = useTranslation()

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return t('labels.notSet')
    return `${convertLocalStringNumber(value)} VND`
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

  const getStatusLabel = () => {
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

  return (
    <Modal
      title="Chi tiết cấu hình phí đầu vào"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Mã cấu hình" span={1}>
          {fee.id}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái" span={1}>
          {getStatusLabel()}
        </Descriptions.Item>

        <Descriptions.Item label="Đối tượng áp dụng" span={1}>
          {getApplicationTypeLabel(fee.applicationType)}
        </Descriptions.Item>
        <Descriptions.Item label="Loại giao dịch" span={1}>
          {getTransactionTypeLabel(fee.transactionType)}
        </Descriptions.Item>

        {fee.accountGroup && (
          <Descriptions.Item label="Nhóm tài khoản" span={2}>
            {fee.accountGroup}
          </Descriptions.Item>
        )}

        {fee.accountId && (
          <Descriptions.Item label="Tài khoản" span={2}>
            {fee.accountId}
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Phương thức giao dịch" span={1}>
          {fee.method || 'Tất cả'}
        </Descriptions.Item>
        <Descriptions.Item label="Nhà cung cấp" span={1}>
          {fee.provider || 'Tất cả'}
        </Descriptions.Item>

        <Descriptions.Item label="Ngân hàng" span={2}>
          {fee.bank || 'Tất cả'}
        </Descriptions.Item>

        <Descriptions.Item label="Thời gian áp dụng" span={1}>
          {moment(fee.startDate).format('DD/MM/YYYY HH:mm:ss')}
        </Descriptions.Item>
        <Descriptions.Item label="Thời gian kết thúc" span={1}>
          {fee.endDate ? moment(fee.endDate).format('DD/MM/YYYY HH:mm:ss') : 'Không giới hạn'}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo" span={2}>
          {moment(fee.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        </Descriptions.Item>
      </Descriptions>

      <Divider>Thông tin gói phí</Divider>

      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Mức giao dịch từ (VND)" span={1}>
          {formatCurrency(fee.priceFrom)}
        </Descriptions.Item>
        <Descriptions.Item label="Mức giao dịch đến (VND)" span={1}>
          {formatCurrency(fee.priceTo)}
        </Descriptions.Item>

        <Descriptions.Item label="Phí linh hoạt (%)" span={1}>
          {fee.flexibleFeePercent ? `${fee.flexibleFeePercent}%` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Phí cố định (VND)" span={1}>
          {fee.fixedFee ? formatCurrency(fee.fixedFee) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="Phí tối thiểu (VND)" span={1}>
          {fee.minFee ? formatCurrency(fee.minFee) : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Phí tối đa (VND)" span={1}>
          {fee.maxFee ? formatCurrency(fee.maxFee) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="VAT (%)" span={2}>
          {fee.vatPercent}%
        </Descriptions.Item>
      </Descriptions>

      <Divider>Công thức tính phí</Divider>

      <div className="bg-gray-50 p-4 rounded">
        <p className="mb-2">
          <strong>Phí giao dịch = </strong>
          {fee.flexibleFeePercent && fee.fixedFee ? (
            <>
              Max(Giá trị giao dịch × {fee.flexibleFeePercent}%, {formatCurrency(fee.fixedFee)})
            </>
          ) : fee.flexibleFeePercent ? (
            <>Giá trị giao dịch × {fee.flexibleFeePercent}%</>
          ) : (
            <>{formatCurrency(fee.fixedFee)}</>
          )}
        </p>
        {fee.minFee && (
          <p className="mb-2">
            <strong>Phí tối thiểu:</strong> {formatCurrency(fee.minFee)}
          </p>
        )}
        {fee.maxFee && (
          <p className="mb-2">
            <strong>Phí tối đa:</strong> {formatCurrency(fee.maxFee)}
          </p>
        )}
        <p>
          <strong>Thuế VAT:</strong> Phí giao dịch × {fee.vatPercent}%
        </p>
        <p className="mt-2 text-blue-600 font-semibold">
          <strong>Tổng phí = Phí giao dịch + VAT</strong>
        </p>
      </div>
    </Modal>
  )
}

export default InboundFeeDetailModal