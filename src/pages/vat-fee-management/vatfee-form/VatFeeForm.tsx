import {
  Form,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Row,
  Col,
  Typography
} from 'antd'
import { useState, useEffect, useMemo, useRef } from 'react'
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
  loading = false
}: VatFeeFormProps) => {
  const [form] = Form.useForm()
  const [applicationType, setApplicationType] = useState<VatFeeApplicationType>(VatFeeApplicationType.SYSTEM)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>()
  const [customerPage, setCustomerPage] = useState(1)
  const [hasMoreCustomers, setHasMoreCustomers] = useState(false)
  const [accumulatedCustomers, setAccumulatedCustomers] = useState<any[]>([])

  // Use ref to avoid re-render when loading more
  const isLoadingMoreRef = useRef(false)
  const prevCustomersDataRef = useRef<any>(null)

  // Fetch data from APIs
  const { data: accountGroupsData } = useVatFeeGetAccountGroupsQuery()
  const { data: customersData, isFetching: isCustomersFetching } = useVatFeeGetAccountsQuery(
    {
      query: customerSearchQuery,
      page: customerPage,
      take: 20
    },
    { skip: applicationType !== VatFeeApplicationType.INDIVIDUAL }
  )

  // Update hasMoreCustomers and accumulate customers when data changes
  useEffect(() => {
    // Skip if no data or data hasn't changed
    if (!customersData || prevCustomersDataRef.current === customersData) {
      return
    }

    prevCustomersDataRef.current = customersData

    if (customersData.meta) {
      setHasMoreCustomers(customersData.meta.hasNextPage)
      isLoadingMoreRef.current = false
    }

    if (customersData.data) {
      const currentPage = customersData.meta?.page || 1

      if (currentPage === 1) {
        // First page or new search - replace data
        setAccumulatedCustomers(customersData.data)
      } else {
        // Subsequent pages - append data
        setAccumulatedCustomers((prev) => {
          const existingIds = new Set(prev.map((c: any) => c.id))
          const newCustomers = customersData.data.filter((c: any) => !existingIds.has(c.id))
          return [...prev, ...newCustomers]
        })
      }
    }
  }, [customersData])

  // Debounced search function for customers
  const debouncedSearch = useMemo(() => {
    const loadOptions = (value: string) => {
      setCustomerSearchQuery(value)
      setCustomerPage(1) // Reset to page 1 on new search
      setAccumulatedCustomers([]) // Clear accumulated data on new search
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
    setCustomerPage(1)
    setAccumulatedCustomers([])
    prevCustomersDataRef.current = null
    form.setFieldsValue({
      accountGroup: undefined,
      phoneNumber: undefined
    })
  }

  // Memoize customer options to prevent re-render
  const customerOptions = useMemo(() => {
    return accumulatedCustomers.map((customer) => ({
      value: customer.phoneNumber,
      label: `${customer.fullName} - ${customer.phoneNumber}`,
      customerId: customer.id
    }))
  }, [accumulatedCustomers])

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
              label="Đối tượng áp dụng"
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
                label="Tài khoản"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm tài khoản' }]}
              >
                <Select
                  placeholder="Chọn nhóm tài khoản"
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={accountGroupsData?.map((group) => ({
                    value: group.id.toString(),
                    label: group.name
                  })) || []}
                  size="large"
                />
              </Form.Item>
            )}

            {applicationType === VatFeeApplicationType.INDIVIDUAL && (
              <Form.Item
                name="phoneNumber"
                label="Tài khoản"
                rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
              >
                <Select
                  placeholder="Tìm theo số điện thoại hoặc tên"
                  showSearch
                  defaultActiveFirstOption={false}
                  filterOption={false}
                  onSearch={debouncedSearch}
                  loading={isCustomersFetching && customerPage === 1}
                  options={customerOptions}
                  notFoundContent={isCustomersFetching ? 'Đang tải...' : 'Không tìm thấy dữ liệu'}
                  size="large"
                  allowClear
                  virtual={false}
                  listHeight={256}
                  getPopupContainer={(trigger) => trigger.parentElement || document.body}
                  onChange={(_value, option: any) => {
                    // Store the customer ID when a customer is selected
                    if (option && option.customerId) {
                      setSelectedCustomerId(option.customerId)
                    } else {
                      setSelectedCustomerId(undefined)
                    }
                  }}
                  onPopupScroll={(e) => {
                    const { target } = e as any
                    if (!target) return

                    // Ant Design recommended pattern: exact bottom detection
                    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
                      if (hasMoreCustomers && !isCustomersFetching && !isLoadingMoreRef.current) {
                        isLoadingMoreRef.current = true
                        setCustomerPage((prev) => prev + 1)
                      }
                    }
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {hasMoreCustomers && (
                        <div style={{ textAlign: 'center', padding: '8px', color: '#888' }}>
                          {isCustomersFetching ? 'Đang tải thêm...' : 'Cuộn xuống để xem thêm'}
                        </div>
                      )}
                    </>
                  )}
                />
              </Form.Item>
            )}

            {applicationType === VatFeeApplicationType.SYSTEM && (
              <Form.Item label="Tài khoản">
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
              validateTrigger="onChange"
              rules={[
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  transform: (value) => Number(value),
                  message: 'Mức thuế VAT phải từ 0% đến 100%'
                }
              ]}
            >
              <InputNumber<number>
                placeholder="Nhập mức thuế VAT"
                step={0.001}
                precision={3}
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
                onChange={() => {
                  setTimeout(() => {
                    void form.validateFields(['endDate'])
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