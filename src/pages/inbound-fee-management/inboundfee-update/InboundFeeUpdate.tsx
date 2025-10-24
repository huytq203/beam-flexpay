import { Card, message, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useInboundFeeFindOneQuery, useInboundFeeUpdateMutation } from '@services/inboundFeeService'
import { InboundFeeForm } from '../inboundfee-form'
import { PATHS } from '@constants/pathConstant'
import { useTranslation } from 'react-i18next'

const InboundFeeUpdate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: inboundFee, isLoading: isLoadingFee } = useInboundFeeFindOneQuery(
    { id: id! },
    { skip: !id }
  )

  const [updateInboundFee, { isLoading: isUpdating }] = useInboundFeeUpdateMutation()

  const handleFinish = async (values: any) => {
    if (!id) return

    try {
      await updateInboundFee({
        id,
        updateInboundFeeDto: values
      }).unwrap()

      message.success(t('messages.updateInboundFeeSuccess'))
      navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
    } catch (error: any) {
      if (error?.data?.message) {
        message.error(error.data.message)
      } else if (error?.message) {
        message.error(error.message)
      } else {
        message.error(t('messages.updateInboundFeeFailed'))
      }
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
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

  if (!inboundFee) {
    return (
      <Card>
        <div className="text-center py-8">
          <p>Không tìm thấy cấu hình phí</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title={t('labels.updateInboundFee')}>
      <InboundFeeForm
        initialValues={inboundFee}
        onFinish={handleFinish}
        onCancel={handleCancel}
        loading={isUpdating}
        isEdit={true}
      />
    </Card>
  )
}

export default InboundFeeUpdate