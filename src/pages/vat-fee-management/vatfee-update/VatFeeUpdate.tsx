import { Card, message, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useVatFeeFindOneQuery, useVatFeeUpdateMutation } from '@services/vatFeeService'
import { VatFeeForm } from '../vatfee-form'
import { PATHS } from '@constants/pathConstant'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const VatFeeUpdate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: vatFee, isLoading: isLoadingFee } = useVatFeeFindOneQuery(
    { id: id! },
    { skip: !id }
  )

  const [updateVatFee, { isLoading: isUpdating }] = useVatFeeUpdateMutation()

  const handleFinish = async (values: any) => {
    if (!id) return

    try {
      await updateVatFee({
        id,
        updateVatFeeDto: values
      }).unwrap()

      message.success(t('messages.updateVatFeeSuccess'))
      navigate(PATHS.FEE_V2?.VAT_FEE?.MANAGEMENT || '/fee-v2/vat-fee-management')
    } catch (error: any) {
      if (error?.data?.message) {
        message.error(error.data.message)
      } else if (error?.message) {
        message.error(error.message)
      } else {
        message.error(t('messages.updateVatFeeFailed'))
      }
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2?.VAT_FEE?.MANAGEMENT || '/fee-v2/vat-fee-management')
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

  if (!vatFee) {
    return (
      <Card>
        <div className="text-center py-8">
          <p>Không tìm thấy cấu hình phí VAT</p>
        </div>
      </Card>
    )
  }

  // Convert API data to form format - explicit field mapping
  const initialValues = {
    applicationType: vatFee.applicationType,

    // Map accountGroupId (number) to accountGroup (string) for form
    accountGroup: vatFee.accountGroupId?.toString(),

    // Map phoneNumber directly (API provides this field)
    phoneNumber: vatFee.phoneNumber,

    // Convert flexibleFeeMpct (mini-percent) to vatTaxPercent (percent)
    // API stores as mpct (10000 = 10%), form expects percent (10)
    vatTaxPercent: vatFee.flexibleFeeMpct !== undefined
      ? vatFee.flexibleFeeMpct / 1000
      : 0,

    // Convert ISO date strings to moment objects
    startDate: vatFee.startDate ? moment(vatFee.startDate) : undefined,
    endDate: vatFee.endDate ? moment(vatFee.endDate) : undefined
  }

  return (
    <Card title={t('labels.updateVatFee')}>
      <VatFeeForm
        initialValues={initialValues}
        onFinish={handleFinish}
        onCancel={handleCancel}
        loading={isUpdating}
        isEdit={true}
      />
    </Card>
  )
}

export default VatFeeUpdate
