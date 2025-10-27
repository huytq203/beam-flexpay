import { Card, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useOutboundFeeCreateMutation } from '@services/outboundFeeService'
import { OutboundFeeForm } from '../outboundfee-form'
import { PATHS } from '@constants/pathConstant'
import { useTranslation } from 'react-i18next'

const OutboundFeeCreate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createOutboundFee, { isLoading }] = useOutboundFeeCreateMutation()

  const handleFinish = async (values: any) => {
    try {
      await createOutboundFee({ createOutboundFeeDto: values }).unwrap()
      message.success(t('messages.createOutboundFeeSuccess'))
      navigate(PATHS.FEE_V2?.OUTBOUND_FEE?.MANAGEMENT || '/fee-v2/outbound-fee-management')
    } catch (error: any) {
      if (error?.data?.message) {
        message.error(error.data.message)
      } else if (error?.message) {
        message.error(error.message)
      } else {
        message.error(t('messages.createOutboundFeeFailed'))
      }
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2?.OUTBOUND_FEE?.MANAGEMENT || '/fee-v2/outbound-fee-management')
  }

  return (
    <Card title={t('labels.createOutboundFee')}>
      <OutboundFeeForm
        onFinish={handleFinish}
        onCancel={handleCancel}
        loading={isLoading}
      />
    </Card>
  )
}

export default OutboundFeeCreate
