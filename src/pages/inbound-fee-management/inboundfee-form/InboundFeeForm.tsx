import { Button, Col, DatePicker, Divider, Form, InputNumber, Row, Select, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { parseNumberFromCommaString, parseNumberFromPercentString, validateFutureDatetime, isNullOrZero, convertPercentToMiniPercent, convertMiniPercentToPercentNumber } from '@utils/helperFunctions'
import {
  useInboundFeeCustomerSearchQuery,
  useInboundFeeGetAccountGroupsListQuery,
  useInboundFeeGetBanksListQuery
} from '@services/inboundFeeService'
import debounce from 'lodash/debounce'
import isNil from 'lodash/isNil'

const { Option } = Select
const { Title, Text } = Typography

interface InboundFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

const InboundFeeForm = ({
                          initialValues,
                          onFinish,
                          onCancel,
                          loading = false,
                          isEdit = false
                        }: InboundFeeFormProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [applicationType, setApplicationType] = useState('system')
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
        priceFrom: initialValues.priceFrom ?? 0,
        priceTo: initialValues.priceTo ?? 0,
        method: initialValues.method ?? ['all'],
        bank: initialValues.bank ?? ['all'],
        provider: initialValues.provider ?? ['all'],
        // Convert flexibleFeeMpct from mini percent to percent for display
        flexibleFeeMpct: convertMiniPercentToPercentNumber(initialValues.flexibleFeeMpct) ?? 0,
        fixedFee: initialValues.fixedFee ?? 0,
        minFee: initialValues.minFee ?? undefined,
        maxFee: initialValues.maxFee ?? undefined,
        // Convert vat from mini percent to percent for display
        vat: convertMiniPercentToPercentNumber(initialValues.vat) ?? 0,
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
      customerId: undefined,
      phoneNumber: undefined
    })
  }

  // Clear minFee and maxFee when both flexible fee and fixed fee are 0
  useEffect(() => {
    if (shouldDisableMinMaxFee) {
      form.setFieldsValue({
        minFee: undefined,
        maxFee: undefined
      })
    }
  }, [shouldDisableMinMaxFee, form])

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value)
    form.setFieldsValue({
      method: ['all']
    })
  }

  const handleSubmit = (values: any) => {
    const payload: any = {
      startDate: values.startDate?.toISOString(),

      // Optional fields (only include if they have values)
      ...(values.endDate && { endDate: values.endDate.toISOString() }),
      ...(values.priceFrom !== undefined && { priceFrom: values.priceFrom }),
      ...(values.priceTo !== undefined && { priceTo: values.priceTo }),

      // Fee configuration (convert percent fields to mini percent)
      ...(values.flexibleFeeMpct !== undefined && { flexibleFeeMpct: convertPercentToMiniPercent(values.flexibleFeeMpct) }),
      ...(values.fixedFee !== undefined && { fixedFee: values.fixedFee }),
      ...(values.minFee !== undefined && { minFee: values.minFee }),
      ...(values.maxFee !== undefined && { maxFee: values.maxFee }),

      // VAT (convert percent to mini percent)
      ...(values.vat !== undefined && { vat: convertPercentToMiniPercent(values.vat) })
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
    { value: 'vpb', label: 'VPB' },
    { value: 'napas', label: 'Napas' },
    { value: 'vietqr', label: 'VietQR' }
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
          { value: 'ewallet', label: 'Ví điện tử' },
          { value: 'atm_card', label: 'Thẻ ATM (Ngân hàng liên kết và trực tiếp)' },
          { value: 'bank_account', label: 'Tài khoản ngân hàng (Ngân hàng liên kết và trực tiếp)' },
          { value: 'visa_international', label: 'Thẻ quốc tế VISA' },
          { value: 'master_international', label: 'Thẻ quốc tế MASTER' },
          { value: 'jcb_international', label: 'Thẻ quốc tế JCB' },
          { value: 'amex_international', label: 'Thẻ quốc tế AMEX' },
          { value: 'qr_code', label: 'QRCODE' }
        ]
      case 'transfer':
        return [{ value: 'ewallet', label: 'Ví điện tử' }]
      default:
        return []
    }
  }

  return (
    <div className="inbound-fee-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          applicationType: 'system',
          priceFrom: 0,
          priceTo: 0,
          method: ['all'],
          bank: ['all'],
          provider: ['all'],
          flexibleFeeMpct: 0,
          fixedFee: 0,
          vat: 0
        }}
      >
        <div className="flex flex-wrap gap-4">
          {/* Đối tượng áp dụng */}
          <div className="w-[calc(50%-8px)]">
            <Form.Item
              name="applicationType"
              label={t('labels.applicableTarget')}
              rules={[{ required: true, message: t('messages.pleaseSelectApplicableTarget').toString() }]}
              tooltip="Hệ thống: áp dụng cho toàn bộ | Đối tượng riêng: áp dụng cho ví cụ thể | Nhóm tài khoản: áp dụng cho nhóm ví"
            >
              <Select
                placeholder={t('placeholders.applicableTarget')}
                onChange={handleApplicationTypeChange}
                size="large"
                disabled={isEdit}
              >
                <Option value="system">Hệ thống</Option>
                <Option value="individual">Đối tượng riêng</Option>
                <Option value="account_group">Nhóm tài khoản</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Loại giao dịch */}
          <div className="w-[calc(50%-8px)]">
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
                <Option value="deposit">Nạp tiền</Option>
                <Option value="withdrawal">Rút tiền</Option>
                <Option value="payment">Thanh toán</Option>
                <Option value="transfer">Chuyển tiền</Option>
                <Option value="refund">Hoàn tiền</Option>
              </Select>
            </Form.Item>
          </div>

          {/* Chọn nhóm tài khoản (hiện khi chọn Nhóm tài khoản) */}
          {applicationType === 'account_group' && (
            <div className="w-[calc(50%-8px)]">
              <Form.Item
                name="accountGroup"
                label="Chọn nhóm tài khoản"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm tài khoản' }]}
                tooltip="Chọn nhóm tài khoản để áp dụng chính sách phí"
              >
                <Select
                  placeholder="Tìm và chọn nhóm tài khoản"
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
            </div>
          )}

          {/* Nhập tài khoản (hiện khi chọn Đối tượng riêng) */}
          {applicationType === 'individual' && (
            <div className="w-[calc(50%-8px)]">
              <Form.Item
                name="phoneNumber"
                label="Nhập tài khoản"
                rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
                tooltip="Chọn tài khoản ví điện tử để áp dụng chính sách phí"
              >
                <Select
                  placeholder="Tìm theo số điện thoại hoặc mã ví"
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
                          label: initialValues.fullname
                            ? `${initialValues.fullname} - ${initialValues.phoneNumber}`
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
            </div>
          )}

          {/* Phương thức giao dịch */}
          <div className="w-[calc(50%-8px)]">
            <Form.Item
              name="method"
              label="Phương thức giao dịch"
              rules={[{ required: true, message: 'Vui lòng chọn phương thức giao dịch' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn phương thức giao dịch"
                options={[
                  { value: 'all', label: 'Tất cả' },
                  ...getPaymentMethods(transactionType)
                ]}
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </div>

          {/* Ngân hàng */}
          <div className="w-[calc(50%-8px)]">
            <Form.Item
              name="bank"
              label="Ngân hàng"
              rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn ngân hàng"
                options={banksData ? [
                  { value: 'all', label: 'Tất cả' },
                  ...banksData.map((bank: { id: number; name: string; bankCode: string }) => ({
                    value: bank.id.toString(),
                    label: bank.name
                  }))
                ] : [
                  { value: 'all', label: 'Tất cả' }
                ]}
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </div>

          {/* Nhà cung cấp */}
          <div className="w-[calc(50%-8px)]">
            <Form.Item
              name="provider"
              label="Nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn nhà cung cấp"
                options={[
                  { value: 'all', label: 'Tất cả' },
                  ...mockProviders
                ]}
                size="large"
                disabled={isEdit}
              />
            </Form.Item>
          </div>
        </div>

        <Row gutter={[16, 16]}>
          {/* Thời gian áp dụng */}
          <Col span={12}>
            <Form.Item
              name="startDate"
              label="Thời gian áp dụng"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian áp dụng' },
                { validator: validateFutureDatetime }
              ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm:ss"
                placeholder="dd/mm/yyyy hh:mm:ss"
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Cột 2: Thời gian kết thúc */}
          <Col span={12}>
            <Form.Item
              name="endDate"
              label="Thời gian kết thúc"
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

                    if (startDate && value) {
                      // Sử dụng trực tiếp native Date object thay vì moment
                      const startNativeDate = startDate.$d || startDate._d || new Date(startDate)
                      const endNativeDate = value.$d || value._d || new Date(value)

                      // So sánh timestamp (bao gồm cả ngày và thời gian)
                      const startTimestamp = startNativeDate.getTime()
                      const endTimestamp = endNativeDate.getTime()

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
                placeholder="dd/mm/yyyy hh:mm:ss"
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

        {/* Thông tin gói phí */}
        <Divider />
        <Title level={4}>Thông tin gói phí</Title>

        <Row gutter={[16, 16]}>
          {/* Mức giao dịch từ */}
          <Col span={12}>
            <Form.Item
              name="priceFrom"
              label="Mức giao dịch từ (VND)"
              validateTrigger="onChange"
              rules={[
                { required: true, message: 'Vui lòng nhập mức giao dịch từ' },
                {
                  type: 'number',
                  min: 0,
                  max: 999999999999,
                  transform: (value) => Number(value),
                  message: 'Giá trị phải từ 0 đến 999,999,999,999'
                }
              ]}
            >
              <InputNumber<number>
                placeholder="0"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Mức giao dịch đến */}
          <Col span={12}>
            <Form.Item
              name="priceTo"
              label="Mức giao dịch đến (VND)"
              validateTrigger="onChange"
              rules={[
                { required: true, message: 'Vui lòng nhập mức giao dịch đến' },
                {
                  type: 'number',
                  min: 0,
                  max: 999999999999,
                  transform: (value) => Number(value),
                  message: 'Giá trị phải từ 0 đến 999,999,999,999'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('priceFrom') < value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Số tiền đến phải lớn hơn số tiền từ'))
                  }
                })
              ]}
            >
              <InputNumber<number>
                placeholder="999,999,999,999"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Phí linh hoạt */}
          <Col span={12}>
            <Form.Item
              name="flexibleFeeMpct"
              label="Phí linh hoạt (%)"
              validateTrigger="onChange"
              rules={[
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  transform: (value) => Number(value),
                  message: 'Phí linh hoạt phải từ 0% đến 100%'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const fixedFee = getFieldValue('fixedFee')
                    if ((value && value > 0) || (fixedFee && fixedFee > 0)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định'))
                  }
                })
              ]}
              tooltip="Phí tính theo phần trăm giá trị giao dịch"
            >
              <InputNumber<number>
                placeholder="0.000"
                step={0.001}
                precision={3}
                formatter={(value) => `${value}`}
                parser={(value) => value?.replace('%', '') as any}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Phí cố định */}
          <Col span={12}>
            <Form.Item
              name="fixedFee"
              label="Phí cố định (VND)"
              validateTrigger="onChange"
              rules={[
                {
                  type: 'number',
                  min: 0,
                  max: 999999999999,
                  transform: (value) => Number(value),
                  message: 'Phí cố định phải từ 0 đến 999,999,999,999 VND'
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const flexibleFee = getFieldValue('flexibleFeeMpct')
                    if ((value && value > 0) || (flexibleFee && flexibleFee > 0)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Phải nhập ít nhất một trong hai: Phí linh hoạt hoặc Phí cố định'))
                  }
                })
              ]}
              tooltip="Phí cố định cho mỗi giao dịch"
            >
              <InputNumber<number>
                placeholder="0"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Phí tối thiểu */}
          <Col span={12}>
            <Form.Item
              name="minFee"
              label="Phí tối thiểu (VND)"
              required={!isNullOrZero(flexibleFee)}
              validateTrigger="onChange"
              dependencies={['flexibleFeeMpct', 'maxFee']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const flexibleFee = getFieldValue('flexibleFeeMpct')
                    const maxFee = getFieldValue('maxFee')

                    // Chỉ bắt buộc nếu có phí linh hoạt
                    if (flexibleFee && flexibleFee > 0 && isNil(value)) {
                      return Promise.reject(new Error('Phí tối thiểu là bắt buộc khi có phí linh hoạt'))
                    }

                    // Chỉ validate range khi có giá trị
                    if (!isNil(value)) {
                      if (value < 0 || value > 999999999999) {
                        return Promise.reject(new Error('Phí tối thiểu phải từ 0 đến 999,999,999,999 VND'))
                      }

                      // Kiểm tra minFee phải nhỏ hơn maxFee
                      if (!isNil(maxFee) && value >= maxFee) {
                        return Promise.reject(new Error('Phí tối thiểu phải nhỏ hơn phí tối đa'))
                      }
                    }

                    return Promise.resolve()
                  }
                })
              ]}
              tooltip="Phí tối thiểu cho mỗi giao dịch (bắt buộc khi có phí linh hoạt)"
            >
              <InputNumber<number>
                placeholder="Nhập phí tối thiểu"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                className="w-full"
                size="large"
                disabled={shouldDisableMinMaxFee}
                onChange={() => {
                  // Trigger validation for maxFee when minFee changes
                  form.validateFields(['maxFee'])
                }}
              />
            </Form.Item>
          </Col>

          {/* Phí tối đa */}
          <Col span={12}>
            <Form.Item
              name="maxFee"
              label="Phí tối đa (VND)"
              validateTrigger="onChange"
              dependencies={['fixedFee', 'minFee']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    // Nếu không nhập thì không validate
                    if (isNil(value)) return Promise.resolve()

                    // Chỉ validate range khi có giá trị
                    if (value < 0 || value > 999999999999) {
                      return Promise.reject(new Error('Phí tối đa phải từ 0 đến 999,999,999,999 VND'))
                    }

                    const fixedFee = getFieldValue('fixedFee') || 0
                    const minFee = getFieldValue('minFee')

                    // Kiểm tra maxFee phải lớn hơn fixedFee
                    if (value <= fixedFee) {
                      return Promise.reject(new Error('Phí tối đa phải lớn hơn phí cố định'))
                    }

                    // Kiểm tra maxFee phải lớn hơn minFee (nếu minFee có giá trị)
                    if (!isNil(minFee) && value <= minFee) {
                      return Promise.reject(new Error('Phí tối đa phải lớn hơn phí tối thiểu'))
                    }

                    return Promise.resolve()
                  }
                })
              ]}
              tooltip="Phí tối đa cho mỗi giao dịch (tùy chọn)"
            >
              <InputNumber<number>
                placeholder="Nhập phí tối đa"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                className="w-full"
                size="large"
                disabled={shouldDisableMinMaxFee}
                onChange={() => {
                  // Trigger validation for minFee when maxFee changes
                  form.validateFields(['minFee'])
                }}
              />
            </Form.Item>
          </Col>

          {/* VAT */}
          <Col span={12}>
            <Form.Item
              name="vat"
              label="VAT (%)"
              required={isNullOrZero(fixedFee)}
              validateTrigger="onChange"
              dependencies={['fixedFee']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const fixedFee = getFieldValue('fixedFee')

                    // Chỉ bắt buộc khi phí cố định = 0 hoặc null/undefined
                    if (isNullOrZero(fixedFee) && isNil(value)) {
                      return Promise.reject(new Error('Vui lòng nhập VAT'))
                    }

                    // Validate giá trị nếu có nhập
                    if (!isNil(value) && (value < 0 || value > 100)) {
                      return Promise.reject(new Error('VAT phải từ 0% đến 100%'))
                    }

                    return Promise.resolve()
                  }
                })
              ]}
              tooltip="Thuế giá trị gia tăng tính theo phần trăm"
            >
              <InputNumber<number>
                placeholder="0.000"
                step={0.001}
                precision={3}
                formatter={(value) => `${value}`}
                parser={(value) => value?.replace('%', '') as any}
                className="w-full"
                size="large"
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

export default InboundFeeForm