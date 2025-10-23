import { Form, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import debounce from 'lodash/debounce'
import isNil from 'lodash/isNil'
import {
  convertMiniPercentToPercentNumber,
  convertPercentToMiniPercent,
  isNullOrZero
} from '@utils/helperFunctions'
import {
  useInboundFeeCustomerSearchQuery,
  useInboundFeeGetAccountGroupsListQuery,
  useInboundFeeGetBanksListQuery
} from '@services/inboundFeeService'
import {
  sanitizeInboundFeeFormData,
  validateInboundFeeForm,
  zodErrorsToAntdErrors
} from './InboundFeeForm.schema'
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
      form.setFieldsValue({
        ...initialValues,
        applicationType: initialValues.applicationType ?? InboundFeeApplicationType.SYSTEM,
        startDate: initialValues.startDate ? moment(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? moment(initialValues.endDate) : undefined,
        priceFrom: initialValues.priceFrom ?? 0,
        priceTo: initialValues.priceTo ?? 0,
        method: initialValues.method ?? [],
        bank: initialValues.bank ?? [],
        provider: initialValues.provider ?? [],
        flexibleFeeMpct: convertMiniPercentToPercentNumber(initialValues.flexibleFeeMpct) ?? 0,
        fixedFee: initialValues.fixedFee ?? 0,
        minFee: initialValues.minFee ?? undefined,
        maxFee: initialValues.maxFee ?? undefined,
        vatMpct: convertMiniPercentToPercentNumber(initialValues.vatMpct) ?? 0,
        phoneNumber: initialValues.customerId ? initialValues.customerId.toString() : undefined
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
    console.log('=== START VALIDATION ===')
    console.log('Raw form values:', values)
    console.log('minFee value:', values.minFee, 'type:', typeof values.minFee)
    console.log('maxFee value:', values.maxFee, 'type:', typeof values.maxFee)

    // Clear all previous validation errors before new validation
    const allFields = Object.keys(form.getFieldsValue())
    const clearedFields = allFields.map(name => ({ name, errors: [] }))
    form.setFields(clearedFields)

    const sanitizedValues = sanitizeInboundFeeFormData(values)
    console.log('Sanitized values:', sanitizedValues)

    const validationResult = validateInboundFeeForm(sanitizedValues)
    console.log('Validation result:', validationResult)

    if (!validationResult.success) {
      console.log('❌ VALIDATION FAILED')
      console.log('Validation errors:', validationResult.error.issues)
      const antdErrors = zodErrorsToAntdErrors(validationResult.error)
      form.setFields(antdErrors)
      const firstError = validationResult.error.issues[0]
      message.error(firstError.message)
      console.log('=== STOPPING - NOT CALLING API ===')
      return
    }

    console.log('✅ VALIDATION PASSED - Building payload')

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

    console.log('Form payload to be sent to API:', payload)
    console.log('=== CALLING API ===')
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