import { useOutboundFeeApproveMutation } from '@services/outboundFeeService'
import { OutboundFeeType } from '@type/outbound-fee'
import { getVNDateTimeStringFromUTCTimeString } from '@utils/helperFunctions'
import { Alert, Descriptions, message, Modal, Typography } from 'antd'

const { Text } = Typography

interface OutboundFeeApproveModalProps {
  open: boolean
  outboundFee: OutboundFeeType | null
  onClose: () => void
}

const OutboundFeeApproveModal = ({
  open,
  outboundFee,
  onClose
}: OutboundFeeApproveModalProps) => {
  const [approveOutboundFee, { isLoading }] = useOutboundFeeApproveMutation()

  const handleApprove = async () => {
    if (!outboundFee?.id) return

    try {
      await approveOutboundFee({ id: outboundFee.id }).unwrap()
      message.success('Duyệt phí thành công!')
      onClose()
    } catch (error: any) {
      console.error('Error approving outbound fee:', error)

      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi duyệt phí'

      if (errorMessage.includes('CANNOT_APPROVE') || errorMessage.includes('INVALID_STATUS')) {
        message.error('Không thể duyệt phí ở trạng thái hiện tại. Chỉ có thể duyệt phí đang chờ duyệt.')
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
      title="Xác nhận duyệt phí"
      open={open}
      onOk={handleApprove}
      onCancel={handleCancel}
      okText="Xác nhận duyệt"
      cancelText="Hủy"
      confirmLoading={isLoading}
      width={600}
      destroyOnClose
      okButtonProps={{
        type: 'primary',
        disabled: !outboundFee
      }}
    >
      {outboundFee ? (
        <>
          <Alert
            message="Bạn có chắc chắn muốn duyệt phí này?"
            description="Sau khi duyệt, phí sẽ được áp dụng theo thời gian đã cấu hình."
            type="info"
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

export default OutboundFeeApproveModal
