import { useOutboundFeeRejectMutation } from '@services/outboundFeeService'
import { OutboundFeeType } from '@type/outbound-fee'
import { getVNDateTimeStringFromUTCTimeString } from '@utils/helperFunctions'
import { Alert, Descriptions, Modal, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface OutboundFeeRejectModalProps {
  open: boolean
  outboundFee: OutboundFeeType | null
  onClose: () => void
}

const OutboundFeeRejectModal: React.FC<OutboundFeeRejectModalProps> = ({
  open,
  outboundFee,
  onClose
}) => {
  const [rejectOutboundFee, { isLoading }] = useOutboundFeeRejectMutation()

  const handleReject = async () => {
    if (!outboundFee?.id) return

    try {
      await rejectOutboundFee({
        id: outboundFee.id
      }).unwrap()

      message.success('Từ chối phí thành công!')
      onClose()
    } catch (error: any) {
      console.error('Error rejecting outbound fee:', error)

      // Handle specific error messages from backend
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi từ chối phí'

      if (errorMessage.includes('CANNOT_REJECT') || errorMessage.includes('INVALID_STATUS')) {
        message.error('Không thể từ chối phí ở trạng thái hiện tại. Chỉ có thể từ chối phí đang chờ duyệt.')
      } else {
        message.error(errorMessage)
      }
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Modal
      title="Xác nhận từ chối phí"
      open={open}
      onOk={handleReject}
      onCancel={handleCancel}
      okText="Xác nhận từ chối"
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
            message="Bạn có chắc chắn muốn từ chối phí này?"
            description="Sau khi từ chối, phí sẽ không được áp dụng."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Descriptions
            column={1}
            bordered
            size="small"
          >
            <Descriptions.Item label="Loại áp dụng">
              <Text strong>{outboundFee.applicationType}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Loại giao dịch">
              <Text strong>{outboundFee.transactionType}</Text>
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

export default OutboundFeeRejectModal
