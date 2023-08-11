// import InternalTimeOptions from '@components/internal-time-options/InternalTimeOptions'
import StatisticCard from '@components/statistic-card/StatisticCard'
import { Card, Checkbox, Col, Row, Typography } from 'antd'
import React, { useCallback } from 'react'
import {
  LineChartOutlined,
  CloudDownloadOutlined,
  BankOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import DailyRechargeChart from './daily-recharge-chart/DailyRechargeChart'
import DailyRechargeBankChart from './daily-recharge-bank-chart/DailyRechargeBankChart'
import BankOptionsCard from './bank-options-card/BankOptionsCard'
import RechargeTable from './recharge-table/RechargeTable'
import { GUTTER } from '@constants/appConstant'

const AggregateRechargeReport = () => {
  const { t } = useTranslation()

  const trans = useCallback((key: string) => {
    const str = `internal-aggregate-recharge-report.${key}`
    return t(str)
  }, [])

  return (
    <Card title={trans('title')}>
      <Row gutter={GUTTER}>
        <Col xs={24}>{/* <InternalTimeOptions /> */}</Col>
        <Col
          xs={24}
          md={12}
          lg={6}
        >
          <StatisticCard
            data={'$65.000.000'}
            type={true}
            title={trans('totalDeposit').toUpperCase()}
            description={`3.545 ${trans('transaction').toLocaleLowerCase()}`}
            icon={<LineChartOutlined style={{ fontSize: 20 }} />}
            color={'#8892d6'}
          />
        </Col>
        <Col
          xs={24}
          md={12}
          lg={6}
        >
          <StatisticCard
            data={'$65.000.000'}
            type={true}
            title={trans('fromAffiliatedBank').toUpperCase()}
            description={`3.545 ${trans('transaction').toLocaleLowerCase()}`}
            icon={<BankOutlined style={{ fontSize: 20 }} />}
            color={'#f06292'}
          />
        </Col>
        <Col
          xs={24}
          md={12}
          lg={6}
        >
          <StatisticCard
            data={'$65.000.000'}
            type={true}
            title={trans('rechargeSwitchPort').toUpperCase()}
            description={`3.545 ${trans('transaction').toLocaleLowerCase()}`}
            icon={<CloudDownloadOutlined style={{ fontSize: 20 }} />}
            color={'#78c350'}
          />
        </Col>
        <Col
          xs={24}
          md={12}
          lg={6}
        >
          <Card className='h-100'>
            <Typography.Title level={5}>
              {trans('selectMethod')}
            </Typography.Title>
            <Checkbox>{trans('fromAffiliatedBank')}</Checkbox>
            <br />
            <Checkbox>
              {trans('rechargeSwitchPort') + '-' + trans('localBank')}
            </Checkbox>
            <br />
            <Checkbox>
              {trans('rechargeSwitchPort') + '-' + trans('QTCard')}
            </Checkbox>
          </Card>
        </Col>
        <DailyRechargeChart />
        <DailyRechargeBankChart />
        <BankOptionsCard />
      </Row>
      <RechargeTable />
    </Card>
  )
}

export default AggregateRechargeReport
