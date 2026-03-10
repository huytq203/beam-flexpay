import { Card, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'
import { VatFeeForm } from '../vatfee-form'
import { useVatFeeCreateMutation } from '@services/vatFeeService'

const VatFeeCreate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [createVatFee, { isLoading }] = useVatFeeCreateMutation()

  const handleFinish = async (values: any) => {
    try {
      console.log('Creating VAT fee with values:', values)

      // Call the actual API
      const result = await createVatFee({
        createVatFeeDto: values
      }).unwrap()

      console.log('Created VAT fee with ID:', result.id)
      message.success('Tạo cấu hình phí VAT thành công')

      // Navigate back to management page after successful creation
      navigate(PATHS.FEE_V2.VAT_FEE.MANAGEMENT)
    } catch (error: any) {
      console.error('Error creating VAT fee:', error)

      // Handle different error scenarios
      const errorMessage = error?.data?.message ||
                          error?.message ||
                          'Tạo cấu hình phí VAT thất bại'

      message.error(errorMessage)
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2.VAT_FEE.MANAGEMENT)
  }

  return (
    <div className="vat-fee-create">
      <Card
        title="Tạo cấu hình phí VAT"
        className="shadow-sm"
      >
        <VatFeeForm
          onFinish={handleFinish}
          onCancel={handleCancel}
          loading={isLoading}
          isEdit={false}
        />
      </Card>
    </div>
  )
}

export default VatFeeCreate
