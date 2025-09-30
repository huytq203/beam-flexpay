import {
  Form,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Divider
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import moment from 'moment'
import { parseNumberFromCommaString, parseNumberFromPercentString } from '@utils/helperFunctions'

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

  // Watch form fields
  const flexibleFee = Form.useWatch('flexibleFeePercent', form)
  const fixedFee = Form.useWatch('fixedFee', form)

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        applicationType: initialValues.applicationType ?? 'system',
        startDate: initialValues.startDate ? moment(initialValues.startDate) : moment(),
        endDate: initialValues.endDate ? moment(initialValues.endDate) : undefined,
        priceFrom: initialValues.priceFrom ?? 0,
        priceTo: initialValues.priceTo ?? 0,
        method: initialValues.method ?? ['all'],
        bank: initialValues.bank ?? ['all'],
        provider: initialValues.provider ?? ['all'],
        flexibleFeePercent: initialValues.flexibleFeePercent ?? 0,
        fixedFee: initialValues.fixedFee ?? 0,
        minFee: initialValues.minFee ?? undefined,
        maxFee: initialValues.maxFee ?? undefined,
        vat: initialValues.vat ?? 0
      })
      setApplicationType(initialValues.applicationType ?? 'system')
      setTransactionType(initialValues.transactionType ?? '')
    }
  }, [initialValues, form])

  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value)
    form.setFieldsValue({
      accountGroup: undefined,
      accountId: undefined
    })
  }

  // Remove unused variable warning
  useEffect(() => {
    // This effect is intentionally empty
  }, [])

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

      // Fee configuration (only include if they have values)
      ...(values.flexibleFeePercent !== undefined && { flexibleFeePercent: values.flexibleFeePercent }),
      ...(values.fixedFee !== undefined && { fixedFee: values.fixedFee }),
      ...(values.minFee !== undefined && { minFee: values.minFee }),
      ...(values.maxFee !== undefined && { maxFee: values.maxFee }),

      // VAT
      ...(values.vat !== undefined && { vat: values.vat })
    }

    // Only include disabled fields when NOT in edit mode (i.e., when creating)
    if (!isEdit) {
      payload.applicationType = values.applicationType
      payload.transactionType = values.transactionType
      payload.method = Array.isArray(values.method) ? values.method[0] : values.method
      payload.provider = Array.isArray(values.provider) ? values.provider[0] : values.provider

      // Optional fields based on applicationType (only for create)
      if (values.applicationType === 'individual' && values.accountId) {
        payload.accountId = values.accountId
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

  // Mock data for dropdowns
  const mockAccountGroups = [
    { value: 'group_1', label: 'Nhóm VIP' },
    { value: 'group_2', label: 'Nhóm Thường' },
    { value: 'group_3', label: 'Nhóm Doanh nghiệp' }
  ]

  const mockAccounts = [
    { value: 'acc_001', label: 'Ví VIP 001 - 0987654321' },
    { value: 'acc_002', label: 'Ví Thường 002 - 0123456789' },
    { value: 'acc_003', label: 'Ví DN 003 - 0369852147' }
  ]

  const mockBanks = [
    { value: 'vcb', label: 'Vietcombank' },
    { value: 'acb', label: 'ACB' },
    { value: 'tcb', label: 'Techcombank' },
    { value: 'bidv', label: 'BIDV' },
    { value: 'vpb', label: 'VPBank' }
  ]

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
          flexibleFeePercent: 0,
          fixedFee: 0,
          vat: 0
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Hàng 1 */}
          {/* Cột 1: Đối tượng áp dụng */}
          <Col span={12}>
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
              >
                <Option value="system">Hệ thống</Option>
                <Option value="individual">Đối tượng riêng</Option>
                <Option value="account_group">Nhóm tài khoản</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Cột 2: Loại giao dịch */}
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
              >
                <Option value="deposit">Nạp tiền</Option>
                <Option value="withdrawal">Rút tiền</Option>
                <Option value="payment">Thanh toán</Option>
                <Option value="transfer">Chuyển tiền</Option>
                <Option value="refund">Hoàn tiền</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Hàng 2 */}
          {/* Cột 1: Chọn nhóm tài khoản (hiện khi chọn Nhóm tài khoản) */}
          {applicationType === 'account_group' && (
            <Col span={12}>
              <Form.Item
                name="accountGroup"
                label="Chọn nhóm tài khoản"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm tài khoản' }]}
                tooltip="Chọn nhóm tài khoản để áp dụng chính sách phí"
              >
                <Select
                  placeholder="Tìm và chọn nhóm tài khoản"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={mockAccountGroups}
                  size="large"
                />
              </Form.Item>
            </Col>
          )}

          {/* Cột 1: Nhập tài khoản (hiện khi chọn Đối tượng riêng) */}
          {applicationType === 'individual' && (
            <Col span={12}>
              <Form.Item
                name="accountId"
                label="Nhập tài khoản"
                rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
                tooltip="Chọn tài khoản ví điện tử để áp dụng chính sách phí"
              >
                <Select
                  placeholder="Tìm theo số điện thoại hoặc mã ví"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={mockAccounts}
                  size="large"
                />
              </Form.Item>
            </Col>
          )}

          {/* Cột 2: Phương thức giao dịch */}
          <Col span={12}>
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
              />
            </Form.Item>
          </Col>

          {/* Hàng 3 */}
          {/* Cột 1: Ngân hàng */}
          <Col span={12}>
            <Form.Item
              name="bank"
              label="Ngân hàng"
              rules={[{ required: true, message: 'Vui lòng chọn ngân hàng' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn ngân hàng"
                options={[
                  { value: 'all', label: 'Tất cả' },
                  ...mockBanks
                ]}
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Cột 2: Nhà cung cấp */}
          <Col span={24}>
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
              />
            </Form.Item>
          </Col>

          {/* Hàng 4 */}
          {/* Cột 1: Thời gian áp dụng */}
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
                placeholder="dd/mm/yyyy hh:mm:ss (Tùy chọn)"
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
              rules={[
                { required: true, message: 'Vui lòng nhập mức giao dịch từ' },
                {
                  type: 'number',
                  min: 0,
                  max: 999999999999,
                  message: 'Giá trị phải từ 0 đến 999,999,999,999'
                }
              ]}
            >
              <InputNumber<number>
                placeholder="0"
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
              label="Mức giao dịch đến (VND)"
              rules={[
                { required: true, message: 'Vui lòng nhập mức giao dịch đến' },
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
                    return Promise.reject(new Error('Số tiền đến phải lớn hơn số tiền từ'))
                  }
                })
              ]}
            >
              <InputNumber<number>
                placeholder="999,999,999,999"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                min={0}
                max={999999999999}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Phí linh hoạt */}
          <Col span={12}>
            <Form.Item
              name="flexibleFeePercent"
              label="Phí linh hoạt (%)"
              rules={[
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

          {/* Phí cố định */}
          <Col span={12}>
            <Form.Item
              name="fixedFee"
              label="Phí cố định (VND)"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const flexibleFee = getFieldValue('flexibleFeePercent')
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
                min={0}
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
              required
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const flexibleFee = getFieldValue('flexibleFeePercent')
                    // Chỉ bắt buộc nếu có phí linh hoạt
                    if (flexibleFee && flexibleFee > 0 && !value) {
                      return Promise.reject(new Error('Phí tối thiểu là bắt buộc khi có phí linh hoạt'))
                    }
                    return Promise.resolve()
                  }
                })
              ]}
              tooltip="Phí tối thiểu cho mỗi giao dịch (bắt buộc khi có phí linh hoạt)"
            >
              <InputNumber<number>
                placeholder="Để trống nếu không cần"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                min={0}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* Phí tối đa */}
          <Col span={12}>
            <Form.Item
              name="maxFee"
              label="Phí tối đa (VND)"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve()
                    const fixedFee = getFieldValue('fixedFee') || 0
                    const minFee = getFieldValue('minFee') || 0
                    if (value <= fixedFee || value <= minFee) {
                      return Promise.reject(new Error('Phí tối đa phải lớn hơn phí cố định và phí tối thiểu'))
                    }
                    return Promise.resolve()
                  }
                })
              ]}
              tooltip="Phí tối đa cho mỗi giao dịch (tùy chọn)"
            >
              <InputNumber<number>
                placeholder="Để trống nếu không giới hạn"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={parseNumberFromCommaString}
                min={0}
                className="w-full"
                size="large"
              />
            </Form.Item>
          </Col>

          {/* VAT */}
          <Col span={12}>
            <Form.Item
              name="vat"
              label="VAT (%)"
              rules={[
                { required: true, message: 'Vui lòng nhập VAT' },
                {
                  type: 'number',
                  min: 0,
                  max: 100,
                  message: 'VAT phải từ 0% đến 100%'
                }
              ]}
              tooltip="Thuế giá trị gia tăng tính theo phần trăm"
            >
              <InputNumber<number>
                placeholder="0.000"
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