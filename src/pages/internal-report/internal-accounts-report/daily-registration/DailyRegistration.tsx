import { Card, Col, Typography } from 'antd'
import React from 'react'
import { Line, LineConfig } from '@ant-design/plots'
import { useTranslation } from 'react-i18next'
import { ReportItemType } from '../report.const'

type DailyRegistrationPropsType = {
  reportChartData: ReportItemType[]
}

const DailyRegistration = ({ reportChartData }: DailyRegistrationPropsType) => {
  const { t: trans } = useTranslation()

  const config: LineConfig = {
    data: reportChartData,
    xField: 'time',
    yField: 'value',
    lineStyle: {
      style: {
        cursor: 'pointer'
      }
    },
    point: {
      size: 5,
      shape: 'dot',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2
      }
    },
    tooltip: {
      showMarkers: true
    },
    state: {
      active: {
        style: {
          shadowBlur: 4,
          stroke: '#000',
          fill: 'red'
        }
      }
    },
    interactions: [
      {
        type: 'marker-active'
      }
    ]
  }

  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans`internal-accounts-report.dailyRegistration`}
        </Typography.Title>
        <Line {...config} />
      </Card>
    </Col>
  )
}

export default React.memo(DailyRegistration)
