import { Pie } from '@ant-design/plots'
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

  const config = useMemo(() => {
    return {
      appendPadding: 10,
      data: deviceData,
      angleField: 'value',
      colorField: 'type',
      radius: 1,
      innerRadius: 0.6,
      label: {
        type: 'inner',
        offset: '-50%',
        autoEllipsis: true,
        content: '{value}',
        style: {
          textAlign: 'center',
          fontSize: 22
        }
      },
      interactions: [
        {
          type: 'element-selected',
          enable: false
        },
        {
          type: 'element-active',
          enable: false
        }
      ],
      statistic: {
        content: {
          style: {
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }
      }
    }
  }, [deviceData])

  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans`internal-accounts-report.registerDevice`}
        </Typography.Title>
        <Pie
          loading={isLoading}
          {...config}
        />
      </Card>
    </Col>
  )
}

export default React.memo(CircleChart)
