import ButtonExcel from '@components/button-excel/ButtonExcel'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Row,
  Table
} from 'antd'
import { useTranslation } from 'react-i18next'
import { SearchOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { ColumnsType } from 'antd/es/table'
import CellContent from '@components/cell-content/CellContent'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'

function WalletAccount() {
  const { t } = useTranslation()
  const [search, setSearch] = useState({ page: 1, take: 10 })

  const columns: ColumnsType<any> = [
    {
      title: t`bank-system-wallet.table.no`,
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      render: (record) => <CellContent content={record} />
    },
    {
      title: t`bank-system-wallet.table.date`,
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (record) => <CellContent content={record} />
    },
    {
      title: t`bank-system-wallet.table.wallet-count`,
      dataIndex: 'date',
      key: 'wallet-count',
      align: 'center',
      render: (record) => <CellContent content={record} />
    },
    {
      title: t`bank-system-wallet.table.transfer`,
      dataIndex: 'no',
      key: 'transfer',
      align: 'center',
      children: [
        {
          title: t`bank-system-wallet.table.amount`,
          dataIndex: 'no',
          key: 'amount-wallet',
          align: 'center',
          render: (record) => <CellContent content={record} />
        },
        {
          title: t`bank-system-wallet.table.value`,
          dataIndex: 'no',
          key: 'value-wallet',
          align: 'center',
          render: (record) => <CellContent content={record} />
        }
      ]
    },
    {
      title: t`bank-system-wallet.table.out-coming-transfer`,
      dataIndex: 'no',
      key: 'out-coming-transfer',
      align: 'center',
      children: [
        {
          title: t`bank-system-wallet.table.amount`,
          dataIndex: 'no',
          key: 'amount-transfer',
          align: 'center',
          render: (record) => <CellContent content={record} />
        },
        {
          title: t`bank-system-wallet.table.value`,
          dataIndex: 'no',
          key: 'value-transfer',
          align: 'center',
          render: (record) => <CellContent content={record} />
        }
      ]
    },
    {
      title: t`bank-system-wallet.table.balance-system`,
      dataIndex: 'no',
      key: 'balance-system',
      align: 'center',
      render: (record) => <CellContent content={record} />
    }
  ]

  return (
    <div className='wallet-account'>
      <Card title={t`bank-system-wallet.title`}>
        <Form layout='vertical'>
          <Row gutter={GUTTER}>
            <Col
              sm={24}
              lg={8}
            >
              <Form.Item label={t`bank-system-wallet.from`}>
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  placeholder={t`bank-system-wallet.placeholders.from`.toString()}
                  className='w-100'
                />
              </Form.Item>
            </Col>
            <Col
              sm={24}
              lg={8}
            >
              <Form.Item label={t`bank-system-wallet.to`}>
                <DatePicker
                  format={TimeFormat}
                  allowClear
                  placeholder={t`bank-system-wallet.placeholders.to`.toString()}
                  className='w-100'
                />
              </Form.Item>
            </Col>
            <Col
              sm={24}
              lg={8}
            >
              <Form.Item label=''>
                <div className='text-end mt-30'>
                  <Button
                    className='mr-10'
                    type='primary'
                    ghost
                    icon={<SearchOutlined />}
                    htmlType='submit'
                  >{t`buttons.search`}</Button>
                  <ButtonExcel
                    module='state_bank_report'
                    type='primary'
                  >{t`buttons.add`}</ButtonExcel>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Divider className='mt-20' />
        <Table
          columns={columns}
          dataSource={[]}
          scroll={{ x: '100%' }}
          rowKey='id'
          size='small'
          pagination={{
            current: 1,
            pageSize: 10,
            total: 1,
            showSizeChanger: false,
            onChange(page) {
              setSearch({
                ...search,
                page
              })
            }
          }}
        />
      </Card>
    </div>
  )
}
export default WalletAccount
