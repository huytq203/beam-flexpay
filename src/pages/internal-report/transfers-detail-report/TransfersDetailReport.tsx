import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { Button, Card, Col, DatePicker, Form, Input, Row } from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const TransfersDetailReport = () => {
  const { t } = useTranslation()

  const trans = useCallback(
    (key: string) => t(`internal-transfers-detail-report.${key}`),
    []
  )

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        title: trans('STT'),
        align: 'center',
        render: () => 0
      },
      {
        title: trans('transactionCode'),
        align: 'center',
        render: () => '123456'
      },
      {
        title: trans('transferAccount'),
        align: 'center',
        children: [
          {
            title: trans('account'),
            align: 'center',
            render: () => '090****000'
          },
          {
            title: trans('accountType'),
            align: 'center',
            render: () => 'Cá nhân'
          },
          {
            title: trans('transactionValue'),
            align: 'center',
            render: () => '1.000.000'
          },
          {
            title: trans('fee'),
            align: 'center',
            render: () => '1.000'
          },

          {
            title: trans('money'),
            align: 'center',
            render: () => '1.001.000'
          }
        ]
      },
      {
        title: trans('receiveAccount'),
        align: 'center',
        children: [
          {
            title: trans('account'),
            align: 'center',
            render: () => '090****000'
          },
          {
            title: trans('accountType'),
            align: 'center',
            render: () => 'Cá nhân'
          },
          {
            title: trans('transactionValue'),
            align: 'center',
            render: () => '1.000.000'
          },
          {
            title: trans('fee'),
            align: 'center',
            render: () => '1.000'
          },

          {
            title: trans('money'),
            align: 'center',
            render: () => '1.001.000'
          }
        ]
      },
      {
        title: trans('time'),
        align: 'center',
        render: () => '12/12/2022'
      }
    ],
    []
  )
  return (
    <Card title={trans('title')}>
      <Form>
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            md={6}
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
            md={6}
          >
            <Form.Item label={trans('transferAccount')}>
              <Input placeholder={trans('inputAccount')} />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={6}
          >
            <Form.Item label={trans('receiveAccount')}>
              <Input placeholder={trans('inputAccount')} />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            md={6}
          >
            <Button type='primary'>{trans('search')}</Button>
          </Col>
        </Row>
      </Form>
      <Table
        columns={columns}
        dataSource={[1, 2, 3]}
        bordered
        scroll={{ x: '100%' }}
      />
    </Card>
  )
}

export default TransfersDetailReport
