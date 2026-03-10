import { Line, LineConfig } from '@ant-design/plots';
import { Card, Col, Typography } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const DailyRechargeChart = () => {
  const {t} = useTranslation()

  const trans = useCallback((key: string) => {
    const str = `internal-aggregate-recharge-report.${key}`
    return t(str);
  }, [])

  const data = [
    {
      type: 'totalDeposit',
      value: 27,
      hour: '1'
    },
    {
      type: 'affiliatedCard',
      value: 25,
      hour: '1'
    },
    {
      type: 'localBank',
      value: 18,
      hour: '1'
    },
    {
      type: 'internationalCard',
      value: 15,
      hour: '1'
    },
    {
      type: 'totalDeposit',
      value: 2,
      hour: '2'
    },
    {
      type: 'affiliatedCard',
      value: 21,
      hour: '2'
    },
    {
      type: 'localBank',
      value: 6,
      hour: '2'
    },
    {
      type: 'internationalCard',
      value: 13,
      hour: '2'
    },
    {
      type: 'totalDeposit',
      value: 27,
      hour: '3'
    },
    {
      type: 'affiliatedCard',
      value: 25,
      hour: '3'
    },
    {
      type: 'localBank',
      value: 18,
      hour: '3'
    },
    {
      type: 'internationalCard',
      value: 15,
      hour: '3'
    },
    {
      type: 'totalDeposit',
      value: 2,
      hour: '4'
    },
    {
      type: 'affiliatedCard',
      value: 21,
      hour: '4'
    },
    {
      type: 'localBank',
      value: 6,
      hour: '4'
    },
    {
      type: 'internationalCard',
      value: 13,
      hour: '4'
    },
  ]
  const config = useMemo<LineConfig>(() =>  ({
    data,
    xField: 'hour',
    yField: 'value',
    seriesField: 'type',
    color: ({ type }: any) => {
      return type === 'totalDeposit' ? '#8892d6' : type === 'affiliatedCard' ? '#1ea69a' : type === 'localBank' ? '#f7531f' : '#3b3e47';
    },
    lineStyle: ({ type }: any) => {
      return {
        opacity: 0.5,
      };
    },
    legend: {
      itemName: {
        formatter: (text: string) => text === 'totalDeposit' ? trans('totalDeposit') : text === 'affiliatedCard' ? trans('fromAffiliatedCard') : text === 'localBank' ? trans('fromLocalBank') : trans('fromInternationalCard')
      }
    }
  }), []);

  return (
    <Col
      xs={24}
      lg={12}
    >
      <Card>
        <Typography.Title level={5}>
          {trans('dailyRecharge')}
        </Typography.Title>
        <Line {...config} />
      </Card>
    </Col>
  )
}

export default React.memo(DailyRechargeChart)