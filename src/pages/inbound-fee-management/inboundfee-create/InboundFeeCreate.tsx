import { Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useInboundFeeCreateMutation } from '@services/inboundFeeService'
import { InboundFeeForm } from '../inboundfee-form'
import { PATHS } from '@constants/pathConstant'
import { useTranslation } from 'react-i18next'

const InboundFeeCreate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createInboundFee, { isLoading }] = useInboundFeeCreateMutation()

  const handleFinish = async (values: any) => {
    try {
      console.log('Creating inbound fee with values:', values)
      console.log('Payload structure:', JSON.stringify(values, null, 2))

      // InboundFeeForm already handles validation and transformation
      await createInboundFee({ createInboundFeeDto: values }).unwrap()
      message.success(t('messages.createInboundFeeSuccess'))
      navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
    } catch (error: any) {
      console.error('Error creating inbound fee:', error)

      // Handle different error types
      if (error?.data?.message) {
        // Backend error message
        message.error(error.data.message)
      } else if (error?.message) {
        // Network or other errors
        message.error(error.message)
      } else {
        // Fallback error message
        message.error(t('messages.createInboundFeeFailed'))
      }
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
  }

  return (
    <Card title={t('labels.createInboundFee')}>
      <InboundFeeForm
        onFinish={handleFinish}
        onCancel={handleCancel}
        loading={isLoading}
      />
    </Card>
  )
}

export default InboundFeeCreate