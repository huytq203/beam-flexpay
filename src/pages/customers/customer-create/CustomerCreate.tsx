import {Card, Col, Row} from 'antd'
import CustomerForm from '../customer-form/CustomerForm'

import '../style.scss'

function CustomerCreate() {
  return (
    <Card>
      <Row className='p-10'>
        <Col span={24}>
          <CustomerForm />
        </Col>
      </Row>
    </Card>
  )
}

export default CustomerCreate
