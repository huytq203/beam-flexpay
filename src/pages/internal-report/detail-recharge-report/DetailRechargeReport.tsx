import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from 'antd'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import DetailRechargeTable from './detail-recharge-table/DetailRechargeTable'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'

const DetailRechargeReport = () => {
  const { t } = useTranslation()

  const trans = useCallback((key: string) => {
    return t(`internal-detail-recharge-report.${key}`)
  }, [])

  const methods = useMemo<{ name: string }[]>(() => [{ name: 'Method 1' }], [])

  const banks = useMemo<{ name: string }[]>(() => [], [])

  return (
    <Card title={trans('title')}>
      <Form layout='vertical'>
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <Form.Item label={trans('time')}>
              <DatePicker
                format={TimeFormat}
                allowClear
                className='w-100'
              />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <Form.Item label={trans('method')}>
              <Select>
                {methods.map((method) => {
                  return <Select.Option>{method.name}</Select.Option>
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={4}
          >
            <Form.Item label={trans('bank')}>
              <Select>
                {banks.map((bank) => (
                  <Select.Option>{bank.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={4}
          >
            <Form.Item label={trans('account')}>
              <Input placeholder={trans('inputAccount')} />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={12}
            lg={4}
          >
            <Form.Item label={trans('transactionCode')}>
              <Input placeholder={trans('inputTransactionCode')} />
            </Form.Item>
          </Col>
        </Row>
        <Row
          gutter={GUTTER}
          style={{ margin: '16px 0' }}
          justify='end'
        >
          <Col>
            <Button type='primary'>{trans('search')}</Button>
          </Col>
          <Col>
            <Button
              type='primary'
              ghost
            >
              {trans('exportFile')}
            </Button>
          </Col>
        </Row>
      </Form>
      <DetailRechargeTable />
    </Card>
  )
}

export default DetailRechargeReport
