import { Card, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'
import { OutboundFeeForm } from '../outboundfee-form'
import { useOutboundFeeCreateMutation } from '@services/outboundFeeService'

const OutboundFeeCreate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createOutboundFee, { isLoading }] = useOutboundFeeCreateMutation()

  const handleFinish = async (values: any) => {
    try {
      console.log('Creating outbound fee with values:', values)

      // Call the actual API
      const result = await createOutboundFee({
        createOutboundFeeDto: values
      }).unwrap()

      console.log('Created outbound fee with ID:', result.id)
      message.success(t('messages.createOutboundFeeSuccess') || 'Tạo phí outbound thành công')

      // Navigate back to management page after successful creation
      navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
    } catch (error: any) {
      console.error('Error creating outbound fee:', error)

      // Handle different error scenarios
      const errorMessage = error?.data?.message ||
                          error?.message ||
                          t('messages.createOutboundFeeFailed') ||
                          'Tạo phí outbound thất bại'

      message.error(errorMessage)
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
  }

  return (
    <div className="outbound-fee-create">
      <Card
        title={t('labels.createOutboundFee')}
        className="shadow-sm"
      >
        <OutboundFeeForm
          onFinish={handleFinish}
          onCancel={handleCancel}
          loading={isLoading}
          isEdit={false}
        />
      </Card>
    </div>
  )
}

export default OutboundFeeCreate