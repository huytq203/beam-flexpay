import { Card, Col, Typography } from 'antd'
import React from 'react'

import { useTranslation } from 'react-i18next'
import { ReportItemType } from '../report.const'

type DailyRegistrationPropsType = {
  reportChartData: ReportItemType[]
}

const DailyRegistration = ({ reportChartData }: DailyRegistrationPropsType) => {
  const { t: trans } = useTranslation()



  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans`internal-accounts-report.dailyRegistration`}
        </Typography.Title>
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <i>(Biểu đồ đã bị gỡ theo yêu cầu)</i>
        </div>
      </Card>
    </Col>
  )
}

export default React.memo(DailyRegistration)
