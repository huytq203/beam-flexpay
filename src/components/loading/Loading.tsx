import { Col, Row, Spin } from 'antd'

function Loading() {
  return (
    <Row>
      <Col>
        <Spin size='large' />
      </Col>
    </Row>
  )
}

export default Loading
