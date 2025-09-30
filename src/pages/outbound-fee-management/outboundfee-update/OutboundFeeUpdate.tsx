import { Card, message, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'
import { OutboundFeeForm } from '../outboundfee-form'
import { useOutboundFeeFindOneQuery, useOutboundFeeUpdateMutation } from '@services/outboundFeeService'

const OutboundFeeUpdate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: outboundFeeData, isLoading: isFetchingData } = useOutboundFeeFindOneQuery(
    { id: id || '' },
    { skip: !id }
  )

  const [updateOutboundFee, { isLoading: isUpdating }] = useOutboundFeeUpdateMutation()

  const handleFinish = async (values: any) => {
    if (!id) return

    try {
      console.log('Updating outbound fee with values:', values)

      // Call the actual API
      const result = await updateOutboundFee({
        id,
        updateOutboundFeeDto: values
      }).unwrap()

      console.log('Updated outbound fee with ID:', result.id)
      message.success(t('messages.updateOutboundFeeSuccess') || 'Cập nhật phí outbound thành công')

      // Navigate back to management page after successful update
      navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
    } catch (error: any) {
      console.error('Error updating outbound fee:', error)

      // Handle different error scenarios
      const errorMessage = error?.data?.message ||
                          error?.message ||
                          t('messages.updateOutboundFeeFailed') ||
                          'Cập nhật phí outbound thất bại'

      message.error(errorMessage)
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
  }

  if (isFetchingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="outbound-fee-update">
      <Card
        title={t('labels.updateOutboundFee')}
        className="shadow-sm"
      >
        <OutboundFeeForm
          onFinish={handleFinish}
          onCancel={handleCancel}
          loading={isUpdating}
          isEdit={true}
          initialValues={outboundFeeData}
        />
      </Card>
    </div>
  )
}

export default OutboundFeeUpdate