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
import { useState, useEffect } from 'react'
import moment from 'moment'
import { VatFeeApplicationType } from '@type/vat-fee'
import { parseNumberFromPercentString } from '@utils/helperFunctions'

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
    form.setFieldsValue({
      accountGroup: undefined,
      accountNumber: undefined
    })
  }

  const pctToMpct = (percent?: number) => {
    if (percent === undefined || percent === null) return undefined
    return Math.round(percent * 1000)
  }

  const handleSubmit = (values: any) => {
    const payload = {
      applicationType: values.applicationType,
      ...(values.accountGroup && { accountGroup: values.accountGroup }),
      ...(values.accountNumber && { accountNumber: values.accountNumber }),
      ...(values.vatTaxPercent !== undefined && { flexibleFeeMpct: pctToMpct(values.vatTaxPercent) }),
      startDate: values.startDate?.toISOString(),
      ...(values.endDate && { endDate: values.endDate.toISOString() })
    }

    console.log('VAT Fee form payload to be sent to API:', payload)
    onFinish(payload)
  }

  // Mock data for development
  const mockAccountGroups = [
    { value: 'group_1', label: 'Nhóm tài khoản 1' },
    { value: 'group_2', label: 'Nhóm tài khoản 2' },
    { value: 'group_3', label: 'Nhóm tài khoản 3' },
    { value: 'group_retail', label: 'Nhóm bán lẻ' },
    { value: 'group_wholesale', label: 'Nhóm bán sỉ' }
  ]

  const mockAccounts = [
    { value: 'acc_001', label: '0987654321 - Nguyễn Văn A' },
    { value: 'acc_002', label: '0123456789 - Trần Thị B' },
    { value: 'acc_003', label: '0369852147 - Lê Văn C' },
    { value: 'acc_004', label: '0901234567 - Phạm Thị D' },
    { value: 'acc_005', label: '0912345678 - Hoàng Văn E' }
  ]

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
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={mockAccountGroups}
                  size="large"
                />
              </Form.Item>
            )}

            {applicationType === VatFeeApplicationType.INDIVIDUAL && (
              <Form.Item
                name="accountNumber"
                label="Tài khoản*"
                rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
              >
                <Select
                  placeholder="Tìm theo số điện thoại hoặc mã ví"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={mockAccounts}
                  size="large"
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
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value && moment(value).isBefore(moment(), 'day')) {
                      return Promise.reject(new Error('Ngày giờ áp dụng phải lớn hơn hoặc bằng ngày giờ hiện tại'))
                    }
                    return Promise.resolve()
                  }
                })
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