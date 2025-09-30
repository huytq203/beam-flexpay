import { Card, message, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useInboundFeeUpdateMutation, useInboundFeeFindOneQuery } from '@services/inboundFeeService'
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
      console.log('Updating inbound fee with values:', values)

      // Transform the data to match API requirements
      const updateDto = {
        ...values,
        // Ensure arrays are properly formatted
        method: Array.isArray(values.method) ? values.method : [values.method],
        provider: Array.isArray(values.provider) ? values.provider : [values.provider],
        bank: values.bank && Array.isArray(values.bank) ? values.bank : values.bank ? [values.bank] : undefined
      }

      await updateInboundFee({
        id,
        updateInboundFeeDto: updateDto
      }).unwrap()

      message.success('Cập nhật cấu hình phí đầu vào thành công')
      navigate(PATHS.FEE_V2?.INBOUND_FEE?.LIST || '/fee-management/inbound-fee')
    } catch (error: any) {
      console.error('Error updating inbound fee:', error)
      message.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình phí')
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
    <Card title="Cập nhật phí đầu vào">
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