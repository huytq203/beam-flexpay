// import InternalTimeOptions from '@components/internal-time-options/InternalTimeOptions';
import { Card, Col, Row } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const ConsolidatedTransfersReport = () => {
  const { t } = useTranslation()

  const trans = useCallback(
    (key: string) => t(`internal-consolidated-transfers-report.${key}`),
    []
  )

  return (
    <Card title={trans('title')}>
      {/* <InternalTimeOptions/> */}
      <Row>
        <Col></Col>
      </Row>
    </Card>
  )
}

export default ConsolidatedTransfersReport
