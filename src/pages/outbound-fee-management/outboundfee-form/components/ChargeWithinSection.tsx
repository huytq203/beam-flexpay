import { Checkbox, Col, Form, Row } from 'antd'

interface ChargeWithinSectionProps {
  isEdit?: boolean
}

const ChargeWithinSection = ({ isEdit = false }: ChargeWithinSectionProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Form.Item
          name="chargeWithin"
          valuePropName="checked"
          tooltip="Chọn nếu thu phí trong giao dịch"
        >
          <Checkbox disabled={isEdit}>Thu phí trong</Checkbox>
        </Form.Item>
      </Col>
    </Row>
  )
}

export default ChargeWithinSection
