import {
  Form,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useMemo } from 'react'
import moment from 'moment'
import { VatFeeApplicationType } from '@type/vat-fee'
import { parseNumberFromPercentString, validateFutureDatetime } from '@utils/helperFunctions'
import { useVatFeeGetAccountGroupsQuery, useVatFeeGetAccountsQuery } from '@services/vatFeeService'
import debounce from 'lodash/debounce'

const { Option } = Select
const { Title, Text } = Typography

interface VatFeeFormProps {
  initialValues?: any
  onFinish: (values: any) => void
  onCancel: () => void
  loading?: boolean
  isEdit?: boolean
}

const VatFeeForm = ({
  initialValues,
  onFinish,
  onCancel,
  loading = false,
  isEdit = false
}: VatFeeFormProps) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [applicationType, setApplicationType] = useState<VatFeeApplicationType>(VatFeeApplicationType.SYSTEM)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()

  // Fetch data from APIs
  const { data: accountGroupsData } = useVatFeeGetAccountGroupsQuery()
  const { data: customersData, isFetching: isCustomersFetching } = useVatFeeGetAccountsQuery(
    { search: customerSearchQuery },
    { skip: applicationType !== VatFeeApplicationType.INDIVIDUAL }
  )

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
        applicationType: initialValues.applicationType ?? VatFeeApplicationType.SYSTEM,
        startDate: initialValues.startDate ? moment(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? moment(initialValues.endDate) : undefined,
        vatTaxPercent: initialValues.vatTaxPercent ?? 0
      })
      setApplicationType(initialValues.applicationType ?? VatFeeApplicationType.SYSTEM)
    }
  }, [initialValues, form])

  const handleApplicationTypeChange = (value: VatFeeApplicationType) => {
    setApplicationType(value)
    // Reset customer search when changing applicable target
    setCustomerSearchQuery('')
    setSelectedCustomerId(undefined)
    form.setFieldsValue({
      accountGroup: undefined,
      phoneNumber: undefined
    })
  }

  const pctToMpct = (percent?: number) => {
    if (percent === undefined || percent === null) return undefined
    return Math.round(percent * 1000)
  }

  const handleSubmit = (values: any) => {
    const payload: any = {
      applicationType: values.applicationType,
      ...(values.vatTaxPercent !== undefined && { flexibleFeeMpct: pctToMpct(values.vatTaxPercent) }),
      startDate: values.startDate?.toISOString(),
      ...(values.endDate && { endDate: values.endDate.toISOString() })
    }

    // Add customerId if individual
    if (values.applicationType === VatFeeApplicationType.INDIVIDUAL && selectedCustomerId) {
      payload.customerId = selectedCustomerId
    }

    // Add accountGroupId if account_group
    if (values.applicationType === VatFeeApplicationType.ACCOUNT_GROUP && values.accountGroup) {
      payload.accountGroupId = parseInt(values.accountGroup)
    }

    console.log('VAT Fee form payload to be sent to API:', payload)
    onFinish(payload)
  }


  return (
    <div className="vat-fee-form">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          applicationType: VatFeeApplicationType.SYSTEM,
          vatTaxPercent: 0
        }}
      >
        {/* Hàng 1: Filters row (2 cột) */}
        <Row gutter={[16, 16]}>
          {/* Cột trái: Đối tượng áp dụng */}
          <Col span={12}>
            <Form.Item
              name="applicationType"
              label="Đối tượng áp dụng*"
              rules={[{ required: true, message: 'Vui lòng chọn đối tượng áp dụng' }]}
            >
              <Select
                placeholder="Chọn đối tượng áp dụng"
                onChange={handleApplicationTypeChange}
                size="large"
              >
                <Option value={VatFeeApplicationType.SYSTEM}>Hệ thống</Option>
                <Option value={VatFeeApplicationType.INDIVIDUAL}>Đối tượng riêng</Option>
                <Option value={VatFeeApplicationType.ACCOUNT_GROUP}>Nhóm tài khoản</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Cột phải: Tài khoản (conditional) */}
          <Col span={12}>
            {applicationType === VatFeeApplicationType.ACCOUNT_GROUP && (
              <Form.Item
                name="accountGroup"
                label="Tài khoản*"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm tài khoản' }]}
              >
                <Select
                  placeholder="Chọn nhóm tài khoản"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={accountGroupsData ? accountGroupsData.map((group) => ({
                    value: group.id.toString(),
                    label: group.name
                  })) : []}
                  size="large"
                />
              </Form.Item>
            )}

            {applicationType === VatFeeApplicationType.INDIVIDUAL && (
              <Form.Item
                name="phoneNumber"
                label="Tài khoản*"
                rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
              >
                <Select
                  placeholder="Tìm theo số điện thoại"
                  showSearch
                  defaultActiveFirstOption={false}
                  filterOption={false}
                  onSearch={debouncedSearch}
                  loading={isCustomersFetching}
                  options={customersData?.map((customer) => ({
                    value: customer.phoneNumber,
                    label: `${customer.fullName} - ${customer.phoneNumber}`,
                    customerId: customer.id
                  })) || []}
                  notFoundContent={isCustomersFetching ? 'Loading...' : 'No data'}
                  size="large"
                  allowClear
                  onChange={(_value, option: any) => {
                    // Store the customer ID when a customer is selected
                    if (option && option.customerId) {
                      setSelectedCustomerId(option.customerId)
                    } else {
                      setSelectedCustomerId(undefined)
                    }
                  }}
                />
              </Form.Item>
            )}

            {applicationType === VatFeeApplicationType.SYSTEM && (
              <Form.Item label="Tài khoản*">
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Áp dụng cho toàn hệ thống
                </Text>
              </Form.Item>
            )}
          </Col>
        </Row>

        {/* Hàng 2: Section header */}
        <Row className="mt-6 mb-4">
          <Col span={24}>
            <Title level={4} className="mb-0">
              Thông tin gói phí
            </Title>
          </Col>
        </Row>

        {/* Hàng 3: VAT toàn dòng */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="vatTaxPercent"
              label="VAT (%)"
              rules={[
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: 'Mức thuế VAT phải từ 0% đến 100%'
                }
              ]}
            >
              <InputNumber<number>
                placeholder="Nhập mức thuế VAT"
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
        </Row>

        {/* Hàng 4: Date range row (2 cụm) */}
        <Row gutter={[16, 16]} className="mt-4">
          {/* Cụm trái: Thời gian áp dụng */}
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
                placeholder="Chọn thời gian áp dụng"
                className="w-full"
                size="large"
                suffixIcon={<span className="anticon">📅</span>}
              />
            </Form.Item>
          </Col>

          {/* Cụm phải: Thời gian kết thúc */}
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

                    const formValues = getFieldsValue(true)
                    const startDate = formValues.startDate

                    if (startDate && value) {
                      const startNativeDate = startDate.$d || startDate._d || new Date(startDate)
                      const endNativeDate = value.$d || value._d || new Date(value)

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
                placeholder="Chọn thời gian kết thúc (tùy chọn)"
                className="w-full"
                size="large"
                suffixIcon={<span className="anticon">📅</span>}
                onChange={(date) => {
                  setTimeout(() => {
                    form.validateFields(['endDate'])
                  }, 100)
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 5: Actions - Căn phải */}
        <Row justify="end" className="mt-8" gutter={[12, 0]}>
          <Col>
            <Button onClick={onCancel} size="large">
              Quay lại
            </Button>
          </Col>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Thiết lập
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default VatFeeForm