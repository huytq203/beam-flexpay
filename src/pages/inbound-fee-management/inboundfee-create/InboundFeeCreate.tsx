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

      // InboundFeeForm already handles the transformation, just pass through
      await createInboundFee({ createInboundFeeDto: values }).unwrap()
      message.success('Thêm cấu hình phí đầu vào thành công')
      navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
    } catch (error: any) {
      console.error('Error creating inbound fee:', error)
      message.error(error?.data?.message || 'Có lỗi xảy ra khi thêm cấu hình phí')
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
  }

  return (
    <Card title="Thêm mới phí đầu vào">
      <InboundFeeForm
        onFinish={handleFinish}
        onCancel={handleCancel}
        loading={isLoading}
      />
    </Card>
  )
}

export default InboundFeeCreate