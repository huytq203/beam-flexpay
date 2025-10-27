import { Form, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import debounce from 'lodash/debounce'
import isNil from 'lodash/isNil'
import { convertMiniPercentToPercentNumber, convertPercentToMiniPercent, isNullOrZero } from '@utils/helperFunctions'
import {
  useOutboundFeeCustomerSearchQuery,
  useOutboundFeeGetAccountGroupsListQuery,
  useOutboundFeeGetBanksListQuery
} from '@services/outboundFeeService'
import { sanitizeOutboundFeeFormData, validateOutboundFeeForm, zodErrorsToAntdErrors } from './OutboundFeeForm.schema'
import { OutboundFeeApplicationType } from '@type/outbound-fee'

interface OutboundFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

export const useOutboundFeeForm = ({
                                     initialValues,
                                     onFinish,
                                     isEdit = false
                                   }: OutboundFeeFormProps) => {
  const [form] = Form.useForm()
  const [applicationType, setApplicationType] = useState<string>(OutboundFeeApplicationType.SYSTEM)
  const [transactionType, setTransactionType] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()

  // Watch form fields - Payer fees
  const payerFlexibleFee = Form.useWatch('payerFlexibleFeeMpct', form)
  const payerFixedFee = Form.useWatch('payerFixedFee', form)

  // Watch form fields - Receiver fees
  const receiverFlexibleFee = Form.useWatch('receiverFlexibleFeeMpct', form)
  const receiverFixedFee = Form.useWatch('receiverFixedFee', form)

  // Check if both payer flexible and fixed fee are 0 or null/undefined
  const shouldDisablePayerMinMaxFee = isNullOrZero(payerFlexibleFee) && isNullOrZero(payerFixedFee)

  // Check if both receiver flexible and fixed fee are 0 or null/undefined
  const shouldDisableReceiverMinMaxFee = isNullOrZero(receiverFlexibleFee) && isNullOrZero(receiverFixedFee)

  // Fetch data from APIs
  const { data: banksData } = useOutboundFeeGetBanksListQuery()
  const { data: accountGroupsData } = useOutboundFeeGetAccountGroupsListQuery()

  // Customer search with skip condition
  const { data: customersData, isFetching: isCustomersFetching } = useOutboundFeeCustomerSearchQuery({
    query: customerSearchQuery,
    page: 1,
    take: 10,
    order: 'DESC',
    orderBy: 'createdAt'
  }, {
    skip: applicationType !== OutboundFeeApplicationType.INDIVIDUAL
  })

  // Debounced search function for customers
  const debouncedSearch = useMemo(() => {
    const loadOptions = (value: string) => {
      setCustomerSearchQuery(value)
    }
    return debounce(loadOptions, 300)
  }, [])

  useEffect(() => {
    if (initialValues) {
      // Parse UTC time and convert to local timezone (Vietnam +7)
      // API sends: "2025-10-24T17:00:00.000Z" (UTC+0)
      // Display: "25/10/2025 00:00:00" (VN +7, automatically converted)
      const startDateDayjs = initialValues.startDate ? dayjs(initialValues.startDate) : undefined
      const endDateDayjs = initialValues.endDate ? dayjs(initialValues.endDate) : undefined

      // Map API response fields to form field names
      // API: methods/providers/banks (plural), Form: method/provider/bank (singular)
      const bankIds = initialValues.banks?.map((b: { id: number; name: string }) => b.id.toString()) || []

      form.setFieldsValue({
        applicationType: initialValues.applicationType ?? OutboundFeeApplicationType.SYSTEM,
        transactionType: initialValues.transactionType,
        startDate: startDateDayjs,
        endDate: endDateDayjs,
        priceFrom: initialValues.priceFrom ?? 0,
        priceTo: initialValues.priceTo ?? 0,
        // Map plural API fields to singular form fields
        method: initialValues.methods ?? [],
        provider: initialValues.providers ?? [],
        bank: bankIds.length > 0 ? bankIds : ['all'],
        // chargeWithin field - API returns 1/0 as number, convert to boolean
        chargeWithin: initialValues.chargeWithin === 1 || initialValues.chargeWithin === true,
        // Handle payer fees - API can return null, 0, or number
        // null/undefined → undefined (empty field), 0 or number → keep value
        payerFlexibleFeeMpct: initialValues.payerFlexibleFeeMpct != null
          ? convertMiniPercentToPercentNumber(initialValues.payerFlexibleFeeMpct)
          : undefined,
        payerFixedFee: initialValues.payerFixedFee ?? undefined,
        payerMinFee: initialValues.payerMinFee ?? undefined,
        payerMaxFee: initialValues.payerMaxFee ?? undefined,
        // Handle receiver fees - API can return null, 0, or number
        receiverFlexibleFeeMpct: initialValues.receiverFlexibleFeeMpct != null
          ? convertMiniPercentToPercentNumber(initialValues.receiverFlexibleFeeMpct)
          : undefined,
        receiverFixedFee: initialValues.receiverFixedFee ?? undefined,
        receiverMinFee: initialValues.receiverMinFee ?? undefined,
        receiverMaxFee: initialValues.receiverMaxFee ?? undefined,
        // Customer info
        phoneNumber: initialValues.customerId ? initialValues.customerId.toString() : undefined,
        accountGroup: initialValues.accountGroupId ? initialValues.accountGroupId.toString() : undefined
      })
      setApplicationType(initialValues.applicationType ?? OutboundFeeApplicationType.SYSTEM)
      setTransactionType(initialValues.transactionType ?? '')

      if (initialValues.customerId) {
        setSelectedCustomerId(initialValues.customerId)
      }
    }
  }, [initialValues, form])

  // Effect to handle disabling payer min/max fees
  useEffect(() => {
    if (shouldDisablePayerMinMaxFee) {
      // Reset payer min/max values to undefined when disabled
      form.setFieldsValue({
        payerMinFee: undefined,
        payerMaxFee: undefined
      })
      // Clear validation errors for these fields
      form.setFields([
        { name: 'payerMinFee', errors: [] },
        { name: 'payerMaxFee', errors: [] }
      ])
    }
  }, [shouldDisablePayerMinMaxFee, form])

  // Effect to handle disabling receiver min/max fees
  useEffect(() => {
    if (shouldDisableReceiverMinMaxFee) {
      // Reset receiver min/max values to undefined when disabled
      form.setFieldsValue({
        receiverMinFee: undefined,
        receiverMaxFee: undefined
      })
      // Clear validation errors for these fields
      form.setFields([
        { name: 'receiverMinFee', errors: [] },
        { name: 'receiverMaxFee', errors: [] }
      ])
    }
  }, [shouldDisableReceiverMinMaxFee, form])

  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value)
    setCustomerSearchQuery('')
    setSelectedCustomerId(undefined)
    form.setFieldsValue({
      accountGroup: undefined,
      customerId: undefined,
      phoneNumber: undefined
    })
  }

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value)
    form.setFieldsValue({
      method: ['all']
    })
  }

  const handleCustomerChange = (value: any, option: any) => {
    if (option && option.customerId) {
      setSelectedCustomerId(option.customerId)
    } else {
      setSelectedCustomerId(undefined)
    }
  }

  const handleSubmit = (values: any) => {
    // Clear all previous validation errors before new validation
    const allFields = Object.keys(form.getFieldsValue())
    const clearedFields = allFields.map(name => ({ name, errors: [] }))
    form.setFields(clearedFields)

    const sanitizedValues = sanitizeOutboundFeeFormData(values)
    const validationResult = validateOutboundFeeForm(sanitizedValues)

    if (!validationResult.success) {
      const antdErrors = zodErrorsToAntdErrors(validationResult.error)
      form.setFields(antdErrors)
      const firstError = validationResult.error.issues[0]
      message.error(firstError.message)
      return
    }

    // Convert VN local time to UTC
    // Example: User selects "25/10/2025 00:00:00" (VN +7)
    // toISOString() converts to UTC: "2025-10-24T17:00:00.000Z" (UTC+0)
    // Backend stores UTC+0, displays back with +7 hours
    const payload: any = {
      startDate: values.startDate?.toISOString(),
      priceFrom: values.priceFrom,
      priceTo: values.priceTo,
      chargeWithin: values.chargeWithin, // Required for both create and update

      ...(values.endDate && { endDate: values.endDate.toISOString() }),

      // Payer fees
      ...(!isNil(values.payerFlexibleFeeMpct) && {
        payerFlexibleFeeMpct: convertPercentToMiniPercent(values.payerFlexibleFeeMpct)
      }),
      ...(!isNil(values.payerFixedFee) && { payerFixedFee: values.payerFixedFee }),
      ...(!isNil(values.payerMinFee) && { payerMinFee: values.payerMinFee }),
      ...(!isNil(values.payerMaxFee) && { payerMaxFee: values.payerMaxFee }),

      // Receiver fees
      ...(!isNil(values.receiverFlexibleFeeMpct) && {
        receiverFlexibleFeeMpct: convertPercentToMiniPercent(values.receiverFlexibleFeeMpct)
      }),
      ...(!isNil(values.receiverFixedFee) && { receiverFixedFee: values.receiverFixedFee }),
      ...(!isNil(values.receiverMinFee) && { receiverMinFee: values.receiverMinFee }),
      ...(!isNil(values.receiverMaxFee) && { receiverMaxFee: values.receiverMaxFee })
    }

    if (!isEdit) {
      payload.applicationType = values.applicationType
      payload.transactionType = values.transactionType
      payload.methods = values.method || ['all']
      payload.providers = values.provider || ['all']

      if (values.applicationType === OutboundFeeApplicationType.INDIVIDUAL && selectedCustomerId) {
        payload.customerId = selectedCustomerId
      }
      if (values.applicationType === OutboundFeeApplicationType.ACCOUNT_GROUP && values.accountGroup) {
        payload.accountGroupId = parseInt(values.accountGroup)
      }

      if (values.bank?.length > 0 && !values.bank.includes('all')) {
        payload.bankIds = values.bank.map((b: string) => parseInt(b))
      }
    }

    onFinish(payload)
  }

  return {
    form,
    applicationType,
    transactionType,
    shouldDisablePayerMinMaxFee,
    shouldDisableReceiverMinMaxFee,
    banksData,
    accountGroupsData,
    customersData,
    isCustomersFetching,
    selectedCustomerId,
    handleApplicationTypeChange,
    handleTransactionTypeChange,
    handleCustomerChange,
    handleSubmit,
    debouncedSearch,
    isEdit
  }
}
