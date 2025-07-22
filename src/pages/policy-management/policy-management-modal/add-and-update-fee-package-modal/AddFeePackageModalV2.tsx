import { FeeOptions } from '@constants/options'
import { POLICY_MANAGEMENT_TYPE, viewMode } from '@type/policyManagement'
import { Form, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { t } from 'i18next'
import { useState } from 'react'
import { FeePackageActionButtons } from './AddFeePackageModalV2/FeePackageActionButtons'
import { ReceiverFeeFields } from './AddFeePackageModalV2/ReceiverFeeFields'
import { TransactionRangeFields } from './AddFeePackageModalV2/TransactionRangeFields'
import { TransferorFeeFields } from './AddFeePackageModalV2/TransferorFeeFields'

type AddFeePackageModalType = {
  onCancel: () => void
  toggleFee?: (value: any[], type: viewMode) => void
  module?: POLICY_MANAGEMENT_TYPE
  mode?: viewMode
  fee?: any
}
interface UseAddFeePackageFormProps {
	onCancel: () => void
	toggleFee?: (value: any[], type: viewMode) => void
	module?: POLICY_MANAGEMENT_TYPE
}

function useAddFeePackageForm({ onCancel, toggleFee }: UseAddFeePackageFormProps) {
	const [form] = useForm()
	const [isLoading, setIsLoading] = useState(false)
	const [type, setType] = useState<'FLEXIBLE' | 'FIXED'>('FLEXIBLE')

	const onSubmit = (values: any) => {
		setIsLoading(true)
		if (values && toggleFee) {
			if (!values.transactionTo) {
				values.transactionTo = 10000 * 1000000000
			}
			if (!values.transactionFrom) {
				values.transactionFrom = 0
			}
			toggleFee(values, viewMode.create)
			form.resetFields()
			setIsLoading(false)
			onCancel()
		}
	}

	return {
		form,
		isLoading,
		type,
		setType,
		onSubmit,
	}
}

export const AddFeePackageModal = ({
  onCancel,
  toggleFee,
  module
}: AddFeePackageModalType) => {

  const { form, isLoading, type, setType, onSubmit } = useAddFeePackageForm({ onCancel, toggleFee, module })
  
  return (
    <Form
      onFinish={onSubmit}
      layout='vertical'
      form={form}
      initialValues={{
        type: 'FLEXIBLE',
        transferorFlexibleFee: 0,
        transferorFixedFee: 0,
        transferorFeeMin: undefined,
        transferorFeeMax: undefined,
        receiverFlexibleFee: 0,
        receiverFixedFee: 0,
        receiverFeeMin: undefined,
        receiverFeeMax: undefined
      }}
    >
      <TransactionRangeFields form={form} />
      <Form.Item
        name='type'
        label={t`policy-management.depositManagement.modalContent.tabelModal.type`}
      >
        <Select
          options={FeeOptions}
          onChange={setType}
        />
      </Form.Item>
      <TransferorFeeFields type={type} form={form} />
      <ReceiverFeeFields type={type} form={form} module={module} />
      <FeePackageActionButtons
        onCancel={onCancel}
        isLoading={isLoading}
      />
    </Form>
  )
}
