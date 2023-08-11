import { GUTTER } from '@constants/appConstant'
import { Card, Col, Form, Input, Row, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

function SystemOverview() {
  const { t } = useTranslation()
  return (
    <div className='system-overview'>
      <Typography.Title
        level={4}
        className='d-block mb-20'
      >
        {t`bank-system-overview.title`.toString()}
      </Typography.Title>
      <Form layout='vertical'>
        <Card
          title={t`bank-system-overview.wallet`}
          className='mb-20'
        >
          <Row gutter={GUTTER}>
            <Col
              xs={24}
              lg={12}
            >
              <Form.Item label={t`bank-system-overview.registered-account`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.active-account`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.balance-account`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.total-account`}>
                <Input />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              lg={12}
            >
              <Form.Item label={t`bank-system-overview.personal-account`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.dn-account`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.balance-value`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.dn-balance-account`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.balance-system`}>
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card
          title={t`bank-system-overview.payment-gate`}
          className='mb-20'
        >
          <Row gutter={GUTTER}>
            <Col
              xs={24}
              lg={12}
            >
              <Form.Item label={t`bank-system-overview.merchant-id`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.transfer-number`}>
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              lg={12}
            >
              <Form.Item
                label={t`bank-system-overview.transfer-average-number`}
              >
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.dn-account`}>
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
        </Card>
        <Card title={t`bank-system-overview.revenue-title`}>
          <Row gutter={GUTTER}>
            <Col
              xs={24}
              lg={12}
            >
              <Form.Item label={t`bank-system-overview.panner-number`}>
                <Input readOnly />
              </Form.Item>
              <Form.Item label={t`bank-system-overview.transfer-revenue`}>
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              lg={12}
            >
              <Form.Item label={t`bank-system-overview.error-transfer-number`}>
                <Input readOnly />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  )
}
export default SystemOverview
