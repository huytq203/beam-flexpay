import { Form, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import debounce from 'lodash/debounce'
import isNil from 'lodash/isNil'
import { convertMiniPercentToPercentNumber, convertPercentToMiniPercent, isNullOrZero } from '@utils/helperFunctions'
import {
  useInboundFeeCustomerSearchQuery,
  useInboundFeeGetAccountGroupsListQuery,
  useInboundFeeGetBanksListQuery
} from '@services/inboundFeeService'
import { sanitizeInboundFeeFormData, validateInboundFeeForm, zodErrorsToAntdErrors } from './InboundFeeForm.schema'
import { InboundFeeApplicationType } from '@type/inbound-fee'

interface InboundFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

export const useInboundFeeForm = ({
                                    initialValues,
                                    onFinish,
                                    isEdit = false
                                  }: InboundFeeFormProps) => {
  const [form] = Form.useForm()
  const [applicationType, setApplicationType] = useState<string>(InboundFeeApplicationType.SYSTEM)
  const [transactionType, setTransactionType] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()

  // Watch form fields
  const flexibleFee = Form.useWatch('flexibleFeeMpct', form)
  const fixedFee = Form.useWatch('fixedFee', form)

  // Check if both flexible fee and fixed fee are 0 or null/undefined
  const shouldDisableMinMaxFee = isNullOrZero(flexibleFee) && isNullOrZero(fixedFee)

  // Fetch data from APIs
  const { data: banksData } = useInboundFeeGetBanksListQuery()
  const { data: accountGroupsData } = useInboundFeeGetAccountGroupsListQuery()

  // Customer search with skip condition
  const { data: customersData, isFetching: isCustomersFetching } = useInboundFeeCustomerSearchQuery({
    query: customerSearchQuery,
    page: 1,
    take: 10,
    order: 'DESC',
    orderBy: 'createdAt'
  }, {
    skip: applicationType !== InboundFeeApplicationType.INDIVIDUAL
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
        applicationType: initialValues.applicationType ?? InboundFeeApplicationType.SYSTEM,
        transactionType: initialValues.transactionType,
        startDate: startDateDayjs,
        endDate: endDateDayjs,
        priceFrom: initialValues.priceFrom ?? 0,
        priceTo: initialValues.priceTo ?? 0,
        // Map plural API fields to singular form fields
        method: initialValues.methods ?? [],
        provider: initialValues.providers ?? [],
        bank: bankIds.length > 0 ? bankIds : ['all'],
        // Handle fees - API can return null, 0, or number
        // null/undefined → undefined (empty field), 0 or number → keep value
        flexibleFeeMpct: initialValues.flexibleFeeMpct != null
          ? convertMiniPercentToPercentNumber(initialValues.flexibleFeeMpct)
          : undefined,
        fixedFee: initialValues.fixedFee ?? undefined,
        minFee: initialValues.minFee ?? undefined,
        maxFee: initialValues.maxFee ?? undefined,
        vatMpct: initialValues.vatMpct != null
          ? convertMiniPercentToPercentNumber(initialValues.vatMpct)
          : undefined,
        // Customer info
        phoneNumber: initialValues.customerId ? initialValues.customerId.toString() : undefined,
        accountGroup: initialValues.accountGroupId ? initialValues.accountGroupId.toString() : undefined
      })
      setApplicationType(initialValues.applicationType ?? InboundFeeApplicationType.SYSTEM)
      setTransactionType(initialValues.transactionType ?? '')

      if (initialValues.customerId) {
        setSelectedCustomerId(initialValues.customerId)
      }
    }
  }, [initialValues, form])

  useEffect(() => {
    if (shouldDisableMinMaxFee) {
      // Reset values to undefined when disabled
      form.setFieldsValue({
        minFee: undefined,
        maxFee: undefined
      })
      // Clear validation errors for these fields
      form.setFields([
        { name: 'minFee', errors: [] },
        { name: 'maxFee', errors: [] }
      ])
    }
  }, [shouldDisableMinMaxFee, form])

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

    const sanitizedValues = sanitizeInboundFeeFormData(values)
    const validationResult = validateInboundFeeForm(sanitizedValues)

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

      ...(values.endDate && { endDate: values.endDate.toISOString() }),

      ...(!isNil(values.flexibleFeeMpct) && {
        flexibleFeeMpct: convertPercentToMiniPercent(values.flexibleFeeMpct)
      }),
      ...(!isNil(values.fixedFee) && { fixedFee: values.fixedFee }),
      ...(!isNil(values.minFee) && { minFee: values.minFee }),
      ...(!isNil(values.maxFee) && { maxFee: values.maxFee }),

      ...(!isNil(values.vatMpct) && {
        vatMpct: convertPercentToMiniPercent(values.vatMpct)
      })
    }

    if (!isEdit) {
      payload.applicationType = values.applicationType
      payload.transactionType = values.transactionType
      payload.methods = values.method || ['all']
      payload.providers = values.provider || ['all']

      if (values.applicationType === InboundFeeApplicationType.INDIVIDUAL && selectedCustomerId) {
        payload.customerId = selectedCustomerId
      }
      if (values.applicationType === InboundFeeApplicationType.ACCOUNT_GROUP && values.accountGroup) {
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
    shouldDisableMinMaxFee,
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
