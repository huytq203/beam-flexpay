import { Checkbox, Col, DatePicker, Form, InputNumber, Row, Typography } from 'antd'
import { parseNumberFromCommaString } from '@utils/helperFunctions'
import isNil from 'lodash/isNil'

const { Title } = Typography

interface FeeInfoSectionProps {
  shouldDisablePayerMinMaxFee: boolean
  shouldDisableReceiverMinMaxFee: boolean
  isEdit?: boolean
}

const FeeInfoSection = ({
                          shouldDisablePayerMinMaxFee,
                          shouldDisableReceiverMinMaxFee,
                          isEdit = false
                        }: FeeInfoSectionProps) => {
  const form = Form.useFormInstance()

  // Watch payer flexible fee to show required indicator
  const payerFlexibleFeeMpct = Form.useWatch('payerFlexibleFeeMpct', form)
  const hasPayerFlexibleFee = !isNil(payerFlexibleFeeMpct) && payerFlexibleFeeMpct > 0

  // Watch receiver flexible fee to show required indicator
  const receiverFlexibleFeeMpct = Form.useWatch('receiverFlexibleFeeMpct', form)
  const hasReceiverFlexibleFee = !isNil(receiverFlexibleFeeMpct) && receiverFlexibleFeeMpct > 0

  return (
    <>
      <Title level={4}>Thông tin gói phí</Title>

      {/* ============ CHARGE WITHIN ROW ============ */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Form.Item
            name="chargeWithin"
            valuePropName="checked"
            tooltip="Chọn nếu thu phí trong giao dịch"
          >
            <Checkbox>Thu phí trong</Checkbox>
          </Form.Item>
        </Col>
      </Row>

      {/* ============ DATE RANGE ROW ============ */}
      <Row gutter={[16, 16]}>
        {/* Thời gian áp dụng */}
        <Col span={12}>
          <Form.Item
            name="startDate"
            label="Thời gian áp dụng"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn thời gian áp dụng'
              }
            ]}
            tooltip="Chọn ngày giờ bắt đầu áp dụng chính sách phí"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm:ss"
              placeholder="Chọn ngày giờ bắt đầu"
              className="w-full"
              size="large"
              disabled={isEdit}
            />
          </Form.Item>
        </Col>

        {/* Thời gian kết thúc */}
        <Col span={12}>
          <Form.Item
            name="endDate"
            label="Thời gian kết thúc"
            tooltip="Chọn ngày giờ kết thúc áp dụng (tùy chọn, để trống nếu không có thời hạn)"
          >
            <DatePicker
              showTime
              format="DD/MM/YYYY HH:mm:ss"
              placeholder="Chọn ngày giờ kết thúc"
              className="w-full"
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ============ PRICE RANGE ROW ============ */}
      <Row gutter={[16, 16]}>

        {/* ============ PRICE RANGE SECTION ============ */}
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
                message: 'Mức giao dịch từ phải từ 0 đến 999,999,999,999'
              }
            ]}
            tooltip="Ngưỡng giá trị giao dịch tối thiểu áp dụng chính sách phí này"
          >
            <InputNumber<number>
              placeholder="Nhập mức giao dịch tối thiểu"
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
                message: 'Mức giao dịch đến phải từ 0 đến 999,999,999,999'
              }
            ]}
            tooltip="Ngưỡng giá trị giao dịch tối đa áp dụng chính sách phí này"
          >
            <InputNumber<number>
              placeholder="Nhập mức giao dịch tối đa"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ============ PAYER FEES SECTION ============ */}
      <Title level={5} className="mt-4">Phí người chuyển</Title>

      <Row gutter={[16, 16]}>
        {/* Phí linh hoạt người chuyển */}
        <Col span={12}>
          <Form.Item
            name="payerFlexibleFeeMpct"
            label="Phí linh hoạt (%)"
            validateTrigger="onChange"
            rules={[
              {
                type: 'number',
                min: 0,
                max: 100,
                transform: (value) => Number(value),
                message: 'Phí linh hoạt phải từ 0% đến 100%'
              }
            ]}
            tooltip="Phí tính theo phần trăm giá trị giao dịch do người chuyển tiền chịu"
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

        {/* Phí cố định người chuyển */}
        <Col span={12}>
          <Form.Item
            name="payerFixedFee"
            label="Phí cố định (VND)"
            validateTrigger="onChange"
            rules={[
              {
                type: 'number',
                min: 0,
                max: 999999999999,
                transform: (value) => Number(value),
                message: 'Phí cố định phải từ 0 đến 999,999,999,999'
              }
            ]}
            tooltip="Phí cố định cho mỗi giao dịch do người chuyển tiền chịu"
          >
            <InputNumber<number>
              placeholder="Nhập phí cố định"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
            />
          </Form.Item>
        </Col>

        {/* Phí tối thiểu người chuyển */}
        <Col span={12}>
          <Form.Item
            name="payerMinFee"
            label="Phí tối thiểu (VND)"
            tooltip="Phí tối thiểu cho mỗi giao dịch (bắt buộc khi có phí linh hoạt)"
            required={hasPayerFlexibleFee}
          >
            <InputNumber<number>
              placeholder="Nhập phí tối thiểu"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
              disabled={shouldDisablePayerMinMaxFee}
            />
          </Form.Item>
        </Col>

        {/* Phí tối đa người chuyển */}
        <Col span={12}>
          <Form.Item
            name="payerMaxFee"
            label="Phí tối đa (VND)"
            tooltip="Phí tối đa cho mỗi giao dịch (bắt buộc khi có phí linh hoạt)"
            required={hasPayerFlexibleFee}
          >
            <InputNumber<number>
              placeholder="Nhập phí tối đa"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
              disabled={shouldDisablePayerMinMaxFee}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* ============ RECEIVER FEES SECTION ============ */}
      <Title level={5} className="mt-4">Phí người nhận</Title>

      <Row gutter={[16, 16]}>
        {/* Phí linh hoạt người nhận */}
        <Col span={12}>
          <Form.Item
            name="receiverFlexibleFeeMpct"
            label="Phí linh hoạt (%)"
            validateTrigger="onChange"
            rules={[
              {
                type: 'number',
                min: 0,
                max: 100,
                transform: (value) => Number(value),
                message: 'Phí linh hoạt phải từ 0% đến 100%'
              }
            ]}
            tooltip="Phí tính theo phần trăm giá trị giao dịch do người nhận tiền chịu"
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

        {/* Phí cố định người nhận */}
        <Col span={12}>
          <Form.Item
            name="receiverFixedFee"
            label="Phí cố định (VND)"
            validateTrigger="onChange"
            rules={[
              {
                type: 'number',
                min: 0,
                max: 999999999999,
                transform: (value) => Number(value),
                message: 'Phí cố định phải từ 0 đến 999,999,999,999'
              }
            ]}
            tooltip="Phí cố định cho mỗi giao dịch do người nhận tiền chịu"
          >
            <InputNumber<number>
              placeholder="Nhập phí cố định"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
            />
          </Form.Item>
        </Col>

        {/* Phí tối thiểu người nhận */}
        <Col span={12}>
          <Form.Item
            name="receiverMinFee"
            label="Phí tối thiểu (VND)"
            tooltip="Phí tối thiểu cho mỗi giao dịch (bắt buộc khi có phí linh hoạt)"
            required={hasReceiverFlexibleFee}
          >
            <InputNumber<number>
              placeholder="Nhập phí tối thiểu"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
              disabled={shouldDisableReceiverMinMaxFee}
            />
          </Form.Item>
        </Col>

        {/* Phí tối đa người nhận */}
        <Col span={12}>
          <Form.Item
            name="receiverMaxFee"
            label="Phí tối đa (VND)"
            tooltip="Phí tối đa cho mỗi giao dịch (bắt buộc khi có phí linh hoạt)"
            required={hasReceiverFlexibleFee}
          >
            <InputNumber<number>
              placeholder="Nhập phí tối đa"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
              disabled={shouldDisableReceiverMinMaxFee}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export default FeeInfoSection
