import { Card, message, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useOutboundFeeFindOneQuery, useOutboundFeeUpdateMutation } from '@services/outboundFeeService'
import { OutboundFeeForm } from '../outboundfee-form'
import { PATHS } from '@constants/pathConstant'
import { useTranslation } from 'react-i18next'

const OutboundFeeUpdate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: outboundFee, isLoading: isLoadingFee } = useOutboundFeeFindOneQuery(
    { id: id! },
    { skip: !id }
  )

  const [updateOutboundFee, { isLoading: isUpdating }] = useOutboundFeeUpdateMutation()

  const handleFinish = async (values: any) => {
    if (!id) return

    try {
      await updateOutboundFee({
        id,
        updateOutboundFeeDto: values
      }).unwrap()

      message.success(t('messages.updateOutboundFeeSuccess'))
      navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
    } catch (error: any) {
      if (error?.data?.message) {
        message.error(error.data.message)
      } else if (error?.message) {
        message.error(error.message)
      } else {
        message.error(t('messages.updateOutboundFeeFailed'))
      }
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
  }

  if (isLoadingFee) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!outboundFee) {
    return (
      <Card>
        <div className="text-center py-8">
          <p>Không tìm thấy cấu hình phí</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title={t('labels.updateOutboundFee')}>
      <OutboundFeeForm
        initialValues={outboundFee}
        onFinish={handleFinish}
        onCancel={handleCancel}
        loading={isUpdating}
        isEdit={true}
      />
    </Card>
  )
}

export default OutboundFeeUpdate
