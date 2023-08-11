import { Button, Card, Col, Empty, Form, Input, Row, Select, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const RefundManagement = () => {
  const { t: trans } = useTranslation()
  const [object, setObject] = useState(1)

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        align: 'center',
        title: trans`policy-management.payment.applicableObject`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.transactionLevelFrom`} (VNĐ)`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.transactionLevelTo`} (VNĐ)`
      },
      {
        align: 'center',
        title: trans`policy-management.payment.transactionFee`,
        children: [
          {
            align: 'center',
            title: trans`policy-management.payment.fixedChargeMerchant`,
            children: [
              {
                title: `${trans`policy-management.payment.flexibleFee`} (%)`,
                align: 'center'
              },
              {
                title: `${trans`policy-management.payment.fixedCharge`} (VNĐ)`,
                align: 'center'
              },
              {
                title: `${trans`policy-management.payment.minFee`} (VNĐ)`,
                align: 'center'
              },
              {
                title: `${trans`policy-management.payment.maxFee`} (VNĐ)`,
                align: 'center'
              }
            ]
          },
          {
            align: 'center',
            title: trans`policy-management.payment.selectionFee`,
            children: [
              {
                title: `${trans`policy-management.payment.flexibleFee`} (%)`,
                align: 'center'
              },
              {
                title: `${trans`policy-management.payment.fixedCharge`} (VNĐ)`,
                align: 'center'
              },
              {
                title: `${trans`policy-management.payment.minFee`} (VNĐ)`,
                align: 'center'
              },
              {
                title: `${trans`policy-management.payment.maxFee`} (VNĐ)`,
                align: 'center'
              }
            ]
          }
        ]
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.applicableDate`}`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.endDate`}`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.activeEvent`}`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.policyHistory`}`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.edit`}`
      },
      {
        align: 'center',
        title: `${trans`policy-management.payment.cancel`}`
      }
    ],
    []
  )

  const objects = useMemo(
    () => [
      {
        value: 1,
        name: trans`policy-management.payment.system`
      },
      {
        value: 2,
        name: trans`policy-management.payment.personalAccount`
      },
      {
        value: 3,
        name: trans`policy-management.payment.businessAccount`
      },
      {
        value: 4,
        name: trans`policy-management.payment.majorAccount`
      },
      {
        value: 5,
        name: trans`policy-management.payment.accountGroup`
      },
      {
        value: 6,
        name: trans`policy-management.payment.personal`
      }
    ],
    []
  )

  return (
    <Card title={trans`policy-management.payment.title.refund`}>
      <Form initialValues={{ object: 1 }}>
        <Row gutter={16}>
          <Col>
            <Form.Item
              name='object'
              label={trans`policy-management.payment.applicableObject`}
            >
              <Select
                onChange={(value) => setObject(value)}
                style={{ minWidth: 190 }}
              >
                {objects.map((x) => {
                  return (
                    <Select.Option
                      key={x.value}
                      value={x.value}
                    >
                      {x.name}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
          </Col>
          {[5, 6].includes(object) && (
            <Col>
              {object === 5 ? (
                <Form.Item
                  label={trans`policy-management.payment.selectAccountGroup`}
                >
                  <Select>
                    <Select.Option value='all'>{trans`policy-management.placeholders.group-account`}</Select.Option>
                  </Select>
                </Form.Item>
              ) : (
                <Form.Item
                  label={trans`policy-management.payment.inputAccount`}
                >
                  <Input />
                </Form.Item>
              )}
            </Col>
          )}
          {object === 6 && (
            <Col>
              <Button type='primary'>{trans`policy-management.payment.search`}</Button>
            </Col>
          )}
          <Col>
            <Button type='primary'>{trans`policy-management.payment.establish`}</Button>
          </Col>
        </Row>
      </Form>
      <Table
        bordered
        columns={columns}
        scroll={{ x: '100%' }}
        locale={{
          emptyText: <Empty description={trans`labels.table-nodata`} />
        }}
      />
    </Card>
  )
}

export default RefundManagement
