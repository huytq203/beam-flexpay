
import { Card, Col, Typography } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceChartItemType } from '../report.const'

type CircleChartPropsType = {
  deviceData: DeviceChartItemType[]
  isLoading: boolean
}

const CircleChart = ({ deviceData, isLoading }: CircleChartPropsType) => {
  const { t: trans } = useTranslation()



  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans`internal-accounts-report.registerDevice`}
        </Typography.Title>
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <i>(Biểu đồ đã bị gỡ theo yêu cầu)</i>
        </div>
      </Card>
    </Col>
  )
}

export default React.memo(CircleChart)
