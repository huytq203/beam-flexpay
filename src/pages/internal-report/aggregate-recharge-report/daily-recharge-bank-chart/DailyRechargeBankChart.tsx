
import { Card, Col, Typography } from 'antd'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const DailyRechargeBankChart = () => {
  const { t } = useTranslation()
  const trans = useCallback((key: string) => {
    const str = `internal-aggregate-recharge-report.${key}`
    return t(str);
  }, [])
  const data = [
    {
      type: '分类一',
      value: 27
    },
    {
      type: '分类二',
      value: 25
    },
    {
      type: '分类三',
      value: 18
    },
    {
      type: '分类四',
      value: 15
    },
    {
      type: '分类五',
      value: 10
    },
    {
      type: '其他',
      value: 5
    }
  ]
  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14
      }
    },
    interactions: [
      {
        type: 'element-selected'
      },
      {
        type: 'element-active'
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

  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans('rechargeByBank')}
        </Typography.Title>
        {/* <Pie {...config} /> */}
      </Card>
    </Col>
  )
}

export default React.memo(DailyRechargeBankChart)
