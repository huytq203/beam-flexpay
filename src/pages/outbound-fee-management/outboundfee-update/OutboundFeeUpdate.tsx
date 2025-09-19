import { Card, message, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { PATHS } from '@constants/pathConstant'
import { OutboundFeeForm } from '../outboundfee-form'
import { useOutboundFeeUpdateMutation, useOutboundFeeFindOneQuery } from '@services/outboundFeeService'

const OutboundFeeUpdate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [initialValues, setInitialValues] = useState<any>(null)

  // Mock loading state since we don't have actual API yet
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [updateOutboundFee, { isLoading: isUpdating }] = useOutboundFeeUpdateMutation()

  // Mock data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock API call - replace with actual API call later
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock initial data
        const mockData = {
          id,
          applicableTarget: 'account_group',
          accountGroup: 'group_1',
          transactionType: 'deposit',
          paymentMethod: ['all'],
          bank: ['all'],
          provider: ['all'],
          applicableTime: '2024-01-01 00:00:00',
          endTime: '2024-12-31 23:59:59',
          feeInside: true,
          transactionFrom: 10000,
          transactionTo: 1000000,
          flexibleFee: 1.5,
          fixedFee: 5000,
          minFee: 1000,
          maxFee: 50000
        }

        setInitialValues(mockData)

        // Uncomment when backend is ready:
        // const response = await fetchOutboundFeeById(id)
        // setInitialValues(response.data)

      } catch (error) {
        console.error('Error fetching outbound fee:', error)
        message.error(t('messages.fetchOutboundFeeFailed'))
        navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, navigate, t])

  const handleFinish = async (values: any) => {
    try {
      console.log('Updating outbound fee with values:', values)

      // Mock API call - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Uncomment when backend is ready:
      // await updateOutboundFee({
      //   id: id!,
      //   updateOutboundFeeDto: values
      // }).unwrap()

      message.success(t('messages.updateOutboundFeeSuccess'))
      navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
    } catch (error) {
      console.error('Error updating outbound fee:', error)
      message.error(t('messages.updateOutboundFeeFailed'))
    }
  }

  const handleCancel = () => {
    navigate(PATHS.FEE_V2.OUTBOUND_FEE.MANAGEMENT)
  }

  if (isLoadingData) {
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
          initialValues={initialValues}
          onFinish={handleFinish}
          onCancel={handleCancel}
          loading={isUpdating}
          isEdit={true}
        />
      </Card>
    </div>
  )
}

export default OutboundFeeUpdate