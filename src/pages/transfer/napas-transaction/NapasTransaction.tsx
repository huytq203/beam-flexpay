import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Table
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NapasRefundModal from './refund-modal/NapasRefundModal'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'

const NapasTransaction = () => {
  const { t: trans } = useTranslation()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)

  const toggleOpen = useCallback((value: boolean) => setOpen(value), [])

  const columns = useMemo<ColumnsType<any>>(
    () => [
      {
        align: 'center',
        title: trans`napas-transaction.time`,
        dataIndex: '',
        render: () => <div>12:00:00 12/12/2022</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.transactionCode`,
        dataIndex: '',
        render: () => <div>PM1234</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.bankCode`,
        dataIndex: '',
        render: () => <div>36512345</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.wallet`,
        dataIndex: '',
        render: () => <div>0965856321</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.transactionDesc`,
        dataIndex: '',
        render: () => <div>Mua mã thẻ</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.bank`,
        dataIndex: '',
        render: () => <div>Agribank</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.value`,
        dataIndex: '',
        render: () => <div>10.000.000</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.status`,
        dataIndex: '',
        render: () => <div>Đang xử lý</div>
      },
      {
        align: 'center',
        title: trans`napas-transaction.action`,
        dataIndex: '',
        render: () => (
          <Row
            gutter={GUTTER}
            justify={'center'}
          >
            <Col>
              <Button
                onClick={() => setOpen(true)}
                size='small'
                type='primary'
              >
                {trans`napas-transaction.refund`}
              </Button>
            </Col>
            <Col>
              <Button
                size='small'
                type='primary'
                ghost
              >
                {trans`napas-transaction.query`}
              </Button>
            </Col>
          </Row>
        )
      }
    ],
    []
  )

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <>
              <Form
                form={form}
                layout='vertical'
              >
                <Row gutter={GUTTER}>
                  <Col flex='auto'>
                    <Form.Item
                      label={trans`napas-transaction.transactionCode`}
                      name='transactionCode'
                    >
                      <Input
                        placeholder={
                          trans`napas-transaction.placeholders.inputTransactionCode` ??
                          ''
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='200px'>
                    <Form.Item
                      label={trans`napas-transaction.fromDate`}
                      name='fromDate'
                    >
                      <DatePicker
                        showTime
                        format={TimeFullFormat}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='200px'>
                    <Form.Item
                      label={trans`napas-transaction.endDate`}
                      name='transactionCode'
                    >
                      <DatePicker
                        showTime
                        format={TimeFullFormat}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='200px'>
                    <Form.Item
                      label={trans`napas-transaction.walletNumber`}
                      name='transactionCode'
                    >
                      <Input
                        placeholder={trans`napas-transaction.placeholders.inputWallet`.toString()}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='200px'>
                    <Form.Item
                      label={trans`napas-transaction.bank`}
                      name='transactionCode'
                    >
                      <Select
                        placeholder={trans`napas-transaction.placeholders.selectBank`.toString()}
                      >
                        <Select.Option>Agribank</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col flex='200px'>
                    <Form.Item
                      label={trans`napas-transaction.bankCode`}
                      name='transactionCode'
                    >
                      <Input
                        placeholder={trans`napas-transaction.placeholders.inputBankCode`.toString()}
                      />
                    </Form.Item>
                  </Col>
                  <Col flex='200px'>
                    <Form.Item
                      label={trans`napas-transaction.status`}
                      name='transactionCode'
                    >
                      <Select
                        placeholder={trans`napas-transaction.placeholders.selectStatus`.toString()}
                      >
                        <Select.Option>{trans`napas-transaction.successStatus`}</Select.Option>
                        <Select.Option>{trans`napas-transaction.failStatus`}</Select.Option>
                        <Select.Option>{trans`napas-transaction.processingStatus`}</Select.Option>
                        <Select.Option>{trans`napas-transaction.refund`}</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
              <Row justify='end'>
                <Col>
                  <ButtonSearch />
                </Col>
              </Row>
            </>
          }
        />
      }
    >
      <Table
        dataSource={[1, 2, 3]}
        columns={columns}
        size='small'
      />
      <NapasRefundModal
        open={open}
        toggleOpen={toggleOpen}
      />
    </Card>
  )
}

export default NapasTransaction
