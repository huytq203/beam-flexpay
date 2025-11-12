import { useOutboundFeeRemoveMutation } from '@services/outboundFeeService'
import {
  OutboundFeeApplicationType,
  OutboundFeeTransactionType,
  OutboundFeeType
} from '@type/outbound-fee'
import { getVNDateTimeStringFromUTCTimeString } from '@utils/helperFunctions'
import { Alert, Descriptions, Modal, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Options } from '@constants/options'

const { Text } = Typography

interface OutboundFeeDeleteModalProps {
  open: boolean
  outboundFee: OutboundFeeType | null
  onClose: () => void
}

const OutboundFeeDeleteModal: React.FC<OutboundFeeDeleteModalProps> = ({
  open,
  outboundFee,
  onClose
}) => {
  const { t } = useTranslation()
  const [deleteOutboundFee, { isLoading }] = useOutboundFeeRemoveMutation()

  const getApplicationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [OutboundFeeApplicationType.SYSTEM]: t('labels.system'),
      [OutboundFeeApplicationType.INDIVIDUAL]: t('labels.individual'),
      [OutboundFeeApplicationType.ACCOUNT_GROUP]: t('labels.accountGroup')
    }
    return labels[type] || type
  }

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [OutboundFeeTransactionType.DEPOSIT]: t('labels.deposit'),
      [OutboundFeeTransactionType.WITHDRAWAL]: t('labels.withdrawal'),
      [OutboundFeeTransactionType.PAYMENT]: t('labels.payment'),
      [OutboundFeeTransactionType.TRANSFER]: t('labels.transfer'),
      [OutboundFeeTransactionType.REFUND]: t('labels.refund')
    }
    return labels[type] || type
  }

  const handleDelete = async () => {
    if (!outboundFee?.id) return

    try {
      await deleteOutboundFee({ id: outboundFee.id }).unwrap()
      message.success('Xóa phí thành công!')
      onClose()
    } catch (error: any) {
      console.error('Error deleting outbound fee:', error)

      // Handle error messages from backend
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi xóa phí'
      message.error(errorMessage)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal
      title="Xác nhận xóa phí"
      open={open}
      onOk={handleDelete}
      onCancel={handleCancel}
      okText="Xác nhận xóa"
      cancelText="Hủy"
      confirmLoading={isLoading}
      width={600}
      destroyOnClose
      okButtonProps={{
        danger: true,
        disabled: !outboundFee
      }}
    >
      {outboundFee ? (
        <>
          <Alert
            message="Bạn có chắc chắn muốn xóa phí này?"
            description="Hành động này không thể hoàn tác."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Descriptions
            column={1}
            bordered
            size="small"
          >
            <Descriptions.Item label="Loại áp dụng">
              <Text strong>{getApplicationTypeLabel(outboundFee.applicationType)}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Loại giao dịch">
              <Text strong>{getTransactionTypeLabel(outboundFee.transactionType)}</Text>
            </Descriptions.Item>

            {outboundFee.accountGroup && (
              <Descriptions.Item label="Nhóm tài khoản">
                <Text>{outboundFee.accountGroup}</Text>
              </Descriptions.Item>
            )}

            <Descriptions.Item label="Khoảng giá">
              <Text>
                {outboundFee.priceFrom?.toLocaleString() || '0'} VND - {outboundFee.priceTo?.toLocaleString() || '0'} VND
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian áp dụng">
              <Text>
                {getVNDateTimeStringFromUTCTimeString(outboundFee.startDate)}
                {outboundFee.endDate && (
                  <> đến {getVNDateTimeStringFromUTCTimeString(outboundFee.endDate)}</>
                )}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </>
      ) : (
        <Alert
          message="Không tìm thấy thông tin phí"
          type="warning"
          showIcon
        />
      )}
    </Modal>
  )
}

export default OutboundFeeDeleteModal
