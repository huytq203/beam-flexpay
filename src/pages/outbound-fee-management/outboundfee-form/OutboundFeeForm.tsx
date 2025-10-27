import { Divider, Form } from 'antd'
import { useOutboundFeeForm } from './OutboundFeeForm.hooks'
import {
  BasicInfoSection,
  ConditionalFieldsSection,
  FeeInfoSection,
  FormActions,
  PaymentConfigSection
} from './components'
import { FORM_INITIAL_VALUES, getPaymentMethods, MOCK_PROVIDERS } from './OutboundFeeForm.schema'

interface OutboundFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

const OutboundFeeForm = (props: OutboundFeeFormProps) => {
  const { onCancel, loading = false } = props

  const {
    form,
    applicationType,
    transactionType,
    shouldDisablePayerMinMaxFee,
    shouldDisableReceiverMinMaxFee,
    banksData,
    accountGroupsData,
    customersData,
    isCustomersFetching,
    handleApplicationTypeChange,
    handleTransactionTypeChange,
    handleCustomerChange,
    handleSubmit,
    debouncedSearch,
    isEdit
  } = useOutboundFeeForm(props)

  return (
    <div className="outbound-fee-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={FORM_INITIAL_VALUES}
      >
        <BasicInfoSection
          isEdit={isEdit}
          onApplicationTypeChange={handleApplicationTypeChange}
          onTransactionTypeChange={handleTransactionTypeChange}
        />

        <ConditionalFieldsSection
          applicationType={applicationType}
          isEdit={isEdit}
          accountGroupsData={accountGroupsData}
          customersData={customersData}
          isCustomersFetching={isCustomersFetching}
          initialValues={props.initialValues}
          onCustomerChange={handleCustomerChange}
          onCustomerSearch={debouncedSearch}
        />

        <PaymentConfigSection
          isEdit={isEdit}
          transactionType={transactionType}
          paymentMethods={getPaymentMethods(transactionType)}
          banksData={banksData}
          providers={MOCK_PROVIDERS}
        />

        <Divider />
        <FeeInfoSection
          shouldDisablePayerMinMaxFee={shouldDisablePayerMinMaxFee}
          shouldDisableReceiverMinMaxFee={shouldDisableReceiverMinMaxFee}
          isEdit={isEdit}
        />

        <FormActions
          isEdit={isEdit}
          loading={loading}
          onCancel={onCancel}
        />
      </Form>
    </div>
  )
}

export default OutboundFeeForm
