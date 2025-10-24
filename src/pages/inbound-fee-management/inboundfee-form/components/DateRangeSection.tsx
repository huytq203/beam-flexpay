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
  )
}

export default DateRangeSection