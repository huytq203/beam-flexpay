import { Divider, Form } from 'antd'
import { useInboundFeeForm } from './InboundFeeForm.hooks'
import {
  BasicInfoSection,
  ConditionalFieldsSection,
  DateRangeSection,
  FeeInfoSection,
  FormActions,
  PaymentConfigSection
} from './components'
import { FORM_INITIAL_VALUES, getPaymentMethods, MOCK_PROVIDERS } from './InboundFeeForm.schema'

interface InboundFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

const InboundFeeForm = (props: InboundFeeFormProps) => {
  const { onCancel, loading = false } = props

  const {
    form,
    applicationType,
    transactionType,
    shouldDisableMinMaxFee,
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
  } = useInboundFeeForm(props)

  return (
    <div className="inbound-fee-form">
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

        <DateRangeSection isEdit={isEdit} />

        <Divider />
        <FeeInfoSection shouldDisableMinMaxFee={shouldDisableMinMaxFee} />

        <FormActions
          isEdit={isEdit}
          loading={loading}
          onCancel={onCancel}
        />
      </Form>
    </div>
  )
}

export default InboundFeeForm