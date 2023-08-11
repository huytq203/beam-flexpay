import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useToggle } from 'ahooks'
import {
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select
} from 'antd'
import Table, { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function InternalBalanceWalletHistory({
  record,
  isShow,
  onCancel,
  title
}: props) {
  const [form] = Form.useForm()
  const { t } = useTranslation()
  const [search, setSearch] = useState({})
  const [addForm, { toggle: addFormToggle }] = useToggle()

  const columns: ColumnsType<any> = [
    {
      title: t('internalBalanceWallet.date'),
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: t('internalBalanceWallet.transactionType'),
      dataIndex: 'transactionType',
      key: 'transactionType'
    },
    {
      title: t('internalBalanceWallet.amount'),
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: t('internalBalanceWallet.transactionContent'),
      dataIndex: 'transactionContent',
      key: 'transactionContent'
    },
    {
      title: t('internalBalanceWallet.transactionNumber'),
      dataIndex: 'transactionNumber',
      key: 'transactionNumber'
    },
    {
      title: t('internalBalanceWallet.debitCreditAccount'),
      dataIndex: 'debitCreditAccount',
      key: 'debitCreditAccount'
    },
    {
      title: t('partner.balance'),
      dataIndex: 'balance',
      key: 'balance'
    }
  ]

  const handleSearch = () =>
    setSearch({
      ...search,
      ...form.getFieldsValue()
    })

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
    >
      <Card
        title={
          <SearchBar
            headerMenu={
              <Form form={form}>
                <Row>
                  <Col>
                    {/* Ngày cập nhật - từ ngày */}
                    <Form.Item
                      name='startDate'
                      label={t('labels.startDate')}
                    >
                      <DatePicker
                        format={TimeFormat}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    {/* Ngày cập nhật - đến ngày */}
                    <Form.Item
                      name='endDate'
                      label={t('labels.endDate')}
                    >
                      <DatePicker
                        format={TimeFormat}
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row
                  justify='end'
                  gutter={GUTTER}
                >
                  <Col>
                    <ButtonAdd
                      module='internal-wallet'
                      onClick={addFormToggle}
                    />
                  </Col>
                  <Col>
                    <ButtonSearch onClick={handleSearch} />
                  </Col>
                </Row>
              </Form>
            }
          />
        }
      >
        <Table
          columns={columns}
          dataSource={[]}
          scroll={{ x: '100%' }}
          rowKey='id'
          size='small'
          // loading={isLoading}
          locale={{
            emptyText: (
              <>
                <Empty description={t`nodata`} />
              </>
            )
          }}
          pagination={{
            current: 1, // partners?.meta.page,
            pageSize: 10, // partners?.meta.take,
            total: 20, //partners?.meta.itemCount,
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
    </Modal>
  )
}

export default InternalBalanceWalletHistory
