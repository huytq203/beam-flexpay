import { Col, Form, InputNumber, Row, Typography } from 'antd'
import { parseNumberFromCommaString } from '@utils/helperFunctions'
import isNil from 'lodash/isNil'

const { Title } = Typography

interface FeeInfoSectionProps {
  shouldDisableMinMaxFee: boolean
}

const FeeInfoSection = ({ shouldDisableMinMaxFee }: FeeInfoSectionProps) => {
  const form = Form.useFormInstance()
  const flexibleFeeMpct = Form.useWatch('flexibleFeeMpct', form)

  // Check if flexibleFee is provided and > 0
  const hasFlexibleFee = !isNil(flexibleFeeMpct) && flexibleFeeMpct > 0

  return (
    <>
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
                message: 'Mức giao dịch từ phải từ 0 đến 999,999,999,999'
              }
            ]}
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
              }
            ]}
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
                message: 'Phí cố định phải từ 0 đến 999,999,999,999'
              }
            ]}
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

        {/* Phí tối thiểu */}
        <Col span={12}>
          <Form.Item
            name="minFee"
            label="Phí tối thiểu (VND)"
            required={hasFlexibleFee}
          >
            <InputNumber<number>
              placeholder="Nhập phí tối thiểu"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
              disabled={shouldDisableMinMaxFee}
            />
          </Form.Item>
        </Col>

        {/* Phí tối đa */}
        <Col span={12}>
          <Form.Item
            name="maxFee"
            label="Phí tối đa (VND)"
            required={hasFlexibleFee}
          >
            <InputNumber<number>
              placeholder="Nhập phí tối đa"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={parseNumberFromCommaString}
              className="w-full"
              size="large"
              disabled={shouldDisableMinMaxFee}
            />
          </Form.Item>
        </Col>

        {/* VAT */}
        <Col span={12}>
          <Form.Item
            name="vatMpct"
            label="VAT (%)"
            validateTrigger="onChange"
            rules={[
              {
                type: 'number',
                min: 0,
                max: 100,
                transform: (value) => Number(value),
                message: 'VAT phải từ 0% đến 100%'
              }
            ]}
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
    </>
  )
}

export default FeeInfoSection
