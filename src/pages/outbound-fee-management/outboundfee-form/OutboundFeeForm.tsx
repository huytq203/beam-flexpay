import {
  Form,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  Button,
  Card,
  Row,
  Col,
  Typography
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useMemo } from 'react'
import moment from 'moment'
import { parseNumberFromCommaString, parseNumberFromPercentString, validateFutureDatetime } from '@utils/helperFunctions'
import { useOutboundFeeGetBanksListQuery, useOutboundFeeGetAccountGroupsListQuery, useOutboundFeeCustomerSearchQuery } from '@services/outboundFeeService'
import debounce from 'lodash/debounce'

const { Option } = Select
const { Title, Text } = Typography

interface OutboundFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

const OutboundFeeForm = ({
  initialValues,
  onFinish,
  onCancel,
  loading = false,
  isEdit = false
}: OutboundFeeFormProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [applicationType, setApplicationType] = useState('system')
  const [transactionType, setTransactionType] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()

  const chargeWithin = Form.useWatch('chargeWithin', form) ?? true
  const payerFlexibleFee = Form.useWatch('payerFlexibleFeePercent', form)
  const payerFixedFee = Form.useWatch('payerFixedFee', form)
  const receiverFlexibleFee = Form.useWatch('receiverFlexibleFeePercent', form)
  const receiverFixedFee = Form.useWatch('receiverFixedFee', form)

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
    skip: applicationType !== 'individual'
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
        applicationType: initialValues.applicationType ?? 'system',
        startDate: initialValues.startDate ? moment(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? moment(initialValues.endDate) : undefined,
        chargeWithin: initialValues.chargeWithin ?? true,
        priceFrom: initialValues.priceFrom ?? 0,
        priceTo: initialValues.priceTo ?? 0,
        method: initialValues.method ?? ['all'],
        bank: initialValues.bank ?? ['all'],
        provider: initialValues.provider ?? ['all'],
        // Convert mpct -> percent for display
        payerFlexibleFeePercent:
          typeof initialValues.payerFlexibleFeeMpct === 'number'
            ? initialValues.payerFlexibleFeeMpct / 1000
            : 0,
        receiverFlexibleFeePercent:
          typeof initialValues.receiverFlexibleFeeMpct === 'number'
            ? initialValues.receiverFlexibleFeeMpct / 1000
            : 0,
        // Set phoneNumber for display in edit mode (individual applicationType)
        phoneNumber: initialValues.customerId ? initialValues.customerId.toString() : undefined
      })
      setApplicationType(initialValues.applicationType ?? 'system')
      setTransactionType(initialValues.transactionType ?? '')

      // Set selected customer ID if available
      if (initialValues.customerId) {
        setSelectedCustomerId(initialValues.customerId)
      }
    }
  }, [initialValues, form])

  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value)
    // Reset customer search when changing applicable target
    setCustomerSearchQuery('')
    setSelectedCustomerId(undefined)
    form.setFieldsValue({
      accountGroup: undefined,
      accountNumber: undefined,
      phoneNumber: undefined
    })
  }

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value)
    form.setFieldsValue({
      method: ['all']
    })
  }

  const pctToMpct = (percent?: number) => {
    if (percent === undefined || percent === null) return undefined
    return Math.round(percent * 1000)
  }

  const handleSubmit = (values: any) => {
    const payload: any = {
      chargeWithin: values.chargeWithin ?? true,
      startDate: values.startDate?.toISOString(),

      // Optional fields (only include if they have values)
      ...(values.endDate && { endDate: values.endDate.toISOString() }),
      ...(values.priceFrom !== undefined && { priceFrom: values.priceFrom }),
      ...(values.priceTo !== undefined && { priceTo: values.priceTo }),

      // Payer fees (only include if they have values)
      ...(values.payerFlexibleFeePercent !== undefined && { payerFlexibleFeeMpct: pctToMpct(values.payerFlexibleFeePercent) }),
      ...(values.payerFixedFee !== undefined && { payerFixedFee: values.payerFixedFee }),
      ...(values.payerMinFee !== undefined && { payerMinFee: values.payerMinFee }),
      ...(values.payerMaxFee !== undefined && { payerMaxFee: values.payerMaxFee }),

      // Receiver fees (only include if they have values)
      ...(values.receiverFlexibleFeePercent !== undefined && { receiverFlexibleFeeMpct: pctToMpct(values.receiverFlexibleFeePercent) }),
      ...(values.receiverFixedFee !== undefined && { receiverFixedFee: values.receiverFixedFee }),
      ...(values.receiverMinFee !== undefined && { receiverMinFee: values.receiverMinFee }),
      ...(values.receiverMaxFee !== undefined && { receiverMaxFee: values.receiverMaxFee })
    }

    // Only include disabled fields when NOT in edit mode (i.e., when creating)
    if (!isEdit) {
      payload.applicationType = values.applicationType
      payload.transactionType = values.transactionType
      payload.method = Array.isArray(values.method) ? values.method[0] : values.method
      payload.provider = Array.isArray(values.provider) ? values.provider[0] : values.provider

      // Optional fields based on applicationType (only for create)
      if (values.applicationType === 'individual' && selectedCustomerId) {
        payload.customerId = selectedCustomerId
      }
      if (values.applicationType === 'account_group' && values.accountGroup) {
        payload.accountGroupId = parseInt(values.accountGroup)
      }

      // Bank field (only for create)
      if (values.bank && Array.isArray(values.bank) && values.bank.length > 0 && values.bank[0] !== 'all') {
        payload.bankId = parseInt(values.bank[0])
      }
    }

    console.log('Form payload to be sent to API:', payload)
    onFinish(payload)
  }

  const mockProviders = [
    { value: 'vietqr', label: 'VietQR' },
    { value: 'napas', label: 'NAPAS' }
  ]

  const getPaymentMethods = (type: string) => {
    switch (type) {
      case 'deposit':
        return [
          { value: 'atm_card', label: 'Thẻ ATM' },
          { value: 'qr_code', label: 'QRCODE' },
          { value: 'bank_account', label: 'Tài khoản Ngân hàng (IB)' }
        ]
      case 'withdrawal':
        return [
          { value: 'atm_card', label: 'Thẻ ATM (IBFT về thẻ ATM)' },
          { value: 'bank_account', label: 'Tài khoản Ngân hàng (IBFT về tài khoản ngân hàng)' }
        ]
      case 'payment':
      case 'refund':
        return [
          { value: 'ewallet', label: 'EWALLET: Ví điện tử' },
          { value: 'atm_card', label: 'Thẻ ATM' },
          { value: 'bank_account', label: 'Tài khoản ngân hàng' },
          { value: 'visa_international', label: 'Thẻ quốc tế VISA' },
          { value: 'master_international', label: 'Thẻ quốc tế MASTER' },
          { value: 'jcb_international', label: 'Thẻ quốc tế JCB' },
          { value: 'amex_international', label: 'Thẻ quốc tế AMEX' },
          { value: 'qr_code', label: 'QRCODE' }
        ]
      case 'transfer':
        return [{ value: 'ewallet', label: 'EWALLET: Ví điện tử' }]
      default:
        return []
    }
  }

  return (
    <div className="outbound-fee-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          applicationType: 'system',
          chargeWithin: true,
          priceFrom: 0,
          priceTo: 0,
          method: ['all'],
          bank: ['all'],
          provider: ['all'],
          payerFlexibleFeePercent: 0,
          receiverFlexibleFeePercent: 0,
          payerFixedFee: 0,
          receiverFixedFee: 0
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Đối tượng áp dụng */}
          <Col span={12}>
            <Form.Item
              name="applicationType"
              label={t('labels.applicableTarget')}
              rules={[{ required: true, message: t('messages.pleaseSelectApplicableTarget').toString() }]}
            >
              <Select
                placeholder={t('placeholders.applicableTarget')}
                onChange={handleApplicationTypeChange}
                size="large"
                disabled={isEdit}
              >
                <Option value="system">{t('labels.system')}</Option>
                <Option value="individual">{t('labels.individual')}</Option>
                <Option value="account_group">{t('labels.accountGroup')}</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Chọn nhóm tài khoản - Shows when applicationType = "account_group" */}
          {applicationType === 'account_group' && (
            <Col span={12}>
              <Form.Item
                name="accountGroup"
                label={t('labels.selectAccountGroup')}
                rules={[{ required: true, message: t('messages.pleaseSelectAccountGroup').toString() }]}
              >
                <Select
                  placeholder={t('placeholders.accountGroup')}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={accountGroupsData ? accountGroupsData.map((group) => ({
                    value: group.id.toString(),
                    label: group.name
                  })) : []}
                  size="large"
                  disabled={isEdit}
                />
              </Form.Item>
            </Col>
          )}

          {/* Nhập tài khoản - Shows when applicationType = "individual" */}
          {applicationType === 'individual' && (
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label={t('labels.phone')}
                rules={[{ required: true, message: t('messages.pleaseEnterAccount').toString() }]}
              >
                <Select
                  placeholder={t('placeholders.phone')?.toString()}
                  showSearch
                  defaultActiveFirstOption={false}
                  filterOption={false}
                  onSearch={debouncedSearch}
                  loading={isCustomersFetching}
                  options={
                    isEdit && initialValues?.customerId && initialValues?.phoneNumber
                      ? [
                          {
                            value: initialValues.customerId.toString(),
                            label: initialValues.fullName
                              ? `${initialValues.fullName} - ${initialValues.phoneNumber}`
                              : initialValues.phoneNumber,
                            customerId: initialValues.customerId
                          }
                        ]
                      : customersData?.data?.map((customer) => ({
                          value: customer.phoneNumber,
                          label: `${customer.fullName} - ${customer.phoneNumber}`,
                          customerId: customer.id
                        })) || []
                  }
                  notFoundContent={isCustomersFetching ? 'Loading...' : 'No data'}
                  size="large"
                  allowClear
                  disabled={isEdit}
                  onChange={(value, option: any) => {
                    // Store the customer ID when a customer is selected
                    if (option && option.customerId) {
                      setSelectedCustomerId(option.customerId)
                    } else {
                      setSelectedCustomerId(undefined)
                    }
                  }}
                />
              </Form.Item>
            </Col>
          )}

          {/* Loại giao dịch */}
          <Col span={12}>
            <Form.Item
              name="transactionType"
              label={t('labels.transactionType')}
              rules={[{ required: true, message: t('messages.pleaseSelectTransactionType').toString() }]}
            >
              <Select
                placeholder={t('placeholders.transactionType')}
                onChange={handleTransactionTypeChange}
                size="large"
                disabled={isEdit}
              >
                <Option value="deposit">{t('labels.deposit')}</Option>
                <Option value="withdrawal">{t('labels.withdrawal')}</Option>
                <Option value="payment">{t('labels.payment')}</Option>
                <Option value="transfer">{t('labels.transfer')}</Option>
                <Option value="refund">{t('labels.refund')}</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Phương thức giao dịch - Multi-select */}
          <Col span={12}>
            <Form.Item
              name="method"
              label={t('labels.paymentMethod')}
              rules={[{ required: true, message: t('messages.pleaseSelectPaymentMethod').toString() }]}
            >
              <Select
                mode="multiple"
                placeholder={t('placeholders.method')}
                options={[
                  { value: 'all', label: t('labels.all') },
                  ...getPaymentMethods(transactionType)
                ]}
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </Col>

          {/* Ngân hàng - Multi-select, Required */}
          <Col span={12}>
            <Form.Item
              name="bank"
              label={t('labels.bank')}
              rules={[{ required: true, message: t('messages.pleaseSelectBank').toString() }]}
            >
              <Select
                mode="multiple"
                placeholder={t('placeholders.bank')}
                options={banksData ? [
                  { value: 'all', label: t('labels.all') },
                  ...banksData.map((bank: { id: number; name: string; bankCode: string }) => ({
                    value: bank.id.toString(),
                    label: bank.name
                  }))
                ] : [
                  { value: 'all', label: t('labels.all') }
                ]}
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </Col>

          {/* Nhà cung cấp - Multi-select */}
          <Col span={12}>
            <Form.Item
              name="provider"
              label={t('labels.provider')}
              rules={[{ required: true, message: t('messages.pleaseSelectProvider').toString() }]}
            >
              <Select
                mode="multiple"
                placeholder={t('placeholders.provider')}
                options={[
                  { value: 'all', label: t('labels.all') },
                  ...mockProviders
                ]}
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </Col>

        </Row>

        {/* Thông tin gói phí */}
        <Card title={t('labels.feePackageInfo')} className="mt-4">
          <Row gutter={[16, 16]}>
            {/* Thu phí trong */}
            <Col span={24}>
              <Form.Item name="chargeWithin" valuePropName="checked">
                <Checkbox>
                  {t('labels.feeInside')}
                </Checkbox>
              </Form.Item>
              <Text type="secondary">
                {chargeWithin ? t('labels.feeInside') : t('labels.feeOutside')}
              </Text>
            </Col>

            {/* Mức giao dịch từ */}
            <Col span={12}>
              <Form.Item
                name="priceFrom"
                label={t('labels.transactionFrom')}
                rules={[
                  { required: true, message: t('messages.pleaseEnterTransactionFrom').toString() },
                  {
                    type: 'number',
                    min: 0,
                    max: 999999999999,
                    message: 'Giá trị phải từ 0 đến 999,999,999,999'
                  }
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.transactionFrom').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  max={999999999999}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Mức giao dịch đến */}
            <Col span={12}>
              <Form.Item
                name="priceTo"
                label={t('labels.transactionTo')}
                rules={[
                  { required: true, message: t('messages.pleaseEnterTransactionTo').toString() },
                  {
                    type: 'number',
                    min: 0,
                    max: 999999999999,
                    message: 'Giá trị phải từ 0 đến 999,999,999,999'
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('priceFrom') < value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error(t('messages.transactionToMustBeGreater').toString()))
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.transactionTo').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  max={999999999999}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Người chịu phí */}
            <Col span={24}>
              <Title level={5}>{t('labels.feeBearer')}</Title>
            </Col>

            {/* Phí người chuyển (Payer) */}
            <Col span={24}>
              <Text className='text-red-600' strong>Người chuyển:</Text>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payerFlexibleFeePercent"
                label={t('labels.flexibleFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const fixedFee = getFieldValue('payerFixedFee')
                      if ((value && value > 0) || (fixedFee && fixedFee > 0)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định'))
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.flexibleFee').toString()}
                  min={0}
                  max={100}
                  step={0.001}
                  precision={3}
                  formatter={(value) => `${value}%`}
                  parser={parseNumberFromPercentString}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payerFixedFee"
                label={t('labels.fixedFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const flexibleFee = getFieldValue('payerFlexibleFeePercent')
                      if ((value && value > 0) || (flexibleFee && flexibleFee > 0)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định'))
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.fixedFee').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payerMinFee"
                label={t('labels.minFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const flexibleFee = getFieldValue('payerFlexibleFeePercent')
                      if (flexibleFee && flexibleFee > 0 && (!value || value <= 0)) {
                        return Promise.reject(new Error('Phí tối thiểu là bắt buộc khi có phí linh hoạt'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.minFee').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="payerMaxFee"
                label={t('labels.maxFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const fixedFee = getFieldValue('payerFixedFee') || 0
                      const minFee = getFieldValue('payerMinFee') || 0
                      if (value && (value <= fixedFee || value <= minFee)) {
                        return Promise.reject(new Error('Phí tối đa phải lớn hơn phí cố định và phí tối thiểu'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.maxFee').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Phí người nhận (Receiver) */}
            <Col span={24}>
              <Text className='text-red-600' strong>Người nhận:</Text>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receiverFlexibleFeePercent"
                label={t('labels.flexibleFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const fixedFee = getFieldValue('receiverFixedFee')
                      if ((value && value > 0) || (fixedFee && fixedFee > 0)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định'))
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.flexibleFee').toString()}
                  min={0}
                  max={100}
                  step={0.001}
                  precision={3}
                  formatter={(value) => `${value}%`}
                  parser={parseNumberFromPercentString}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receiverFixedFee"
                label={t('labels.fixedFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const flexibleFee = getFieldValue('receiverFlexibleFeePercent')
                      if ((value && value > 0) || (flexibleFee && flexibleFee > 0)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định'))
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.fixedFee').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receiverMinFee"
                label={t('labels.minFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const flexibleFee = getFieldValue('receiverFlexibleFeePercent')
                      if (flexibleFee && flexibleFee > 0 && (!value || value <= 0)) {
                        return Promise.reject(new Error('Phí tối thiểu là bắt buộc khi có phí linh hoạt'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.minFee').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="receiverMaxFee"
                label={t('labels.maxFee')}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const fixedFee = getFieldValue('receiverFixedFee') || 0
                      const minFee = getFieldValue('receiverMinFee') || 0
                      if (value && (value <= fixedFee || value <= minFee)) {
                        return Promise.reject(new Error('Phí tối đa phải lớn hơn phí cố định và phí tối thiểu'))
                      }
                      return Promise.resolve()
                    }
                  })
                ]}
              >
                <InputNumber<number>
                  placeholder={t('placeholders.maxFee').toString()}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={parseNumberFromCommaString}
                  min={0}
                  className="w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thời gian áp dụng */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col span={12}>
            <Form.Item
              name="startDate"
              label={t('labels.applicableTime')}
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian áp dụng' },
                { validator: validateFutureDatetime }
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm:ss"
                placeholder={t('placeholders.applicableTime').toString()}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="endDate"
              label={t('labels.endTime')}
              dependencies={['startDate']}
              rules={[
                ({ getFieldsValue }) => ({
                  validator(_, value) {
                    if (!value) {
                      return Promise.resolve() // End date is optional
                    }

                    // Lấy tất cả giá trị real-time từ form (bao gồm cả dirty values)
                    const formValues = getFieldsValue(true)
                    const startDate = formValues.startDate

                    console.log('=== DEBUG REAL-TIME VALUES ===')
                    console.log('Form real-time values:', formValues)
                    console.log('Real-time startDate:', startDate)
                    console.log('Validator parameter endDate:', value)

                    if (startDate && value) {
                      // Sử dụng trực tiếp native Date object thay vì moment
                      const startNativeDate = startDate.$d || startDate._d || new Date(startDate)
                      const endNativeDate = value.$d || value._d || new Date(value)

                      console.log('Start datetime:', startNativeDate.toLocaleString('vi-VN'))
                      console.log('End datetime:', endNativeDate.toLocaleString('vi-VN'))

                      // So sánh timestamp (bao gồm cả ngày và thời gian)
                      const startTimestamp = startNativeDate.getTime()
                      const endTimestamp = endNativeDate.getTime()

                      console.log('Start timestamp:', startTimestamp)
                      console.log('End timestamp:', endTimestamp)
                      console.log('End <= Start?', endTimestamp <= startTimestamp)

                      if (endTimestamp <= startTimestamp) {
                        return Promise.reject(new Error('Ngày giờ kết thúc phải lớn hơn ngày giờ áp dụng'))
                      }
                    }
                    return Promise.resolve()
                  }
                })
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm:ss"
                placeholder={t('placeholders.endTime').toString()}
                className="w-full"
                size="large"
                onChange={(date) => {
                  // Force trigger validation sau khi thay đổi giá trị
                  setTimeout(() => {
                    form.validateFields(['endDate'])
                  }, 100)
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Action buttons */}
        <Row justify="end" className="mt-6" gutter={[8, 0]}>
          <Col>
            <Button onClick={onCancel} size="large">
              {t('buttons.back')}
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              {isEdit ? t('buttons.update') : t('buttons.setupFee')}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default OutboundFeeForm