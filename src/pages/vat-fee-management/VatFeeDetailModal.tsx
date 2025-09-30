import { Modal, Descriptions, Spin, Alert, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useVatFeeFindOneQuery } from '@services/vatFeeService'
import { VatFee, VatFeeApplicationType } from '@type/vat-fee'
import { convertMiniPercentToPercent } from '@utils/helperFunctions'
import moment from 'moment'

interface VatFeeDetailModalProps {
  open: boolean
  onCancel: () => void
  vatFeeId?: string
}

const VatFeeDetailModal = ({
  open,
  onCancel,
  vatFeeId
}: VatFeeDetailModalProps) => {
  const { t } = useTranslation()

  const {
    data: vatFeeResponse,
    isLoading,
    error
  } = useVatFeeFindOneQuery({ id: vatFeeId! }, { skip: !vatFeeId || !open })

  // API trả về data trực tiếp, không có nested 'data' property
  const vatFee = vatFeeResponse

  const handleCancel = () => {
    onCancel()
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Không thiết lập'
    return moment(dateString).format('DD/MM/YYYY HH:mm:ss')
  }

  const getApplicationTypeLabel = (type: VatFeeApplicationType) => {
    const labels = {
      [VatFeeApplicationType.SYSTEM]: 'Hệ thống',
      [VatFeeApplicationType.INDIVIDUAL]: 'Đối tượng riêng',
      [VatFeeApplicationType.ACCOUNT_GROUP]: 'Nhóm tài khoản'
    }
    return labels[type] || type
  }

  const getApplicationTypeColor = (type: VatFeeApplicationType) => {
    const colors = {
      [VatFeeApplicationType.SYSTEM]: 'blue',
      [VatFeeApplicationType.INDIVIDUAL]: 'orange',
      [VatFeeApplicationType.ACCOUNT_GROUP]: 'green'
    }
    return colors[type] || 'default'
  }

  return (
    <Modal
      title='Chi tiết cấu hình phí VAT'
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      className='vat-fee-detail-modal'
    >
      {isLoading && (
        <div className='flex justify-center py-8'>
          <Spin size='large' />
        </div>
      )}

      {error && (
        <Alert
          type='error'
          message='Tải dữ liệu thất bại'
          className='mb-4'
        />
      )}

      {vatFee && (
        <Descriptions bordered column={2} size='middle'>
          <Descriptions.Item label='Đối tượng áp dụng'>
            <Tag color={getApplicationTypeColor(vatFee.applicationType)}>
              {getApplicationTypeLabel(vatFee.applicationType)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label='Nhóm tài khoản'>
            <span className='font-medium'>
              {vatFee.accountGroup || 'Không thiết lập'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label='Số tài khoản'>
            <span className='font-medium'>
              {vatFee.accountNumber || 'Không thiết lập'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label='Phí linh hoạt (%)'>
            <span className='font-medium'>
              {vatFee.flexibleFeeMpct !== undefined ? `${convertMiniPercentToPercent(vatFee.flexibleFeeMpct)}%` : 'Không thiết lập'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label='Thời gian bắt đầu'>
            <span className='font-medium'>
              {formatDateTime(vatFee.startDate)}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label='Thời gian kết thúc'>
            <span className='font-medium'>
              {vatFee.endDate ? (
                formatDateTime(vatFee.endDate)
              ) : (
                <span className='text-gray-500 italic'>Không giới hạn</span>
              )}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label='Trạng thái'>
            <Tag color={vatFee.active ? 'success' : 'error'}>
              {vatFee.active ? 'Hoạt động' : 'Không hoạt động'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  )
}

export default VatFeeDetailModal
