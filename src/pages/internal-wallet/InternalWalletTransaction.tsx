import ButtonSearch from "@components/button-search/ButtonSearch"
import SearchBar from "@components/search-bar/SearchBar"
import { GUTTER } from "@constants/appConstant"
import { TimeFormat } from "@constants/datetime"
import { useGetInternalWalletTransactionsQuery } from "@services/apiInternalWallet"
import { viewMode } from "@type/customer"
import { InternalWallet, InternalWalletTransactionPayload } from "@type/internalWallet"
import { Card, Col, DatePicker, Form, Input, Row, Table } from "antd"
import { ColumnsType } from "antd/es/table"
import moment from "moment"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
  selectedInternalWallet?: InternalWallet
}


function InternalWalletTransaction(props: props) {
  const [form] = Form.useForm()
  const [search, setSearch] = useState<InternalWalletTransactionPayload>({
    order: 'DESC',
    page: 1,
    take: 10,
    query: '',
    orderBy: 'createdAt'
  })

  const { t } = useTranslation()

  useEffect(() => {
    setSearch({
      ...search,
      internalWalletId: props.selectedInternalWallet?.id
    })
  }, [props.selectedInternalWallet])

  const { data: transactionData, refetch } = useGetInternalWalletTransactionsQuery(search)

  const columns: ColumnsType<any> = [
    {
      title: t('internal-wallet.transaction.date'),
      dataIndex: 'transactionDate',
      key: 'transactionDate'
    },
    {
      title: t('internal-wallet.transaction.type'),
      dataIndex: 'type',
      key: 'type',
      render(value) {
        switch (value) {
          case 'NAPAS':
            return t('internal-wallet.fundsOptions.napas')
          case 'LINK_BANK':
            return t('internal-wallet.fundsOptions.bank')
          case 'PAYMENT_GATEWAY':
            return t('internal-wallet.fundsOptions.gate')
          case 'EWALLET':
            return t('internal-wallet.fundsOptions.wallet')
        }

      }
    },
    {
      title: t('internal-wallet.transaction.amount'),
      dataIndex: 'amount',
      key: 'amount'
    },
    {
      title: t('internal-wallet.transaction.note'),
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: t('internal-wallet.transaction.code'),
      dataIndex: 'code',
      key: 'code'
    },
    {
      title: t('internal-wallet.transaction.debitCreditAccount'),
      dataIndex: 'debitCreditAccount',
      key: 'debitCreditAccount'
    },
    {
      title: t('internal-wallet.transaction.afterBalance'),
      dataIndex: 'afterBalance',
      key: 'afterBalance'
    },
  ]

  const handleSearch = () => {

    setSearch({
      ...search,
      startDate: moment(form.getFieldValue("startDate")).format("DD/MM/YYYY HH:mm:ss"),
      endDate: moment(form.getFieldValue("endDate")).format("DD/MM/YYYY HH:mm:ss")
    })
  }

  useEffect(() => {
    refetch()
  }, [search])

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Form
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              form={form}
              layout='horizontal'
            >
              <Row gutter={GUTTER}>
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
        dataSource={transactionData?.data ?? []}
        rowKey='id'
        size='middle'
        bordered
        pagination={{
          current: transactionData?.meta.page,
          pageSize: transactionData?.meta.take,
          total: transactionData?.meta.itemCount,
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
  )
}

export default InternalWalletTransaction