import { DualAxes } from '@ant-design/plots'
import CardLabel from '@components/dashboard/CardLabel'
import CardNumber from '@components/dashboard/CardNumber'
import { GUTTER } from '@constants/appConstant'
import {
  useDashboardOverviewQuery,
  useDashboardStatisticQuery
} from '@services/cmsService'
import { Card, Col, Progress, Row } from 'antd'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { BiDownArrow, BiUpArrow } from 'react-icons/bi'
import { MdAttachMoney } from 'react-icons/md'

const time = new Date().toISOString()

const Dashboard = () => {
  const { t } = useTranslation()

  const { data: statics } = useDashboardStatisticQuery({
    time: time
  })
  const { data: chartData } = useDashboardOverviewQuery({
    year: dayjs().year().toString()
  })

  const nullValue: Record<string, any>[] = []

  return (
    <>
      <Row gutter={GUTTER}>
        <Col flex='auto'>
          <CardLabel
            icon={BiUpArrow}
            iconColor='text-blue'
            label={t('partner.collection-transaction')}
            total={
              (statics?.repaymentTx || 0) + (statics?.repaymentTxError || 0)
            }
            value={statics?.repaymentTx || 0}
            className='border-blue'
          />
        </Col>
        <Col flex='auto'>
          <CardLabel
            icon={BiDownArrow}
            iconColor='text-purple'
            label={t('partner.pay-on-behalf-transaction')}
            total={
              (statics?.preDisbursementTx || 0) +
              (statics?.preDisbursementTxError || 0)
            }
            value={statics?.preDisbursementTx || 0}
            className='border-purple'
          />
        </Col>
        <Col flex='auto'>
          <CardLabel
            icon={MdAttachMoney}
            iconColor='text-yellow'
            label={t('partner.collection-total')}
            total={
              (statics?.preDisbursementAmount || 0) +
              (statics?.preDisbursementAmountError || 0)
            }
            value={statics?.preDisbursementAmount || 0}
            className='border-yellow'
          />
        </Col>
        <Col flex='auto'>
          <CardLabel
            icon={MdAttachMoney}
            iconColor='text-green'
            label={t('partner.pay-on-behalf-total')}
            total={
              (statics?.repaymentAmount || 0) +
              (statics?.repaymentAmountError || 0)
            }
            value={statics?.repaymentAmount || 0}
            className='border-green'
          />
        </Col>
      </Row>
      <Row
        gutter={GUTTER}
        className='mb-10 mt-10'
      >
        <Col span={16}>
          <Card title={t('partner.transactionOverview')}>
            <DualAxes
              data={[chartData ?? nullValue, chartData ?? nullValue]}
              xField='time'
              yField={['repayment', 'disburse']}
              geometryOptions={[
                {
                  geometry: 'column'
                },
                {
                  geometry: 'line',
                  lineStyle: {
                    lineWidth: 2
                  }
                }
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            bordered={false}
            className='w-100 h-100'
            title={t('partner.percentPreDisbursementNeedPayment')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Progress
              type='circle'
              percent={statics?.percentPreDisbursementNeedPayment}
              width={400}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={GUTTER}>
        <Col flex='auto'>
          <CardNumber
            title={t('partner.error-repayment-transaction')}
            value={statics?.preDisbursementAmountError || 0}
            color='blue'
          />
        </Col>
        <Col flex='auto'>
          <CardNumber
            title={t('partner.error-pay-on-behalf-transaction')}
            value={statics?.repaymentAmountError || 0}
            color='purple'
          />
        </Col>
        <Col flex='auto'>
          <CardNumber
            title={t('partner.total-error-transaction')}
            value={
              (statics?.preDisbursementAmountError || 0) +
              (statics?.repaymentAmountError || 0)
            }
            color='yellow'
          />
        </Col>
        <Col flex='auto'>
          <CardNumber
            title={t('partner.total-liabilities')}
            value={statics?.totalLiabilities || 0}
            color='green'
          />
        </Col>
      </Row>
    </>
  )
}
export default Dashboard
