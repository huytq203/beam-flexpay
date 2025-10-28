import { Col, DatePicker, Form, Row } from 'antd'

interface DateRangeSectionProps {
  isEdit?: boolean
}

const DateRangeSection = ({ isEdit = false }: DateRangeSectionProps) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Thời gian áp dụng */}
      <Col span={12}>
        <Form.Item
          name="startDate"
          label="Thời gian áp dụng"
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
  )
}

export default DateRangeSection